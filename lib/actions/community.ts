"use server";

import { updateTag } from "next/cache";
import { ID } from "node-appwrite";
import { BUCKETS, TABLES, hasServerCredentials } from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { CACHE_TAGS, DB } from "@/lib/services/base";
import { parsePollOptions } from "@/lib/types";
import {
  fanReactionSchema,
  memeSubmissionSchema,
  newsletterSchema,
} from "@/lib/validation";

export interface ActionState {
  ok: boolean;
  message: string;
}

const BACKEND_DOWN: ActionState = {
  ok: false,
  message: "The backend is warming up in the nets. Try again later.",
};

export async function submitReaction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = fanReactionSchema.safeParse({
    username: formData.get("username"),
    reaction: formData.get("reaction"),
    playerId: formData.get("playerId") ?? "",
    postId: formData.get("postId") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!hasServerCredentials()) return BACKEND_DOWN;

  try {
    const { tables } = createAdminClient();
    await tables.createRow({
      databaseId: DB,
      tableId: TABLES.FAN_REACTIONS,
      rowId: ID.unique(),
      data: {
        username: parsed.data.username,
        reaction: parsed.data.reaction,
        playerId: parsed.data.playerId || null,
        postId: parsed.data.postId || null,
        likes: 0,
        status: "pending",
      },
    });
    return {
      ok: true,
      message: "Reaction submitted! It will appear once a moderator stops laughing.",
    };
  } catch {
    return BACKEND_DOWN;
  }
}

export async function submitMeme(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = memeSubmissionSchema.safeParse({
    title: formData.get("title"),
    submittedBy: formData.get("submittedBy"),
    playerId: formData.get("playerId") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Attach an image — a meme without an image is a tweet." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, message: "Max file size is 10 MB." };
  }
  if (!hasServerCredentials()) return BACKEND_DOWN;

  try {
    const { tables, storage } = createAdminClient();
    const fileId = ID.unique();
    await storage.createFile({ bucketId: BUCKETS.MEME_IMAGES, fileId, file });
    await tables.createRow({
      databaseId: DB,
      tableId: TABLES.MEMES,
      rowId: ID.unique(),
      data: {
        title: parsed.data.title,
        image: `${BUCKETS.MEME_IMAGES}:${fileId}`,
        type: "image",
        videoUrl: null,
        playerId: parsed.data.playerId || null,
        likes: 0,
        shares: 0,
        status: "pending",
        submittedBy: parsed.data.submittedBy,
      },
    });
    return { ok: true, message: "Meme received! Our moderators are reviewing it (read: laughing)." };
  } catch {
    return BACKEND_DOWN;
  }
}

export async function likeMeme(memeId: string): Promise<ActionState> {
  if (!hasServerCredentials()) return BACKEND_DOWN;
  try {
    const { tables } = createAdminClient();
    await tables.incrementRowColumn({
      databaseId: DB,
      tableId: TABLES.MEMES,
      rowId: memeId,
      column: "likes",
      value: 1,
    });
    updateTag(CACHE_TAGS.memes);
    return { ok: true, message: "Liked!" };
  } catch {
    return BACKEND_DOWN;
  }
}

export async function shareMeme(memeId: string): Promise<ActionState> {
  if (!hasServerCredentials()) return BACKEND_DOWN;
  try {
    const { tables } = createAdminClient();
    await tables.incrementRowColumn({
      databaseId: DB,
      tableId: TABLES.MEMES,
      rowId: memeId,
      column: "shares",
      value: 1,
    });
    updateTag(CACHE_TAGS.memes);
    return { ok: true, message: "Share counted!" };
  } catch {
    return BACKEND_DOWN;
  }
}

export async function likePost(postId: string): Promise<ActionState> {
  if (!hasServerCredentials()) return BACKEND_DOWN;
  try {
    const { tables } = createAdminClient();
    await tables.incrementRowColumn({
      databaseId: DB,
      tableId: TABLES.SATIRE_POSTS,
      rowId: postId,
      column: "likes",
      value: 1,
    });
    updateTag(CACHE_TAGS.posts);
    return { ok: true, message: "Liked!" };
  } catch {
    return BACKEND_DOWN;
  }
}

export async function votePoll(pollId: string, optionId: string): Promise<ActionState> {
  if (!hasServerCredentials()) return BACKEND_DOWN;
  try {
    const { tables } = createAdminClient();
    const poll = await tables.getRow({ databaseId: DB, tableId: TABLES.POLLS, rowId: pollId });
    const options = parsePollOptions(poll.options as string);
    const target = options.find((o) => o.id === optionId);
    if (!target) return { ok: false, message: "That option does not exist." };
    target.votes += 1;
    await tables.updateRow({
      databaseId: DB,
      tableId: TABLES.POLLS,
      rowId: pollId,
      data: {
        options: JSON.stringify(options),
        totalVotes: options.reduce((sum, o) => sum + o.votes, 0),
      },
    });
    updateTag(CACHE_TAGS.polls);
    return { ok: true, message: "Vote counted. Democracy, unlike our top order, survives." };
  } catch {
    return BACKEND_DOWN;
  }
}

export async function subscribeNewsletter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid email" };
  }
  if (!hasServerCredentials()) return BACKEND_DOWN;

  try {
    const { tables } = createAdminClient();
    await tables.createRow({
      databaseId: DB,
      tableId: TABLES.SUBSCRIBERS,
      rowId: ID.unique(),
      data: { email: parsed.data.email },
    });
    return { ok: true, message: "Subscribed! Expect satire, not spam. Mostly." };
  } catch (err) {
    if ((err as { code?: number }).code === 409) {
      return { ok: true, message: "You're already on the list — keen, we love it." };
    }
    return BACKEND_DOWN;
  }
}
