"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { likePost } from "@/lib/actions/community";

export function LikeButton({ postId, initialLikes }: { postId: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [, startTransition] = useTransition();

  function handleLike() {
    if (liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    startTransition(async () => {
      const res = await likePost(postId);
      if (!res.ok) {
        setLiked(false);
        setLikes((n) => n - 1);
        toast.error(res.message);
      }
    });
  }

  return (
    <Button
      variant={liked ? "default" : "outline"}
      size="sm"
      onClick={handleLike}
      className="gap-1.5"
    >
      <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
      {likes.toLocaleString()}
    </Button>
  );
}
