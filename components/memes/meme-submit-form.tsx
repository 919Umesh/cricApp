"use client";

import { ImagePlus } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitMeme, type ActionState } from "@/lib/actions/community";

const initialState: ActionState = { ok: false, message: "" };

export function MemeSubmitForm() {
  const [state, formAction, pending] = useActionState(submitMeme, initialState);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <ImagePlus className="size-4" />
          Submit a meme
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="font-heading">Submit your masterpiece</DialogTitle>
        <DialogDescription>
          Keep it funny, keep it kind. We roast performances, not people. Submissions go through
          moderation (a human laughing at their desk).
        </DialogDescription>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="meme-title">Title</Label>
            <Input id="meme-title" name="title" required placeholder="The Collapse (Director's Cut)" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="meme-author">Your name</Label>
            <Input id="meme-author" name="submittedBy" required placeholder="MomoOverMatch" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="meme-image">Image (max 10 MB)</Label>
            <Input id="meme-image" name="image" type="file" accept="image/*" required />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Uploading…" : "Send it"}
          </Button>
          {state.message ? (
            <p
              className={`text-sm ${state.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
              role="status"
            >
              {state.message}
            </p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
