"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { votePoll } from "@/lib/actions/community";
import { parsePollOptions, type Poll, type PollOption } from "@/lib/types";

export function PollWidget({ poll }: { poll: Poll }) {
  const [options, setOptions] = useState<PollOption[]>(() => parsePollOptions(poll.options));
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  function handleVote(optionId: string) {
    if (votedFor || pending) return;
    setVotedFor(optionId);
    setOptions((prev) =>
      prev.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o)),
    );
    startTransition(async () => {
      const res = await votePoll(poll.$id, optionId);
      if (!res.ok) {
        setVotedFor(null);
        setOptions(parsePollOptions(poll.options));
        toast.error(res.message);
      }
    });
  }

  return (
    <Card className="py-0">
      <CardContent className="p-6">
        <p className="mb-1 text-[11px] font-bold tracking-widest text-primary uppercase">
          Community Poll
        </p>
        <h3 className="font-heading mb-4 text-lg font-bold">{poll.question}</h3>
        <div className="grid gap-2.5">
          {options.map((option) => {
            const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            const isChoice = votedFor === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={Boolean(votedFor)}
                onClick={() => handleVote(option.id)}
                className={`relative overflow-hidden rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                  isChoice
                    ? "border-primary"
                    : "border-border hover:border-primary/50"
                } ${votedFor ? "cursor-default" : "cursor-pointer"}`}
              >
                {votedFor ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                ) : null}
                <span className="relative flex items-center justify-between gap-3">
                  <span className="font-medium">{option.label}</span>
                  {votedFor ? (
                    <span className="font-mono text-xs text-muted-foreground">{pct}%</span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {totalVotes.toLocaleString()} votes
          {votedFor ? " — thanks for voting!" : ""}
        </p>
      </CardContent>
    </Card>
  );
}
