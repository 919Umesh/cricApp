import { Check, Pencil, Plus, Star, StarOff, Trash2, X } from "lucide-react";
import type { Metadata } from "next";
import { ActionButton } from "@/components/admin/action-button";
import { PostForm } from "@/components/admin/post-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deletePost, setPostFeatured, setPostStatus } from "@/lib/actions/admin";
import { listPlayers } from "@/lib/services/players";
import { listPostsByStatus } from "@/lib/services/posts";
import { SATIRE_CATEGORY_LABELS } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Posts" };

const statusVariant: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  draft: "bg-muted text-muted-foreground",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export default async function AdminPostsPage() {
  const [{ rows: posts }, { rows: players }] = await Promise.all([
    listPostsByStatus(undefined, 100),
    listPlayers({ limit: 100 }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Satire Posts</h1>
          <p className="text-sm text-muted-foreground">
            {posts.length} posts · auto-generated ones arrive via the pipeline
          </p>
        </div>
        <PostForm players={players} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.$id}>
                <TableCell className="max-w-md">
                  <p className="truncate font-medium">
                    {post.featured ? "⭐ " : ""}
                    {post.source === "auto" ? "🤖 " : ""}
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {SATIRE_CATEGORY_LABELS[post.category]} · {formatDate(post.$createdAt)}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge className={statusVariant[post.status] ?? ""}>{post.status}</Badge>
                </TableCell>
                <TableCell className="text-center font-mono">{post.views}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-2">
                    {post.status !== "published" ? (
                      <ActionButton action={setPostStatus.bind(null, post.$id, "published")}>
                        <Check className="size-3.5" />
                        Publish
                      </ActionButton>
                    ) : (
                      <ActionButton action={setPostStatus.bind(null, post.$id, "draft")}>
                        <X className="size-3.5" />
                        Unpublish
                      </ActionButton>
                    )}
                    <ActionButton action={setPostFeatured.bind(null, post.$id, !post.featured)}>
                      {post.featured ? (
                        <StarOff className="size-3.5" />
                      ) : (
                        <Star className="size-3.5" />
                      )}
                    </ActionButton>
                    <PostForm post={post} players={players} />
                    <ActionButton
                      variant="destructive"
                      action={deletePost.bind(null, post.$id)}
                      confirm="Delete this post permanently?"
                    >
                      <Trash2 className="size-3.5" />
                    </ActionButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No posts yet. Run <code>npm run seed</code> or write one above.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
