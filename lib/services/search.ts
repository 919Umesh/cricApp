import "server-only";
import { Query } from "node-appwrite";
import { TABLES } from "@/lib/appwrite/config";
import type { Meme, Player, SatirePost } from "@/lib/types";
import { DB, safeList } from "./base";

export interface SearchResults {
  players: Player[];
  posts: SatirePost[];
  memes: Meme[];
}

/**
 * Full-text search across players, posts and memes. Uncached: it depends on
 * a user-supplied query string and Appwrite handles it quickly.
 */
export async function searchEverything(term: string): Promise<SearchResults> {
  const trimmed = term.trim();
  if (trimmed.length < 2) return { players: [], posts: [], memes: [] };

  const [players, posts, memes] = await Promise.all([
    safeList<Player>((tables) =>
      tables.listRows({
        databaseId: DB,
        tableId: TABLES.PLAYERS,
        queries: [Query.search("name", trimmed), Query.limit(8)],
      }),
    ),
    safeList<SatirePost>((tables) =>
      tables.listRows({
        databaseId: DB,
        tableId: TABLES.SATIRE_POSTS,
        queries: [
          Query.search("title", trimmed),
          Query.equal("status", "published"),
          Query.limit(10),
        ],
      }),
    ),
    safeList<Meme>((tables) =>
      tables.listRows({
        databaseId: DB,
        tableId: TABLES.MEMES,
        queries: [
          Query.search("title", trimmed),
          Query.equal("status", "published"),
          Query.limit(8),
        ],
      }),
    ),
  ]);

  return { players: players.rows, posts: posts.rows, memes: memes.rows };
}
