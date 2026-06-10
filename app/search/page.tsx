import { SearchIcon } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { MemeCard } from "@/components/shared/meme-card";
import { PlayerCard } from "@/components/shared/player-card";
import { PostCard } from "@/components/shared/post-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { searchEverything } from "@/lib/services/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search players, satire posts and memes across Silly Point.",
};

async function Results({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();

  if (term.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Type at least two characters. &quot;Duck&quot; is a popular choice.
      </p>
    );
  }

  const { players, posts, memes } = await searchEverything(term);
  const nothing = players.length === 0 && posts.length === 0 && memes.length === 0;

  if (nothing) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-14 text-center">
        <p className="text-3xl">🔎🦆</p>
        <p className="mt-3 text-sm text-muted-foreground">
          No results for “{term}”. Like our slip cordon, we found nothing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {players.length > 0 ? (
        <section>
          <SectionHeading title={`Players (${players.length})`} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {players.map((player) => (
              <PlayerCard key={player.$id} player={player} />
            ))}
          </div>
        </section>
      ) : null}
      {posts.length > 0 ? (
        <section>
          <SectionHeading title={`Satire (${posts.length})`} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.$id} post={post} />
            ))}
          </div>
        </section>
      ) : null}
      {memes.length > 0 ? (
        <section>
          <SectionHeading title={`Memes (${memes.length})`} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {memes.map((meme) => (
              <MemeCard key={meme.$id} meme={meme} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

async function SearchBox({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <form action="/search" method="get" className="flex max-w-xl gap-2">
      <Input
        type="search"
        name="q"
        defaultValue={q ?? ""}
        placeholder="Players, posts, memes… try 'duck'"
        aria-label="Search"
        autoFocus
      />
      <Button type="submit">
        <SearchIcon className="size-4" />
        Search
      </Button>
    </form>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <div className="container-page py-14">
      <div className="mb-10">
        <p className="mb-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
          Third Umpire Review
        </p>
        <h1 className="font-heading mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Search
        </h1>
        <Suspense fallback={<Skeleton className="h-10 max-w-xl rounded-md" />}>
          <SearchBox searchParams={searchParams} />
        </Suspense>
      </div>
      <Suspense
        fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        }
      >
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
