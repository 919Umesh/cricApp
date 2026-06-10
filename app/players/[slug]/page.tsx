import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { MemeCard } from "@/components/shared/meme-card";
import { PostCard } from "@/components/shared/post-card";
import { ReactionCard } from "@/components/shared/reaction-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveImage } from "@/lib/appwrite/files";
import { listReactions } from "@/lib/services/community";
import { listMemes } from "@/lib/services/memes";
import { getPlayerBySlug } from "@/lib/services/players";
import { listPublishedPosts } from "@/lib/services/posts";
import { parsePlayerStats, type Player } from "@/lib/types";

export async function generateMetadata({
  params,
}: PageProps<"/players/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) return { title: "Player not found" };
  return {
    title: `${player.name} — Profile, Stats & Satire`,
    description:
      player.bio?.slice(0, 160) ??
      `${player.name}'s profile: stats, memes and satire timeline.`,
    openGraph: {
      title: `${player.name} | Silly Point`,
      description: player.bio?.slice(0, 200) ?? `${player.name} on Silly Point.`,
      images: [resolveImage(player.image, "/placeholder-player.svg")],
    },
  };
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-4 text-center">
      <p className="font-heading text-xl font-bold">{value}</p>
      <p className="mt-0.5 text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
    </div>
  );
}

function ScoreRing({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div
        className="grid size-14 shrink-0 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${color} ${value * 3.6}deg, color-mix(in oklab, ${color} 15%, transparent) 0deg)`,
        }}
      >
        <div className="grid size-11 place-items-center rounded-full bg-card text-sm font-bold">
          {value}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">out of 100</p>
      </div>
    </div>
  );
}

async function PlayerSatire({ player }: { player: Player }) {
  const [{ rows: posts }, { rows: memes }, reactions] = await Promise.all([
    listPublishedPosts({ playerId: player.$id, limit: 6 }),
    listMemes({ playerId: player.$id, sort: "liked", limit: 3 }),
    listReactions({ playerId: player.$id, limit: 3 }),
  ]);

  return (
    <>
      <section className="mt-14">
        <SectionHeading eyebrow="The receipts" title="Satire Timeline" />
        {posts.length === 0 ? (
          <EmptyState
            title="No satire yet"
            hint="A clean record. Statistically improbable, but we respect it."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.$id} post={post} />
            ))}
          </div>
        )}
      </section>

      {memes.length > 0 ? (
        <section className="mt-14">
          <SectionHeading eyebrow="Community art" title="Memes" href="/memes" />
          <div className="grid gap-6 md:grid-cols-3">
            {memes.map((meme) => (
              <MemeCard key={meme.$id} meme={meme} />
            ))}
          </div>
        </section>
      ) : null}

      {reactions.length > 0 ? (
        <section className="mt-14">
          <SectionHeading eyebrow="The stands speak" title="Fan Reactions" href="/community" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reactions.map((reaction) => (
              <ReactionCard key={reaction.$id} reaction={reaction} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

async function PlayerProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) notFound();
  const stats = parsePlayerStats(player.stats);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: player.name,
            jobTitle: `Cricketer (${player.role})`,
            affiliation: { "@type": "SportsTeam", name: player.team },
          }),
        }}
      />
      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-secondary">
            <Image
              src={resolveImage(player.image, "/placeholder-player.svg")}
              alt={player.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 320px"
              className="object-cover"
            />
          </div>
          <div className="mt-5 grid gap-3">
            <ScoreRing label="Meme Score" value={player.memeScore} color="oklch(0.52 0.2 16)" />
            <ScoreRing label="Fan Reaction Score" value={player.fanScore} color="oklch(0.7 0.17 160)" />
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{player.role}</Badge>
            <Badge variant="outline">{player.team}</Badge>
            {player.trending ? <Badge>🔥 Trending</Badge> : null}
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-5xl">
            {player.name}
          </h1>
          {player.battingStyle || player.bowlingStyle ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {[player.battingStyle, player.bowlingStyle].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          {player.bio ? (
            <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">{player.bio}</p>
          ) : null}

          {player.currentForm ? (
            <Card className="mt-6 border-primary/20 bg-accent/40 py-0">
              <CardContent className="p-4">
                <p className="mb-1 text-[11px] font-bold tracking-widest text-primary uppercase">
                  Current Form
                </p>
                <p className="text-sm">{player.currentForm}</p>
              </CardContent>
            </Card>
          ) : null}

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox label="Matches" value={stats.matches} />
            <StatBox label="Runs" value={stats.runs.toLocaleString()} />
            <StatBox label="Average" value={stats.average} />
            <StatBox label="Strike Rate" value={stats.strikeRate} />
            <StatBox label="Wickets" value={stats.wickets} />
            <StatBox label="Economy" value={stats.economy} />
            <StatBox label="Highest" value={stats.highestScore} />
            <StatBox label="Ducks 🦆" value={stats.ducks} />
          </div>
        </div>
      </div>

      <PlayerSatire player={player} />
    </>
  );
}

export default function PlayerPage({ params }: PageProps<"/players/[slug]">) {
  return (
    <div className="container-page py-14">
      <Suspense
        fallback={
          <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-72" />
              <Skeleton className="h-24 w-full max-w-2xl" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        }
      >
        <PlayerProfile params={params} />
      </Suspense>
    </div>
  );
}
