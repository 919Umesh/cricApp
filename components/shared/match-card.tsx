import { CalendarDays, MapPin } from "lucide-react";
import { TimeUntil } from "@/components/shared/time-until";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Match } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const resultStyles: Record<Match["result"], string> = {
  won: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  lost: "bg-red-500/15 text-red-600 dark:text-red-400",
  tied: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "no-result": "bg-muted text-muted-foreground",
  upcoming: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  live: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const resultLabels: Record<Match["result"], string> = {
  won: "Won",
  lost: "Lost",
  tied: "Tied",
  "no-result": "No Result",
  upcoming: "Upcoming",
  live: "● LIVE",
};

export function MatchCard({ match, showAnalysis = false }: { match: Match; showAnalysis?: boolean }) {
  return (
    <Card className="h-full py-0">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="font-mono text-[11px]">
            {match.format}
          </Badge>
          <Badge className={resultStyles[match.result]}>{resultLabels[match.result]}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="font-heading font-semibold">🇳🇵 Nepal</span>
            <span className="font-mono text-sm text-muted-foreground">
              {match.nepalScore ??
                (match.result === "upcoming" ? <TimeUntil iso={match.date} /> : "—")}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-heading font-semibold">{match.opponent}</span>
            <span className="font-mono text-sm text-muted-foreground">
              {match.opponentScore ?? "—"}
            </span>
          </div>
        </div>

        {match.summary ? (
          <p className="line-clamp-3 text-sm text-muted-foreground">{match.summary}</p>
        ) : null}

        {showAnalysis && match.funnyAnalysis ? (
          <div className="rounded-xl bg-accent/60 p-3 text-sm text-accent-foreground">
            <p className="mb-1 text-[11px] font-bold tracking-widest uppercase">
              Totally Serious Analysis
            </p>
            <p className="line-clamp-4">{match.funnyAnalysis}</p>
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {formatDate(match.date)}
          </span>
          {match.venue ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {match.venue}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
