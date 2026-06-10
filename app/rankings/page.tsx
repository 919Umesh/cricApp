import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveImage } from "@/lib/appwrite/files";
import { listRankings } from "@/lib/services/community";
import { listPlayers } from "@/lib/services/players";
import {
  RANKING_CATEGORIES,
  RANKING_CATEGORY_LABELS,
  type Ranking,
} from "@/lib/types";

export const metadata: Metadata = {
  title: "Rankings",
  description:
    "The rankings that matter: Biggest Collapse, Unluckiest Player, Fan Favorite, Meme King and Redemption Arc. Updated whenever Nepal plays.",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "biggest-collapse": "Engineering marvels of synchronized batting failure.",
  "unluckiest-player": "Cosmic injustice, measured scientifically.",
  "fan-favorite": "Beloved beyond reason, statistics irrelevant.",
  "meme-king": "Maximum content generated per innings.",
  "redemption-arc": "From duck to daddy hundred — narrative loading.",
};

async function RankingsBoard() {
  const [rankings, playersRes] = await Promise.all([
    listRankings(),
    listPlayers({ limit: 100 }),
  ]);
  const playerById = new Map(playersRes.rows.map((p) => [p.$id, p]));

  if (rankings.length === 0) return <EmptyState title="No rankings yet" />;

  const byCategory = new Map<string, Ranking[]>();
  for (const r of rankings) {
    const list = byCategory.get(r.category) ?? [];
    list.push(r);
    byCategory.set(r.category, list);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {RANKING_CATEGORIES.map((category) => {
        const entries = (byCategory.get(category) ?? []).slice(0, 5);
        if (entries.length === 0) return null;
        return (
          <Card key={category} className="overflow-hidden py-0">
            <CardContent className="p-0">
              <div className="border-b border-border bg-secondary/50 px-6 py-4">
                <h2 className="font-heading text-lg font-bold">
                  {RANKING_CATEGORY_LABELS[category]}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_DESCRIPTIONS[category]}
                </p>
              </div>
              <ol>
                {entries.map((entry, i) => {
                  const player = playerById.get(entry.playerId);
                  return (
                    <li key={entry.$id} className={i > 0 ? "border-t border-border/60" : ""}>
                      <Link
                        href={player ? `/players/${player.slug}` : "#"}
                        className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-accent/50"
                      >
                        <span className="font-heading w-6 text-lg font-bold text-primary">
                          {i + 1}
                        </span>
                        {player ? (
                          <Image
                            src={resolveImage(player.image, "/placeholder-player.svg")}
                            alt={player.name}
                            width={40}
                            height={40}
                            className="rounded-full border border-border"
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {player?.name ?? entry.title}
                          </p>
                          {entry.reason ? (
                            <p className="truncate text-xs text-muted-foreground">{entry.reason}</p>
                          ) : null}
                        </div>
                        <Badge variant="secondary" className="font-mono">
                          {entry.score.toFixed(1)}
                        </Badge>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function RankingsPage() {
  return (
    <div className="container-page py-14">
      <div className="mb-10">
        <p className="mb-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
          Hall of Flame
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Rankings</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          The ICC has its rankings. We have better ones. Scores are computed by our proprietary
          algorithm (vibes, weighted by ducks).
        </p>
      </div>
      <Suspense
        fallback={
          <div className="grid gap-8 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        }
      >
        <RankingsBoard />
      </Suspense>
    </div>
  );
}
