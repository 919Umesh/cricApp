/**
 * Performance analyzer — turns match data into "incidents" worth satirizing.
 */
import type { Match } from "@/lib/types";
import { parseScorecard } from "@/lib/types";

export type IncidentType =
  | "golden-duck"
  | "duck"
  | "collapse"
  | "slow-crawl"
  | "heartbreak-loss"
  | "nervous-nineties"
  | "heist-win";

export interface Incident {
  type: IncidentType;
  matchId: string;
  opponent: string;
  playerName: string | null;
  severity: number; // 1–10, higher = more meme-worthy
  details: string;
}

export function analyzeMatch(match: Match): Incident[] {
  const incidents: Incident[] = [];
  const scorecard = parseScorecard(match.scorecard);

  if (scorecard?.nepal.batting) {
    for (const entry of scorecard.nepal.batting) {
      if (entry.runs === 0 && entry.balls <= 1 && !/not out/i.test(entry.dismissal)) {
        incidents.push({
          type: "golden-duck",
          matchId: match.$id,
          opponent: match.opponent,
          playerName: entry.player,
          severity: 9,
          details: `${entry.player} departed first ball vs ${match.opponent} — ${entry.dismissal}.`,
        });
      } else if (entry.runs === 0 && entry.balls > 1 && !/not out/i.test(entry.dismissal)) {
        incidents.push({
          type: "duck",
          matchId: match.$id,
          opponent: match.opponent,
          playerName: entry.player,
          severity: 6,
          details: `${entry.player} crafted a ${entry.balls}-ball duck vs ${match.opponent}.`,
        });
      }

      if (entry.balls >= 15 && entry.runs / entry.balls < 0.6) {
        incidents.push({
          type: "slow-crawl",
          matchId: match.$id,
          opponent: match.opponent,
          playerName: entry.player,
          severity: 5,
          details: `${entry.player} ground out ${entry.runs} off ${entry.balls} balls vs ${match.opponent} — strike rate ${Math.round((entry.runs / entry.balls) * 100)}.`,
        });
      }

      if (entry.runs >= 90 && entry.runs < 100 && !/not out/i.test(entry.dismissal)) {
        incidents.push({
          type: "nervous-nineties",
          matchId: match.$id,
          opponent: match.opponent,
          playerName: entry.player,
          severity: 8,
          details: `${entry.player} fell for ${entry.runs} vs ${match.opponent}. The nervous nineties claim another.`,
        });
      }
    }

    // Collapse detection: all-out cheaply or many soft dismissals in one card.
    const dismissed = scorecard.nepal.batting.filter(
      (b) => !/not out/i.test(b.dismissal),
    ).length;
    const totalRuns = scorecard.nepal.batting.reduce((sum, b) => sum + b.runs, 0);
    if (dismissed >= 6 && totalRuns < 120) {
      incidents.push({
        type: "collapse",
        matchId: match.$id,
        opponent: match.opponent,
        playerName: null,
        severity: 10,
        details: `${dismissed} wickets evaporated for roughly ${totalRuns} batting runs vs ${match.opponent}. Total: ${scorecard.nepal.total}.`,
      });
    }
  }

  if (match.result === "lost") {
    incidents.push({
      type: "heartbreak-loss",
      matchId: match.$id,
      opponent: match.opponent,
      playerName: null,
      severity: 7,
      details: `Nepal ${match.nepalScore ?? "—"} vs ${match.opponent} ${match.opponentScore ?? "—"}. ${match.summary ?? ""}`.trim(),
    });
  }

  if (match.result === "won") {
    incidents.push({
      type: "heist-win",
      matchId: match.$id,
      opponent: match.opponent,
      playerName: null,
      severity: 5,
      details: `Nepal beat ${match.opponent}. ${match.summary ?? "Cardiology departments on standby."}`.trim(),
    });
  }

  return incidents;
}

/** Highest-severity first, capped to keep daily output sane. */
export function rankIncidents(incidents: Incident[], cap = 5): Incident[] {
  return [...incidents].sort((a, b) => b.severity - a.severity).slice(0, cap);
}
