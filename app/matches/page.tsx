import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { MatchCard } from "@/components/shared/match-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listRecentMatches, listUpcomingMatches } from "@/lib/services/matches";
import { parseScorecard } from "@/lib/types";

export const metadata: Metadata = {
  title: "Match Center",
  description:
    "Upcoming fixtures, recent results, scorecards and the funny analysis nobody asked for. Nepal's matches, fully documented.",
};

async function Upcoming() {
  const matches = await listUpcomingMatches(6);
  if (matches.length === 0) return null;
  return (
    <section className="mb-14">
      <SectionHeading eyebrow="Pre-booked heartbreak" title="Upcoming Matches" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <MatchCard key={match.$id} match={match} showAnalysis />
        ))}
      </div>
    </section>
  );
}

async function Recent() {
  const matches = await listRecentMatches(9);
  if (matches.length === 0) {
    return <EmptyState title="No matches recorded yet" />;
  }
  const featured = matches.find((m) => parseScorecard(m.scorecard)?.nepal.batting?.length);

  return (
    <section>
      <SectionHeading eyebrow="The record books" title="Recent Results" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <MatchCard key={match.$id} match={match} showAnalysis />
        ))}
      </div>

      {featured ? <FeaturedScorecard matchId={featured.$id} /> : null}
    </section>
  );
}

async function FeaturedScorecard({ matchId }: { matchId: string }) {
  const matches = await listRecentMatches(9);
  const match = matches.find((m) => m.$id === matchId);
  const scorecard = match ? parseScorecard(match.scorecard) : null;
  if (!match || !scorecard) return null;

  return (
    <div className="mt-12">
      <SectionHeading
        eyebrow="Forensic report"
        title={`Scorecard Autopsy: Nepal vs ${match.opponent}`}
      />
      <Card className="overflow-hidden py-0">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-6 py-4">
            <div>
              <p className="font-heading font-bold">
                Nepal {scorecard.nepal.total}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({scorecard.nepal.overs} ov)
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                vs {match.opponent} {scorecard.opponent.total} ({scorecard.opponent.overs} ov)
              </p>
            </div>
          </div>
          <div className="divide-y divide-border/60">
            {scorecard.nepal.batting.map((entry) => (
              <div key={entry.player} className="flex items-center gap-4 px-6 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{entry.player}</p>
                  <p className="truncate text-xs text-muted-foreground italic">
                    {entry.dismissal}
                  </p>
                </div>
                <p className="font-mono text-sm">
                  <span className="font-bold">{entry.runs}</span>
                  <span className="text-muted-foreground"> ({entry.balls})</span>
                  {entry.runs === 0 && !/not out/i.test(entry.dismissal) ? " 🦆" : ""}
                </p>
              </div>
            ))}
          </div>
          {match.funnyAnalysis ? (
            <div className="border-t border-border bg-accent/40 px-6 py-4">
              <p className="mb-1 text-[11px] font-bold tracking-widest text-primary uppercase">
                Totally Serious Analysis
              </p>
              <p className="text-sm">{match.funnyAnalysis}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export default function MatchesPage() {
  return (
    <div className="container-page py-14">
      <div className="mb-10">
        <p className="mb-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
          Match Center
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Matches
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Live-ish scores, recent results and upcoming opportunities for content. Updated by our
          automated pipeline every few hours.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="mb-14 h-64 rounded-xl" />}>
        <Upcoming />
      </Suspense>
      <Suspense
        fallback={
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        }
      >
        <Recent />
      </Suspense>
    </div>
  );
}
