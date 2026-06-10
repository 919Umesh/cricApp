import { Flame } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { resolveImage } from "@/lib/appwrite/files";
import { parsePlayerStats, type Player } from "@/lib/types";

function ScoreBar({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full ${accent}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

export function PlayerCard({ player }: { player: Player }) {
  const stats = parsePlayerStats(player.stats);

  return (
    <Card className="group h-full overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/players/${player.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <Image
            src={resolveImage(player.image, "/placeholder-player.svg")}
            alt={player.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {player.trending ? (
            <Badge className="absolute top-3 left-3 gap-1 bg-primary text-primary-foreground">
              <Flame className="size-3" /> Trending
            </Badge>
          ) : null}
        </div>
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <h3 className="font-heading text-lg font-semibold transition-colors group-hover:text-primary">
              {player.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {player.role} · {player.team}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-secondary/60 p-3 text-center">
            <div>
              <p className="text-sm font-bold">{stats.matches}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Mat</p>
            </div>
            <div>
              <p className="text-sm font-bold">{stats.runs.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Runs</p>
            </div>
            <div>
              <p className="text-sm font-bold">{stats.ducks}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Ducks 🦆</p>
            </div>
          </div>
          <div className="mt-auto space-y-2.5">
            <ScoreBar label="Meme Score" value={player.memeScore} accent="bg-primary" />
            <ScoreBar label="Fan Love" value={player.fanScore} accent="bg-emerald-500" />
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
