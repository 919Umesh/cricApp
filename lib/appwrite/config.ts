export const appwriteConfig = {
  endpoint:
    process.env.APPWRITE_ENDPOINT ??
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ??
    "https://fra.cloud.appwrite.io/v1",
  projectId:
    process.env.APPWRITE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ??
    "",
  apiKey: process.env.APPWRITE_API_KEY ?? "",
  databaseId: process.env.APPWRITE_DATABASE_ID ?? "cric-satire",
} as const;

export const TABLES = {
  PLAYERS: "players",
  MATCHES: "matches",
  SATIRE_POSTS: "satire_posts",
  MEMES: "memes",
  FAN_REACTIONS: "fan_reactions",
  RANKINGS: "rankings",
  POLLS: "polls",
  SUBSCRIBERS: "subscribers",
} as const;

export const BUCKETS = {
  PLAYER_IMAGES: "player-images",
  POST_IMAGES: "post-images",
  MEME_IMAGES: "meme-images",
  UPLOADS: "uploads",
} as const;

export const SESSION_COOKIE = "cric-satire-session";

/** True when a real (non-placeholder) API key is configured. */
export function hasServerCredentials(): boolean {
  return Boolean(
    appwriteConfig.apiKey &&
      !appwriteConfig.apiKey.startsWith("YOUR_") &&
      appwriteConfig.projectId,
  );
}
