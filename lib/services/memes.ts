import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { Query } from "node-appwrite";
import { TABLES } from "@/lib/appwrite/config";
import type { Meme } from "@/lib/types";
import { CACHE_TAGS, DB, safeList } from "./base";

export type MemeSort = "latest" | "liked" | "shared";

export async function listMemes(options?: {
  sort?: MemeSort;
  playerId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; rows: Meme[] }> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.memes);

  const order =
    options?.sort === "liked"
      ? Query.orderDesc("likes")
      : options?.sort === "shared"
        ? Query.orderDesc("shares")
        : Query.orderDesc("$createdAt");

  const queries: string[] = [
    Query.equal("status", "published"),
    order,
    Query.limit(options?.limit ?? 12),
    Query.offset(options?.offset ?? 0),
  ];
  if (options?.playerId) queries.push(Query.equal("playerId", options.playerId));

  return safeList<Meme>((tables) =>
    tables.listRows({ databaseId: DB, tableId: TABLES.MEMES, queries }),
  );
}

/** Admin moderation queue — uncached. */
export async function listPendingMemes(limit = 50): Promise<Meme[]> {
  const { rows } = await safeList<Meme>((tables) =>
    tables.listRows({
      databaseId: DB,
      tableId: TABLES.MEMES,
      queries: [
        Query.equal("status", "pending"),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ],
    }),
  );
  return rows;
}
