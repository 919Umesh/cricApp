"use server";

import { TABLES, hasServerCredentials } from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { DB } from "@/lib/services/base";

/**
 * Increment a post's view counter. Deliberately does NOT revalidate the
 * posts cache — displayed view counts refresh on the next natural
 * revalidation window instead of nuking the cache on every page view.
 */
export async function trackPostView(postId: string): Promise<void> {
  if (!hasServerCredentials()) return;
  try {
    const { tables } = createAdminClient();
    await tables.incrementRowColumn({
      databaseId: DB,
      tableId: TABLES.SATIRE_POSTS,
      rowId: postId,
      column: "views",
      value: 1,
    });
  } catch {
    // Non-critical.
  }
}
