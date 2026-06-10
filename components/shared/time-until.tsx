"use client";

import { useSyncExternalStore } from "react";
import { formatDate, timeUntil } from "@/lib/utils";

const noopSubscribe = () => () => {};

/**
 * Relative "in X days" label computed in the browser so prerendered pages
 * stay deterministic (Cache Components disallows Date.now() during render).
 * Server-side it falls back to the absolute date.
 */
export function TimeUntil({ iso }: { iso: string }) {
  const label = useSyncExternalStore(
    noopSubscribe,
    () => timeUntil(iso),
    () => null,
  );

  return <>{label ?? formatDate(iso)}</>;
}
