import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MemeFeed } from "@/components/memes/meme-feed";
import { MemeSubmitForm } from "@/components/memes/meme-submit-form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { listMemes, type MemeSort } from "@/lib/services/memes";

export const metadata: Metadata = {
  title: "Memes",
  description:
    "The finest Nepali cricket memes: trending, most liked and most shared. Community-made, moderator-approved, duck-certified.",
};

const SORTS: { key: MemeSort; label: string }[] = [
  { key: "latest", label: "🔥 Trending" },
  { key: "liked", label: "❤️ Most Liked" },
  { key: "shared", label: "🔁 Most Shared" },
];

async function Feed({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const sp = await searchParams;
  const sort: MemeSort =
    sp.sort === "liked" || sp.sort === "shared" ? sp.sort : "latest";
  const { total, rows } = await listMemes({ sort, limit: 9 });

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <Link key={s.key} href={s.key === "latest" ? "/memes" : `/memes?sort=${s.key}`}>
              <Badge
                variant={sort === s.key ? "default" : "secondary"}
                className="cursor-pointer px-3 py-1.5"
              >
                {s.label}
              </Badge>
            </Link>
          ))}
        </div>
        <MemeSubmitForm />
      </div>
      <MemeFeed
        sort={sort}
        initialPage={{
          memes: rows,
          nextOffset: rows.length < total ? rows.length : null,
          total,
        }}
      />
    </>
  );
}

export default function MemesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  return (
    <div className="container-page py-14">
      <div className="mb-10">
        <p className="mb-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
          The National Gallery
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Memes</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Where heartbreak becomes art. Nepal&apos;s only renewable resource with guaranteed
          year-round supply.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        }
      >
        <Feed searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
