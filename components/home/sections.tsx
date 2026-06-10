import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { MatchCard } from "@/components/shared/match-card";
import { MemeCard } from "@/components/shared/meme-card";
import { FadeIn } from "@/components/shared/motion";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { PlayerCard } from "@/components/shared/player-card";
import { PostCard } from "@/components/shared/post-card";
import { ReactionCard } from "@/components/shared/reaction-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { listReactions, listRankings } from "@/lib/services/community";
import { listMatchDisasters } from "@/lib/services/matches";
import { listMemes } from "@/lib/services/memes";
import { listPlayers, listTrendingPlayers } from "@/lib/services/players";
import {
  listFeaturedPosts,
  listPublishedPosts,
  listTrendingPosts,
} from "@/lib/services/posts";
import { RANKING_CATEGORY_LABELS } from "@/lib/types";

export async function TrendingPostsSection() {
  const [featured, trending] = await Promise.all([
    listFeaturedPosts(1),
    listTrendingPosts(5),
  ]);
  const lead = featured[0] ?? trending[0];
  const rest = trending.filter((p) => p.$id !== lead?.$id).slice(0, 4);

  return (
    <section className="container-page py-16">
      <SectionHeading
        eyebrow="Hot off the collapse"
        title="Trending Satire"
        href="/posts"
      />
      {!lead ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <FadeIn>
            <PostCard post={lead} priority />
          </FadeIn>
          <div className="grid gap-6 sm:grid-cols-2">
            {rest.map((post, i) => (
              <FadeIn key={post.$id} index={i + 1}>
                <PostCard post={post} />
              </FadeIn>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export async function MatchDisastersSection() {
  const disasters = await listMatchDisasters(3);
  if (disasters.length === 0) return null;

  return (
    <section className="border-y border-border/60 bg-secondary/30 py-16">
      <div className="container-page">
        <SectionHeading
          eyebrow="In loving memory"
          title="Latest Match Disasters"
          href="/matches"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {disasters.map((match, i) => (
            <FadeIn key={match.$id} index={i}>
              <MatchCard match={match} showAnalysis />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function DiscussedPlayersSection() {
  let players = await listTrendingPlayers(4);
  if (players.length === 0) {
    players = (await listPlayers({ limit: 4 })).rows;
  }

  return (
    <section className="container-page py-16">
      <SectionHeading
        eyebrow="The meme economy"
        title="Most Discussed Players"
        href="/players"
      />
      {players.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {players.map((player, i) => (
            <FadeIn key={player.$id} index={i}>
              <PlayerCard player={player} />
            </FadeIn>
          ))}
        </div>
      )}
    </section>
  );
}

export async function FanReactionsSection() {
  const reactions = await listReactions({ limit: 6 });
  if (reactions.length === 0) return null;

  return (
    <section className="border-y border-border/60 bg-secondary/30 py-16">
      <div className="container-page">
        <SectionHeading
          eyebrow="The stands speak"
          title="Recent Fan Reactions"
          href="/community"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reactions.map((reaction, i) => (
            <FadeIn key={reaction.$id} index={i}>
              <ReactionCard reaction={reaction} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function FeaturedMemesSection() {
  const { rows: memes } = await listMemes({ sort: "liked", limit: 3 });
  if (memes.length === 0) return null;

  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Certified fresh" title="Featured Memes" href="/memes" />
      <div className="grid gap-6 md:grid-cols-3">
        {memes.map((meme, i) => (
          <FadeIn key={meme.$id} index={i}>
            <MemeCard meme={meme} />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

export async function LeaderboardSection() {
  const [rankings, playersRes] = await Promise.all([
    listRankings(),
    listPlayers({ limit: 100 }),
  ]);
  if (rankings.length === 0) return null;

  const playerById = new Map(playersRes.rows.map((p) => [p.$id, p]));
  // One leader per category.
  const leaders = [...new Map(rankings.map((r) => [r.category, r])).values()].slice(0, 5);

  return (
    <section className="border-y border-border/60 bg-secondary/30 py-16">
      <div className="container-page">
        <SectionHeading
          eyebrow="Hall of flame"
          title="Leaderboard"
          href="/rankings"
          linkLabel="Full rankings"
        />
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {leaders.map((entry, i) => {
            const player = playerById.get(entry.playerId);
            return (
              <Link
                key={entry.$id}
                href={player ? `/players/${player.slug}` : "/rankings"}
                className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/50 ${
                  i > 0 ? "border-t border-border/60" : ""
                }`}
              >
                <span className="font-heading w-8 text-xl font-bold text-primary">
                  #{i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{player?.name ?? entry.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{entry.reason ?? entry.title}</p>
                </div>
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {RANKING_CATEGORY_LABELS[entry.category]}
                </Badge>
                <span className="font-mono text-sm font-semibold">{entry.score.toFixed(1)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export async function LatestArticlesSection() {
  const { rows: posts } = await listPublishedPosts({ limit: 6 });
  if (posts.length === 0) return null;

  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Fresh from the press box" title="Latest Articles" href="/posts" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <FadeIn key={post.$id} index={i % 3}>
            <PostCard post={post} />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

export function NewsletterSection() {
  return (
    <section className="container-page pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-rose-700 to-rose-900 px-6 py-14 text-white sm:px-12">
        <div
          aria-hidden
          className="absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative max-w-xl">
          <p className="mb-2 text-xs font-semibold tracking-widest uppercase opacity-80">
            The Silly Point Dispatch
          </p>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Never miss a collapse again.
          </h2>
          <p className="mt-3 mb-6 text-sm leading-relaxed opacity-90">
            One email per week: the best satire, the freshest memes, and a respectful moment of
            silence for the middle order. Unsubscribe whenever — unlike our openers, we won&apos;t
            make it weird.
          </p>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
