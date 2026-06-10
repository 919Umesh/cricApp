"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { MemeCard } from "@/components/shared/meme-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Meme } from "@/lib/types";

interface MemePage {
  memes: Meme[];
  nextOffset: number | null;
  total: number;
}

async function fetchMemes(sort: string, offset: number): Promise<MemePage> {
  const res = await fetch(`/api/memes?sort=${sort}&offset=${offset}`);
  if (!res.ok) throw new Error("Failed to load memes");
  return res.json();
}

export function MemeFeed({ sort, initialPage }: { sort: string; initialPage: MemePage }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError } = useInfiniteQuery({
    queryKey: ["memes", sort],
    queryFn: ({ pageParam }) => fetchMemes(sort, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialData: { pages: [initialPage], pageParams: [0] },
    staleTime: 60_000,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const memes = data.pages.flatMap((page) => page.memes);

  if (memes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-14 text-center">
        <p className="text-3xl">🦗</p>
        <p className="mt-3 text-sm text-muted-foreground">
          No memes here yet. A tragedy greater than any collapse.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {memes.map((meme) => (
          <MemeCard key={meme.$id} meme={meme} />
        ))}
        {isFetchingNextPage
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={`s-${i}`} className="h-72 rounded-xl" />
            ))
          : null}
      </div>
      <div ref={sentinelRef} className="h-1" />
      {isError ? (
        <p className="mt-6 text-center text-sm text-destructive">
          Could not load more memes. The third umpire is reviewing.
        </p>
      ) : null}
      {hasNextPage && !isFetchingNextPage ? (
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => fetchNextPage()}>
            <Loader2 className="size-4" />
            Load more chaos
          </Button>
        </div>
      ) : null}
    </>
  );
}
