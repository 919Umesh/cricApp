"use client";

import { MessageSquarePlus } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitReaction, type ActionState } from "@/lib/actions/community";
import type { Player } from "@/lib/types";

const initialState: ActionState = { ok: false, message: "" };

export function ReactionForm({ players }: { players: Player[] }) {
  const [state, formAction, pending] = useActionState(submitReaction, initialState);

  return (
    <Card className="py-0">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquarePlus className="size-5 text-primary" />
          <h2 className="font-heading text-lg font-bold">Drop your hot take</h2>
        </div>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="rx-name">Your handle</Label>
              <Input id="rx-name" name="username" required placeholder="EverestEdge" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rx-player">About a player (optional)</Label>
              <select
                id="rx-player"
                name="playerId"
                className="border-input bg-transparent dark:bg-input/30 h-9 rounded-md border px-3 text-sm shadow-xs"
                defaultValue=""
              >
                <option value="">The whole team, honestly</option>
                {players.map((p) => (
                  <option key={p.$id} value={p.$id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rx-text">Your reaction (max 500 chars)</Label>
            <Textarea
              id="rx-text"
              name="reaction"
              required
              maxLength={500}
              rows={3}
              placeholder="I've seen better running between the wickets at a momo stall queue…"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Reactions are moderated. Performances are fair game; people are not.
            </p>
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Submit"}
            </Button>
          </div>
          {state.message ? (
            <p
              className={`text-sm ${state.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
              role="status"
            >
              {state.message}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
