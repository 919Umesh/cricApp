import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { Query } from "node-appwrite";
import { TABLES } from "@/lib/appwrite/config";
import type { Player } from "@/lib/types";
import { CACHE_TAGS, DB, safeList } from "./base";

export async function listPlayers(options?: {
  role?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; rows: Player[] }> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.players);

  const queries: string[] = [
    Query.orderDesc("memeScore"),
    Query.limit(options?.limit ?? 50),
    Query.offset(options?.offset ?? 0),
  ];
  if (options?.role) queries.push(Query.equal("role", options.role));
  if (options?.search) queries.push(Query.search("name", options.search));

  return safeList<Player>((tables) =>
    tables.listRows({ databaseId: DB, tableId: TABLES.PLAYERS, queries }),
  );
}

export async function getPlayerBySlug(slug: string): Promise<Player | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.players, `player-${slug}`);

  const { rows } = await safeList<Player>((tables) =>
    tables.listRows({
      databaseId: DB,
      tableId: TABLES.PLAYERS,
      queries: [Query.equal("slug", slug), Query.limit(1)],
    }),
  );
  return rows[0] ?? null;
}

export async function getPlayersByIds(ids: string[]): Promise<Map<string, Player>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return new Map();
  const { rows } = await listPlayers({ limit: 100 });
  const map = new Map<string, Player>();
  for (const player of rows) {
    if (unique.includes(player.$id)) map.set(player.$id, player);
  }
  return map;
}

export async function listTrendingPlayers(limit = 4): Promise<Player[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.players);

  const { rows } = await safeList<Player>((tables) =>
    tables.listRows({
      databaseId: DB,
      tableId: TABLES.PLAYERS,
      queries: [
        Query.equal("trending", true),
        Query.orderDesc("memeScore"),
        Query.limit(limit),
      ],
    }),
  );
  return rows;
}

export async function listAllPlayerSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.players);

  const { rows } = await safeList<Player>((tables) =>
    tables.listRows({
      databaseId: DB,
      tableId: TABLES.PLAYERS,
      queries: [Query.limit(200)],
    }),
  );
  return rows.map((p) => p.slug);
}
