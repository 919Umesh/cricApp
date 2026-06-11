import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { FadeIn } from "@/components/shared/motion";
import { PostCard } from "@/components/shared/post-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listPublishedPosts } from "@/lib/services/posts";
import {
  SATIRE_CATEGORIES,
  SATIRE_CATEGORY_LABELS,
  type SatireCategory,
} from "@/lib/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Satire Posts | Cricket Satire & Commentary",
  description:
    "The Golden Duck Club, Collapse of the Week, and more — Nepali cricket's finest disasters, lovingly documented. Cricket satire, memes, and humor.",
  keywords: [
    "cricket satire",
    "cricket humor",
    "nepal cricket",
    "cricket commentary",
    "cricket memes",
  ],
  alternates: { canonical: `${siteUrl}/posts` },
  openGraph: {
    type: "website",
    title: "Cricket Satire Posts | Silly Point",
    description:
      "The Golden Duck Club, Collapse of the Week — Nepali cricket's finest disasters, lovingly documented.",
    url: `${siteUrl}/posts`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cricket Satire Posts | Silly Point",
    creator: "@cricsatire",
  },
};

const PAGE_SIZE = 12;

async function PostsGrid({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const category = SATIRE_CATEGORIES.find((c) => c === sp.category) as
    | SatireCategory
    | undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const { total, rows: posts } = await listPublishedPosts({
    category,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const baseQuery = category ? `category=${category}&` : "";

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/posts">
          <Badge variant={!category ? "default" : "secondary"} className="cursor-pointer px-3 py-1.5">
            All
          </Badge>
        </Link>
        {SATIRE_CATEGORIES.map((c) => (
          <Link key={c} href={`/posts?category=${c}`}>
            <Badge
              variant={category === c ? "default" : "secondary"}
              className="cursor-pointer px-3 py-1.5"
            >
              {SATIRE_CATEGORY_LABELS[c]}
            </Badge>
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <EmptyState title="No posts in this category yet" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <FadeIn key={post.$id} index={i % 3}>
              <PostCard post={post} />
            </FadeIn>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
            {page > 1 ? (
              <Link href={`/posts?${baseQuery}page=${page - 1}`}>← Previous</Link>
            ) : (
              <span>← Previous</span>
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages}>
            {page < totalPages ? (
              <Link href={`/posts?${baseQuery}page=${page + 1}`}>Next →</Link>
            ) : (
              <span>Next →</span>
            )}
          </Button>
        </div>
      ) : null}
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-80 rounded-xl" />
      ))}
    </div>
  );
}

export default function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  return (
    <div className="container-page py-14">
      <div className="mb-10">
        <p className="mb-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
          The Archive of Pain
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Satire Posts
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every duck documented, every collapse chronicled. Our historians work around the clock,
          mostly because the material never stops coming.
        </p>
      </div>
      <Suspense fallback={<GridSkeleton />}>
        <PostsGrid searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
