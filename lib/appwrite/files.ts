/**
 * Pure URL builders for Appwrite Storage files — safe on server and client.
 */
const endpoint =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ??
  "https://fra.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";

export function fileViewUrl(bucketId: string, fileId: string): string {
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
}

/**
 * Resolve an image reference stored in the database. References are either a
 * full URL ("https://…") or a "bucketId:fileId" pair created by uploads.
 */
export function resolveImage(ref: string | null | undefined, fallback: string): string {
  if (!ref) return fallback;
  if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("/")) {
    return ref;
  }
  const [bucketId, fileId] = ref.split(":");
  if (bucketId && fileId) return fileViewUrl(bucketId, fileId);
  return fallback;
}
