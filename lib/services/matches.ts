import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { Query } from "node-appwrite";
import { TABLES } from "@/lib/appwrite/config";
import type { Match } from "@/lib/types";
import { CACHE_TAGS, DB, safeList } from "./base";

export async function listRecentMatches(limit = 10): Promise<Match[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.matches);

  const { rows } = await safeList<Match>((tables) =>
    tables.listRows({
      databaseId: DB,
      tableId: TABLES.MATCHES,
      queries: [
        Query.equal("result", ["won", "lost", "tied", "no-result", "live"]),
        Query.orderDesc("date"),
        Query.limit(limit),
      ],
    }),
  );
  return rows;
}

export async function listUpcomingMatches(limit = 5): Promise<Match[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.matches);

  const { rows } = await safeList<Match>((tables) =>
    tables.listRows({
      databaseId: DB,
      tableId: TABLES.MATCHES,
      queries: [
        Query.equal("result", "upcoming"),
        Query.orderAsc("date"),
        Query.limit(limit),
      ],
    }),
  );
  return rows;
}

export async function listMatchDisasters(limit = 4): Promise<Match[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.matches);

  const { rows } = await safeList<Match>((tables) =>
    tables.listRows({
      databaseId: DB,
      tableId: TABLES.MATCHES,
      queries: [
        Query.equal("result", "lost"),
        Query.orderDesc("date"),
        Query.limit(limit),
      ],
    }),
  );
  return rows;
}
