import "server-only";
import { TablesDB } from "node-appwrite";
import { appwriteConfig, hasServerCredentials } from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";

export const CACHE_TAGS = {
  players: "players",
  posts: "posts",
  memes: "memes",
  matches: "matches",
  reactions: "reactions",
  rankings: "rankings",
  polls: "polls",
} as const;

let cachedTables: TablesDB | null = null;

export function getTables(): TablesDB | null {
  if (!hasServerCredentials()) return null;
  if (!cachedTables) cachedTables = createAdminClient().tables;
  return cachedTables;
}

export const DB = appwriteConfig.databaseId;

interface RowListLike {
  total: number;
  rows: unknown[];
}

/**
 * node-appwrite returns rows as null-prototype objects, which React refuses
 * to pass across the server→client component boundary. Re-serialize to
 * guaranteed-plain objects.
 */
function toPlain<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Run a TablesDB list query, returning an empty result when Appwrite is
 * unconfigured or unreachable so pages render with empty states instead of
 * crashing.
 */
export async function safeList<T>(
  fn: (tables: TablesDB) => Promise<RowListLike>,
): Promise<{ total: number; rows: T[] }> {
  const tables = getTables();
  if (!tables) return { total: 0, rows: [] };
  try {
    const res = await fn(tables);
    return { total: res.total, rows: toPlain<T[]>(res.rows) };
  } catch (err) {
    console.error("[appwrite] list failed:", (err as Error).message);
    return { total: 0, rows: [] };
  }
}

export async function safeGet<T>(
  fn: (tables: TablesDB) => Promise<unknown>,
): Promise<T | null> {
  const tables = getTables();
  if (!tables) return null;
  try {
    return toPlain<T>(await fn(tables));
  } catch {
    return null;
  }
}
