"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter, type ActionState } from "@/lib/actions/community";

const initialState: ActionState = { ok: false, message: "" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialState);

  return (
    <div>
      <form action={formAction} className="flex w-full max-w-md gap-2">
        <Input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          aria-label="Email address"
          className="bg-background/80"
        />
        <Button type="submit" disabled={pending}>
          <Send className="size-4" />
          {pending ? "Joining…" : "Subscribe"}
        </Button>
      </form>
      {state.message ? (
        <p
          className={`mt-2 text-sm ${state.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
