"use server";

import { updateTag } from "next/cache";
import { ID } from "node-appwrite";
import { BUCKETS, TABLES, hasServerCredentials } from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { requireAdmin } from "@/lib/auth";
import { runIngestionPipeline } from "@/lib/ingestion/pipeline";
import { CACHE_TAGS, DB } from "@/lib/services/base";
import { playerSchema, rankingSchema, satirePostSchema } from "@/lib/validation";

export interface AdminActionState {
  ok: boolean;
  message: string;
}

const FAIL = (msg: string): AdminActionState => ({ ok: false, message: msg });
const OK = (msg: string): AdminActionState => ({ ok: true, message: msg });

async function uploadImage(
  formData: FormData,
  field: string,
  bucketId: string,
): Promise<string | null> {
  const file = formData.get(field);
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 10 * 1024 * 1024) throw new Error("Max file size is 10 MB");
  const { storage } = createAdminClient();
  const fileId = ID.unique();
  await storage.createFile({ bucketId, fileId, file });
  return `${bucketId}:${fileId}`;
}

// ── Players ──────────────────────────────────────────────────────────────────

export async function savePlayer(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  if (!hasServerCredentials()) return FAIL("Appwrite API key is not configured.");

  const parsed = playerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return FAIL(parsed.error.issues[0]?.message ?? "Invalid input");

  const rowId = (formData.get("rowId") as string) || null;
  try {
    const image = await uploadImage(formData, "image", BUCKETS.PLAYER_IMAGES);
    const stats = (formData.get("stats") as string) || "{}";
    JSON.parse(stats); // validate JSON before writing

    const data: Record<string, unknown> = {
      name: parsed.data.name,
      slug: parsed.data.slug,
      role: parsed.data.role,
      battingStyle: parsed.data.battingStyle || null,
      bowlingStyle: parsed.data.bowlingStyle || null,
      team: parsed.data.team,
      bio: parsed.data.bio || null,
      stats,
      memeScore: parsed.data.memeScore,
      fanScore: parsed.data.fanScore,
      trending: formData.get("trending") === "on" || formData.get("trending") === "true",
      currentForm: parsed.data.currentForm || null,
    };
    if (image) data.image = image;

    const { tables } = createAdminClient();
    if (rowId) {
      await tables.updateRow({ databaseId: DB, tableId: TABLES.PLAYERS, rowId, data });
    } else {
      await tables.createRow({
        databaseId: DB,
        tableId: TABLES.PLAYERS,
        rowId: parsed.data.slug,
        data,
      });
    }
    updateTag(CACHE_TAGS.players);
    return OK(rowId ? "Player updated." : "Player created.");
  } catch (err) {
    return FAIL((err as Error).message || "Could not save player.");
  }
}

export async function deletePlayer(rowId: string): Promise<AdminActionState> {
  await requireAdmin();
  if (!hasServerCredentials()) return FAIL("Appwrite API key is not configured.");
  try {
    const { tables } = createAdminClient();
    await tables.deleteRow({ databaseId: DB, tableId: TABLES.PLAYERS, rowId });
    updateTag(CACHE_TAGS.players);
    return OK("Player deleted. Retired hurt, permanently.");
  } catch (err) {
    return FAIL((err as Error).message);
  }
}

// ── Satire posts ─────────────────────────────────────────────────────────────

export async function savePost(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  if (!hasServerCredentials()) return FAIL("Appwrite API key is not configured.");

  const parsed = satirePostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return FAIL(parsed.error.issues[0]?.message ?? "Invalid input");

  const rowId = (formData.get("rowId") as string) || null;
  try {
    const image = await uploadImage(formData, "image", BUCKETS.POST_IMAGES);
    const data: Record<string, unknown> = {
      title: parsed.data.title,
      slug: parsed.data.slug,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt || null,
      category: parsed.data.category,
      playerId: parsed.data.playerId || null,
      status: parsed.data.status,
      featured: formData.get("featured") === "on" || formData.get("featured") === "true",
      source: "manual",
    };
    if (image) data.image = image;

    const { tables } = createAdminClient();
    if (rowId) {
      await tables.updateRow({ databaseId: DB, tableId: TABLES.SATIRE_POSTS, rowId, data });
    } else {
      await tables.createRow({
        databaseId: DB,
        tableId: TABLES.SATIRE_POSTS,
        rowId: ID.unique(),
        data: { ...data, views: 0, likes: 0 },
      });
    }
    updateTag(CACHE_TAGS.posts);
    return OK(rowId ? "Post updated." : "Post created.");
  } catch (err) {
    return FAIL((err as Error).message || "Could not save post.");
  }
}

