import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { ActionButton } from "@/components/admin/action-button";
import { PlayerForm } from "@/components/admin/player-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deletePlayer } from "@/lib/actions/admin";
import { resolveImage } from "@/lib/appwrite/files";
import { listPlayers } from "@/lib/services/players";

export const metadata: Metadata = { title: "Players" };

export default async function AdminPlayersPage() {
  const { rows: players } = await listPlayers({ limit: 100 });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Players</h1>
          <p className="text-sm text-muted-foreground">{players.length} on the roster</p>
        </div>
        <PlayerForm />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-center">Meme</TableHead>
              <TableHead className="text-center">Fan</TableHead>
              <TableHead className="text-center">Trending</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.$id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      src={resolveImage(player.image, "/placeholder-player.svg")}
                      alt={player.name}
                      width={36}
                      height={36}
                      className="rounded-full border border-border"
                    />
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-xs text-muted-foreground">/{player.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{player.role}</Badge>
                </TableCell>
                <TableCell className="text-center font-mono">{player.memeScore}</TableCell>
                <TableCell className="text-center font-mono">{player.fanScore}</TableCell>
                <TableCell className="text-center">{player.trending ? "🔥" : "—"}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <PlayerForm player={player} />
                    <ActionButton
                      variant="destructive"
                      action={deletePlayer.bind(null, player.$id)}
                      confirm={`Retire ${player.name} permanently? This deletes the player.`}
                    >
                      <Trash2 className="size-3.5" />
                    </ActionButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No players yet. Run <code>npm run seed</code> or add one above.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
