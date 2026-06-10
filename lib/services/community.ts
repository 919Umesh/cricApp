import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { Query } from "node-appwrite";
import { TABLES } from "@/lib/appwrite/config";
import type { FanReaction, Poll, Ranking, RankingCategory } from "@/lib/types";
import { CACHE_TAGS, DB, safeList } from "./base";

export async function listReactions(options?: {
  playerId?: string;
  postId?: string;
  limit?: number;
}): Promise<FanReaction[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.reactions);

  const queries: string[] = [
    Query.equal("status", "published"),
    Query.orderDesc("$createdAt"),
    Query.limit(options?.limit ?? 12),
  ];
  if (options?.playerId) queries.push(Query.equal("playerId", options.playerId));
  if (options?.postId) queries.push(Query.equal("postId", options.postId));

  const { rows } = await safeList<FanReaction>((tables) =>
    tables.listRows({ databaseId: DB, tableId: TABLES.FAN_REACTIONS, queries }),
  );
  return rows;
}

/** Admin moderation queue — uncached. */
export async function listPendingReactions(limit = 50): Promise<FanReaction[]> {
  const { rows } = await safeList<FanReaction>((tables) =>
    tables.listRows({
      databaseId: DB,
      tableId: TABLES.FAN_REACTIONS,
      queries: [
        Query.equal("status", "pending"),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ],
    }),
  );
  return rows;
}

export async function listRankings(category?: RankingCategory): Promise<Ranking[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.rankings);

  const queries: string[] = [Query.orderDesc("score"), Query.limit(50)];
  if (category) queries.unshift(Query.equal("category", category));

  const { rows } = await safeList<Ranking>((tables) =>
    tables.listRows({ databaseId: DB, tableId: TABLES.RANKINGS, queries }),
  );
  return rows;
}

export async function listActivePolls(limit = 3): Promise<Poll[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.polls);

  const { rows } = await safeList<Poll>((tables) =>
    tables.listRows({
      databaseId: DB,
      tableId: TABLES.POLLS,
      queries: [
        Query.equal("active", true),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ],
    }),
  );
  return rows;
}
