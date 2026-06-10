import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { Query } from "node-appwrite";
import { TABLES } from "@/lib/appwrite/config";
import type { PostStatus, SatireCategory, SatirePost } from "@/lib/types";
import { CACHE_TAGS, DB, safeList } from "./base";

export async function listPublishedPosts(options?: {
  category?: SatireCategory;
  playerId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; rows: SatirePost[] }> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.posts);

  const queries: string[] = [
    Query.equal("status", "published"),
    Query.orderDesc("$createdAt"),
    Query.limit(options?.limit ?? 12),
    Query.offset(options?.offset ?? 0),
  ];
  if (options?.category) queries.push(Query.equal("category", options.category));
  if (options?.playerId) queries.push(Query.equal("playerId", options.playerId));

  return safeList<SatirePost>((tables) =>
    tables.listRows({ databaseId: DB, tableId: TABLES.SATIRE_POSTS, queries }),
  );
}

export async function listFeaturedPosts(limit = 3): Promise<SatirePost[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.posts);

  const { rows } = await safeList<SatirePost>((tables) =>
    tables.listRows({
      databaseId: DB,
      tableId: TABLES.SATIRE_POSTS,
      queries: [
        Query.equal("status", "published"),
        Query.equal("featured", true),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ],
    }),
  );
  return rows;
}

export async function listTrendingPosts(limit = 6): Promise<SatirePost[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.posts);

  const { rows } = await safeList<SatirePost>((tables) =>
    tables.listRows({
      databaseId: DB,
      tableId: TABLES.SATIRE_POSTS,
      queries: [
        Query.equal("status", "published"),
        Query.orderDesc("views"),
        Query.limit(limit),
      ],
    }),
  );
  return rows;
}

export async function getPostBySlug(slug: string): Promise<SatirePost | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.posts, `post-${slug}`);

  const { rows } = await safeList<SatirePost>((tables) =>
    tables.listRows({
      databaseId: DB,
      tableId: TABLES.SATIRE_POSTS,
      queries: [Query.equal("slug", slug), Query.limit(1)],
    }),
  );
  return rows[0] ?? null;
}

export async function listAllPostSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.posts);

  const { rows } = await safeList<SatirePost>((tables) =>
    tables.listRows({
      databaseId: DB,
      tableId: TABLES.SATIRE_POSTS,
      queries: [Query.equal("status", "published"), Query.limit(500)],
    }),
  );
  return rows.map((p) => p.slug);
}

/** Admin views — uncached so moderation queues are always fresh. */
export async function listPostsByStatus(
  status?: PostStatus,
  limit = 50,
): Promise<{ total: number; rows: SatirePost[] }> {
  const queries: string[] = [Query.orderDesc("$createdAt"), Query.limit(limit)];
  if (status) queries.unshift(Query.equal("status", status));
  return safeList<SatirePost>((tables) =>
    tables.listRows({ databaseId: DB, tableId: TABLES.SATIRE_POSTS, queries }),
  );
}
