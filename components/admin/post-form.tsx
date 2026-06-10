"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { savePost, type AdminActionState } from "@/lib/actions/admin";
import {
  SATIRE_CATEGORIES,
  SATIRE_CATEGORY_LABELS,
  type Player,
  type SatirePost,
} from "@/lib/types";

const initialState: AdminActionState = { ok: false, message: "" };
const STATUSES = ["draft", "pending", "published", "rejected"] as const;

import { Pencil, Plus } from "lucide-react";

export function PostForm({
  post,
  players,
}: {
  post?: SatirePost;
  players: Player[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function formAction(formData: FormData) {
    startTransition(async () => {
      const result = await savePost(initialState, formData);
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
        setError(null);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {post ? (
          <Button variant="outline" size="sm">
            <Pencil className="size-3.5" />
            Edit
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Write post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle className="font-heading">
          {post ? "Edit post" : "Write new satire"}
        </DialogTitle>
        <form action={formAction} className="grid gap-4">
          {post ? <input type="hidden" name="rowId" value={post.$id} /> : null}
          <div className="grid gap-2">
            <Label htmlFor="po-title">Headline</Label>
            <Input id="po-title" name="title" required defaultValue={post?.title} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="po-slug">Slug</Label>
              <Input
                id="po-slug"
                name="slug"
                required
                pattern="[a-z0-9-]+"
                defaultValue={post?.slug}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="po-category">Category</Label>
              <select
                id="po-category"
                name="category"
                defaultValue={post?.category ?? SATIRE_CATEGORIES[0]}
                className="border-input bg-transparent dark:bg-input/30 h-9 rounded-md border px-3 text-sm shadow-xs"
              >
                {SATIRE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {SATIRE_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="po-player">Player (optional)</Label>
              <select
                id="po-player"
                name="playerId"
                defaultValue={post?.playerId ?? ""}
                className="border-input bg-transparent dark:bg-input/30 h-9 rounded-md border px-3 text-sm shadow-xs"
              >
                <option value="">None / whole team</option>
                {players.map((p) => (
                  <option key={p.$id} value={p.$id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="po-status">Status</Label>
              <select
                id="po-status"
                name="status"
                defaultValue={post?.status ?? "draft"}
                className="border-input bg-transparent dark:bg-input/30 h-9 rounded-md border px-3 text-sm shadow-xs"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="po-excerpt">Excerpt</Label>
            <Input id="po-excerpt" name="excerpt" defaultValue={post?.excerpt ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="po-content">Body (blank line = new paragraph)</Label>
            <Textarea
              id="po-content"
              name="content"
              required
              rows={10}
              defaultValue={post?.content}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="po-image">Cover image (replaces current)</Label>
              <Input id="po-image" name="image" type="file" accept="image/*" />
            </div>
            <label className="flex items-center gap-2 self-end pb-1 text-sm">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={post?.featured}
                className="size-4 accent-primary"
              />
              Featured on homepage
            </label>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : post ? "Save changes" : "Publish-ish"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