export async function deletePost(rowId: string): Promise<AdminActionState> {
  await requireAdmin();
  if (!hasServerCredentials()) return FAIL("Appwrite API key is not configured.");
  try {
    const { tables } = createAdminClient();
    await tables.deleteRow({ databaseId: DB, tableId: TABLES.SATIRE_POSTS, rowId });
    updateTag(CACHE_TAGS.posts);
    return OK("Post deleted.");
  } catch (err) {
    return FAIL((err as Error).message);
  }
}

export async function setPostStatus(
  rowId: string,
  status: "published" | "rejected" | "draft" | "pending",
): Promise<AdminActionState> {
  await requireAdmin();
  if (!hasServerCredentials()) return FAIL("Appwrite API key is not configured.");
  try {
    const { tables } = createAdminClient();
    await tables.updateRow({
      databaseId: DB,
      tableId: TABLES.SATIRE_POSTS,
      rowId,
      data: { status },
    });
    updateTag(CACHE_TAGS.posts);
    return OK(`Post ${status}.`);
  } catch (err) {
    return FAIL((err as Error).message);
  }
}

export async function setPostFeatured(rowId: string, featured: boolean): Promise<AdminActionState> {
  await requireAdmin();
  if (!hasServerCredentials()) return FAIL("Appwrite API key is not configured.");
  try {
    const { tables } = createAdminClient();
    await tables.updateRow({
      databaseId: DB,
      tableId: TABLES.SATIRE_POSTS,
      rowId,
      data: { featured },
    });
    updateTag(CACHE_TAGS.posts);
    return OK(featured ? "Post featured." : "Post unfeatured.");
  } catch (err) {
    return FAIL((err as Error).message);
  }
}

// ── Moderation ───────────────────────────────────────────────────────────────

export async function moderateMeme(
  rowId: string,
  status: "published" | "rejected",
): Promise<AdminActionState> {
  await requireAdmin();
  if (!hasServerCredentials()) return FAIL("Appwrite API key is not configured.");
  try {
    const { tables } = createAdminClient();
    await tables.updateRow({ databaseId: DB, tableId: TABLES.MEMES, rowId, data: { status } });
    updateTag(CACHE_TAGS.memes);
    return OK(`Meme ${status}.`);
  } catch (err) {
    return FAIL((err as Error).message);
  }
}

export async function moderateReaction(
  rowId: string,
  approve: boolean,
): Promise<AdminActionState> {
  await requireAdmin();
  if (!hasServerCredentials()) return FAIL("Appwrite API key is not configured.");
  try {
    const { tables } = createAdminClient();
    if (approve) {
      await tables.updateRow({
        databaseId: DB,
        tableId: TABLES.FAN_REACTIONS,
        rowId,
        data: { status: "published" },
      });
    } else {
      await tables.deleteRow({ databaseId: DB, tableId: TABLES.FAN_REACTIONS, rowId });
    }
    updateTag(CACHE_TAGS.reactions);
    return OK(approve ? "Reaction published." : "Reaction removed.");
  } catch (err) {
    return FAIL((err as Error).message);
  }
}

// ── Rankings ─────────────────────────────────────────────────────────────────

export async function saveRanking(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  if (!hasServerCredentials()) return FAIL("Appwrite API key is not configured.");

  const parsed = rankingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return FAIL(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    const { tables } = createAdminClient();
    await tables.createRow({
      databaseId: DB,
      tableId: TABLES.RANKINGS,
      rowId: ID.unique(),
      data: {
        title: parsed.data.title,
        category: parsed.data.category,
        playerId: parsed.data.playerId,
        score: parsed.data.score,
        reason: parsed.data.reason || null,
        period: parsed.data.period,
      },
    });
    updateTag(CACHE_TAGS.rankings);
    return OK("Ranking entry added.");
  } catch (err) {
    return FAIL((err as Error).message);
  }
}

// ── Content pipeline ─────────────────────────────────────────────────────────

export async function triggerIngestion(): Promise<AdminActionState> {
  await requireAdmin();
  if (!hasServerCredentials()) return FAIL("Appwrite API key is not configured.");
  try {
    const report = await runIngestionPipeline();
    updateTag(CACHE_TAGS.posts);
    updateTag(CACHE_TAGS.players);
    updateTag(CACHE_TAGS.matches);
    updateTag(CACHE_TAGS.reactions);
    updateTag(CACHE_TAGS.rankings);
    return OK(
      `Pipeline ran: ${report.matchesProcessed} matches, ${report.incidentsFound} incidents, ` +
        `${report.postsCreated} posts, ${report.reactionsCreated} reactions.`,
    );
  } catch (err) {
    return FAIL((err as Error).message);
  }
}
