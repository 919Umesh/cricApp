import "server-only";
import { Query } from "node-appwrite";
import { TABLES } from "@/lib/appwrite/config";
import { DB, safeList } from "./base";

export interface AdminStats {
  players: number;
  posts: number;
  publishedPosts: number;
  pendingPosts: number;
  memes: number;
  pendingMemes: number;
  reactions: number;
  pendingReactions: number;
  subscribers: number;
  matches: number;
}

async function count(tableId: string, queries: string[] = []): Promise<number> {
  const { total } = await safeList((tables) =>
    tables.listRows({
      databaseId: DB,
      tableId,
      queries: [...queries, Query.limit(1)],
    }),
  );
  return total;
}

/** Live counts for the admin dashboard — intentionally uncached. */
export async function getAdminStats(): Promise<AdminStats> {
  const [
    players,
    posts,
    publishedPosts,
    pendingPosts,
    memes,
    pendingMemes,
    reactions,
    pendingReactions,
    subscribers,
    matches,
  ] = await Promise.all([
    count(TABLES.PLAYERS),
    count(TABLES.SATIRE_POSTS),
    count(TABLES.SATIRE_POSTS, [Query.equal("status", "published")]),
    count(TABLES.SATIRE_POSTS, [Query.equal("status", "pending")]),
    count(TABLES.MEMES),
    count(TABLES.MEMES, [Query.equal("status", "pending")]),
    count(TABLES.FAN_REACTIONS),
    count(TABLES.FAN_REACTIONS, [Query.equal("status", "pending")]),
    count(TABLES.SUBSCRIBERS),
    count(TABLES.MATCHES),
  ]);

  return {
    players,
    posts,
    publishedPosts,
    pendingPosts,
    memes,
    pendingMemes,
    reactions,
    pendingReactions,
    subscribers,
    matches,
  };
}
