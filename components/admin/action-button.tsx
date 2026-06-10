"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { AdminActionState } from "@/lib/actions/admin";

/**
 * Runs a pre-bound server action, toasts the result and refreshes the
 * current route so uncached admin lists update.
 */
export function ActionButton({
  action,
  children,
  variant = "outline",
  size = "sm",
  confirm,
}: {
  action: () => Promise<AdminActionState>;
  children: React.ReactNode;
  variant?: "default" | "outline" | "destructive" | "ghost" | "secondary";
  size?: "sm" | "default" | "icon";
  confirm?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (confirm && !window.confirm(confirm)) return;
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Button variant={variant} size={size} onClick={handleClick} disabled={pending}>
      {children}
    </Button>
  );
}
