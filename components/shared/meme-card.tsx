"use client";

import { Heart, Share2 } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { likeMeme, shareMeme } from "@/lib/actions/community";
import { resolveImage } from "@/lib/appwrite/files";
import type { Meme } from "@/lib/types";

export function MemeCard({ meme }: { meme: Meme }) {
  const [likes, setLikes] = useState(meme.likes);
  const [shares, setShares] = useState(meme.shares);
  const [liked, setLiked] = useState(false);
  const [, startTransition] = useTransition();

  function handleLike() {
    if (liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    startTransition(async () => {
      const res = await likeMeme(meme.$id);
      if (!res.ok) {
        setLiked(false);
        setLikes((n) => n - 1);
        toast.error(res.message);
      }
    });
  }

  function handleShare() {
    const url = `${window.location.origin}/memes#${meme.$id}`;
    setShares((n) => n + 1);
    startTransition(async () => {
      await shareMeme(meme.$id);
    });
    if (navigator.share) {
      navigator.share({ title: meme.title, url }).catch(() => undefined);
    } else {
      navigator.clipboard.writeText(url).then(
        () => toast.success("Link copied — go spread the chaos."),
        () => toast.error("Could not copy the link."),
      );
    }
  }

  return (
    <Card id={meme.$id} className="group h-full overflow-hidden py-0">
      <div className="relative aspect-video overflow-hidden bg-secondary">
        <Image
          src={resolveImage(meme.image, "/placeholder-post.svg")}
          alt={meme.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="font-heading truncate text-sm font-semibold">{meme.title}</h3>
          {meme.submittedBy ? (
            <p className="truncate text-xs text-muted-foreground">by {meme.submittedBy}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleLike}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
              liked
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            aria-label="Like meme"
          >
            <Heart className={`size-3.5 ${liked ? "fill-current" : ""}`} />
            {likes.toLocaleString()}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Share meme"
          >
            <Share2 className="size-3.5" />
            {shares.toLocaleString()}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
