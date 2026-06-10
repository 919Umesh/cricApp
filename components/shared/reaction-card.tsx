import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { FanReaction } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ReactionCard({ reaction }: { reaction: FanReaction }) {
  return (
    <Card className="h-full py-0">
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <Quote className="size-5 text-primary/60" />
        <p className="flex-1 text-sm leading-relaxed">{reaction.reaction}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">@{reaction.username}</span>
          <span>{formatDate(reaction.$createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
