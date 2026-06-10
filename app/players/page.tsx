import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { FadeIn } from "@/components/shared/motion";
import { PlayerCard } from "@/components/shared/player-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { listPlayers } from "@/lib/services/players";

export const metadata: Metadata = {
  title: "Players",
  description:
    "Nepal's finest cricketers, ranked by meme score, fan love and duck collection. Profiles, stats and satire timelines.",
};

const ROLES = ["Batter", "Bowler", "All-Rounder", "Wicket-Keeper"] as const;

async function PlayersGrid({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const activeRole = ROLES.find((r) => r === role);
  const { rows: players } = await listPlayers({ role: activeRole, limit: 50 });

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/players">
          <Badge
            variant={!activeRole ? "default" : "secondary"}
            className="cursor-pointer px-3 py-1.5"
          >
            All
          </Badge>
        </Link>
        {ROLES.map((r) => (
          <Link key={r} href={`/players?role=${encodeURIComponent(r)}`}>
            <Badge
              variant={activeRole === r ? "default" : "secondary"}
              className="cursor-pointer px-3 py-1.5"
            >
              {r}
            </Badge>
          </Link>
        ))}
      </div>
      {players.length === 0 ? (
        <EmptyState title="No players found" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {players.map((player, i) => (
            <FadeIn key={player.$id} index={i % 4}>
              <PlayerCard player={player} />
            </FadeIn>
          ))}
        </div>
      )}
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-96 rounded-xl" />
      ))}
    </div>
  );
}

export default function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  return (
    <div className="container-page py-14">
      <div className="mb-10">
        <p className="mb-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
          The Roster
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Players</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every hero, every villain, every duck collector. Ranked by meme score, because that&apos;s
          the only ranking we fully control.
        </p>
      </div>
      <Suspense fallback={<GridSkeleton />}>
        <PlayersGrid searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
