/**
 * Content pipeline orchestrator.
 *
 *  1. Fetch recent Nepal matches from external sources (API/RSS).
 *  2. Upsert them into the matches table.
 *  3. Analyze the last 14 days of matches for satire-worthy incidents.
 *  4. Generate posts + fan reactions, bump player meme scores, refresh
 *     monthly rankings.
 *
 * Deterministic row IDs make the whole pipeline idempotent: re-running a day
 * never duplicates content.
 */
import { Query } from "node-appwrite";
import { TABLES, hasServerCredentials } from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { DB } from "@/lib/services/base";
import type { Match, Player } from "@/lib/types";
import { analyzeMatch, rankIncidents, type Incident } from "./analyzer";
import {
  generatePost,
  generateReactions,
  hashString,
  memeScoreDelta,
} from "./generator";
import { fetchExternalMatches } from "./sources";

export interface PipelineReport {
  matchesFetched: number;
  matchesProcessed: number;
  incidentsFound: number;
  postsCreated: number;
  reactionsCreated: number;
  playersUpdated: number;
}

function isConflict(err: unknown): boolean {
  return (err as { code?: number }).code === 409;
}

export async function runIngestionPipeline(): Promise<PipelineReport> {
  if (!hasServerCredentials()) {
    throw new Error("Appwrite API key is not configured — pipeline cannot run.");
  }

  const { tables } = createAdminClient();
  const autoPublish = process.env.AUTO_PUBLISH_GENERATED !== "false";
  const report: PipelineReport = {
    matchesFetched: 0,
    matchesProcessed: 0,
    incidentsFound: 0,
    postsCreated: 0,
    reactionsCreated: 0,
    playersUpdated: 0,
  };

  // 1. Pull external data and upsert matches.
  const external = await fetchExternalMatches();
  report.matchesFetched = external.length;
  for (const m of external) {
    const rowId = `ext-${(hashString(m.externalId) % 1_000_000_000).toString(36)}`;
    try {
      await tables.createRow({
        databaseId: DB,
        tableId: TABLES.MATCHES,
        rowId,
        data: {
          opponent: m.opponent,
          date: m.date,
          result: m.result,
          format: m.format,
          venue: m.venue,
          nepalScore: m.nepalScore,
          opponentScore: m.opponentScore,
          scorecard:
            m.batting.length > 0
              ? JSON.stringify({
                  nepal: { total: m.nepalScore ?? "?", overs: "?", batting: m.batting },
                  opponent: { total: m.opponentScore ?? "?", overs: "?" },
                })
              : null,
          summary: m.summary,
          funnyAnalysis: null,
        },
      });
    } catch (err) {
      if (!isConflict(err)) throw err;
      // Known match — refresh the live fields.
      await tables.updateRow({
        databaseId: DB,
        tableId: TABLES.MATCHES,
        rowId,
        data: {
          result: m.result,
          nepalScore: m.nepalScore,
          opponentScore: m.opponentScore,
          summary: m.summary,
        },
      });
    }
  }

  // 2. Analyze the recent window (covers freshly ingested + manual matches).
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const recent = await tables.listRows({
    databaseId: DB,
    tableId: TABLES.MATCHES,
    queries: [
      Query.greaterThan("date", since),
      Query.equal("result", ["won", "lost", "tied", "no-result"]),
      Query.orderDesc("date"),
      Query.limit(25),
    ],
  });
  const matches = recent.rows as unknown as Match[];
  report.matchesProcessed = matches.length;

  const incidents: Incident[] = rankIncidents(matches.flatMap(analyzeMatch));
  report.incidentsFound = incidents.length;
  if (incidents.length === 0) return report;

  // Player lookup for linking generated content + meme scores.
  const playersRes = await tables.listRows({
    databaseId: DB,
    tableId: TABLES.PLAYERS,
    queries: [Query.limit(200)],
  });
  const players = playersRes.rows as unknown as Player[];
  const byName = new Map(players.map((p) => [p.name.toLowerCase(), p]));

  const dateKey = new Date().toISOString().slice(0, 10);
  const period = dateKey.slice(0, 7);
  const touchedPlayers = new Map<string, number>();

  // 3. Generate posts and reactions.
  for (const incident of incidents) {
    const player = incident.playerName
      ? (byName.get(incident.playerName.toLowerCase()) ?? null)
      : null;

    const post = generatePost(incident, dateKey);
    try {
      await tables.createRow({
        databaseId: DB,
        tableId: TABLES.SATIRE_POSTS,
        rowId: post.id,
        data: {
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          playerId: player?.$id ?? null,
          matchId: post.matchId,
          category: post.category,
          image: null,
          status: autoPublish ? "published" : "pending",
          featured: false,
          views: 0,
          likes: 0,
          source: "auto",
        },
      });
      report.postsCreated += 1;
    } catch (err) {
      if (!isConflict(err)) throw err;
    }

    for (const reaction of generateReactions(incident)) {
      try {
        await tables.createRow({
          databaseId: DB,
          tableId: TABLES.FAN_REACTIONS,
          rowId: reaction.id,
          data: {
            username: reaction.username,
            reaction: reaction.reaction,
            playerId: player?.$id ?? null,
            postId: post.id,
            likes: 0,
            status: autoPublish ? "published" : "pending",
          },
        });
        report.reactionsCreated += 1;
      } catch (err) {
        if (!isConflict(err)) throw err;
      }
    }

    if (player) {
      touchedPlayers.set(
        player.$id,
        (touchedPlayers.get(player.$id) ?? 0) + memeScoreDelta(incident.type),
      );
    }
  }

  // 4. Meme scores + trending flags.
  for (const [playerId, delta] of touchedPlayers) {
    await tables.incrementRowColumn({
      databaseId: DB,
      tableId: TABLES.PLAYERS,
      rowId: playerId,
      column: "memeScore",
      value: delta,
      max: 100,
    });
    await tables.updateRow({
      databaseId: DB,
      tableId: TABLES.PLAYERS,
      rowId: playerId,
      data: { trending: true },
    });
    report.playersUpdated += 1;
  }

  // 5. Monthly rankings refresh from the strongest incidents.
  for (const incident of incidents.filter((i) => i.severity >= 7)) {
    const player = incident.playerName
      ? (byName.get(incident.playerName.toLowerCase()) ?? null)
      : null;
    if (!player) continue;
    const category =
      incident.type === "golden-duck" || incident.type === "duck"
        ? "unluckiest-player"
        : incident.type === "collapse" || incident.type === "heartbreak-loss"
          ? "biggest-collapse"
          : "meme-king";
    try {
      await tables.createRow({
        databaseId: DB,
        tableId: TABLES.RANKINGS,
        rowId: `auto-${category}-${player.$id}-${period}`.slice(0, 36),
        data: {
          title: incident.details.slice(0, 140),
          category,
          playerId: player.$id,
          score: incident.severity * 10,
          reason: incident.details.slice(0, 290),
          period,
        },
      });
    } catch (err) {
      if (!isConflict(err)) throw err;
    }
  }

  return report;
}
