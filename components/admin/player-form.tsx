"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { savePlayer, type AdminActionState } from "@/lib/actions/admin";
import type { Player } from "@/lib/types";

const initialState: AdminActionState = { ok: false, message: "" };
const ROLES = ["Batter", "Bowler", "All-Rounder", "Wicket-Keeper"];

import { Pencil, Plus } from "lucide-react";

export function PlayerForm({
  player,
}: {
  player?: Player;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function formAction(formData: FormData) {
    startTransition(async () => {
      const result = await savePlayer(initialState, formData);
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
        setError(null);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {player ? (
          <Button variant="outline" size="sm">
            <Pencil className="size-3.5" />
            Edit
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Add player
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle className="font-heading">
          {player ? `Edit ${player.name}` : "Add player"}
        </DialogTitle>
        <form action={formAction} className="grid gap-4">
          {player ? <input type="hidden" name="rowId" value={player.$id} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" name="name" required defaultValue={player?.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-slug">Slug</Label>
              <Input
                id="p-slug"
                name="slug"
                required
                pattern="[a-z0-9-]+"
                defaultValue={player?.slug}
                placeholder="rohit-paudel"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-role">Role</Label>
              <select
                id="p-role"
                name="role"
                defaultValue={player?.role ?? "Batter"}
                className="border-input bg-transparent dark:bg-input/30 h-9 rounded-md border px-3 text-sm shadow-xs"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-team">Team</Label>
              <Input id="p-team" name="team" defaultValue={player?.team ?? "Nepal"} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-bat">Batting style</Label>
              <Input
                id="p-bat"
                name="battingStyle"
                defaultValue={player?.battingStyle ?? ""}
                placeholder="Right-hand bat"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-bowl">Bowling style</Label>
              <Input
                id="p-bowl"
                name="bowlingStyle"
                defaultValue={player?.bowlingStyle ?? ""}
                placeholder="Right-arm medium"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-meme">Meme score (0–100)</Label>
              <Input
                id="p-meme"
                name="memeScore"
                type="number"
                min={0}
                max={100}
                defaultValue={player?.memeScore ?? 50}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-fan">Fan score (0–100)</Label>
              <Input
                id="p-fan"
                name="fanScore"
                type="number"
                min={0}
                max={100}
                defaultValue={player?.fanScore ?? 50}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-form">Current form (one-liner)</Label>
            <Input id="p-form" name="currentForm" defaultValue={player?.currentForm ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-bio">Bio (satirical but kind)</Label>
            <Textarea id="p-bio" name="bio" rows={3} defaultValue={player?.bio ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-stats">Stats (JSON)</Label>
            <Textarea
              id="p-stats"
              name="stats"
              rows={3}
              className="font-mono text-xs"
              defaultValue={
                player?.stats ??
                '{"matches":0,"runs":0,"average":0,"strikeRate":0,"wickets":0,"economy":0,"ducks":0,"catchesDropped":0,"highestScore":0}'
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="p-image">Photo (replaces current)</Label>
              <Input id="p-image" name="image" type="file" accept="image/*" />
            </div>
            <label className="flex items-center gap-2 self-end pb-1 text-sm">
              <input
                type="checkbox"
                name="trending"
                defaultChecked={player?.trending}
                className="size-4 accent-primary"
              />
              Trending right now
            </label>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : player ? "Save changes" : "Create player"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
