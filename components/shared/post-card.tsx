import { Eye, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { resolveImage } from "@/lib/appwrite/files";
import { SATIRE_CATEGORY_LABELS, type SatirePost } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function PostCard({
  post,
  priority = false,
}: {
  post: SatirePost;
  priority?: boolean;
}) {
  return (
    <Card className="group h-full overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/posts/${post.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-video overflow-hidden bg-secondary">
          <Image
            src={resolveImage(post.image, "/placeholder-post.svg")}
            alt={post.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Badge className="absolute top-3 left-3 bg-background/85 text-foreground backdrop-blur-sm">
            {SATIRE_CATEGORY_LABELS[post.category] ?? post.category}
          </Badge>
        </div>
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="font-heading line-clamp-2 text-lg leading-snug font-semibold transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          {post.excerpt ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          ) : null}
          <div className="mt-auto flex items-center gap-4 pt-1 text-xs text-muted-foreground">
            <span>{formatDate(post.$createdAt)}</span>
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" />
              {post.views.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3.5" />
              {post.likes.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
