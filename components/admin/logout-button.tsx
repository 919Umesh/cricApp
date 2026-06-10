"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => logout())}
      disabled={pending}
      className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
    >
      <LogOut className="size-4" />
      {pending ? "Walking back…" : "Sign out"}
    </button>
  );
}
