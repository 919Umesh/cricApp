import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "now";
  const days = Math.floor(diff / 86_400_000);
  if (days > 0) return `in ${days} day${days === 1 ? "" : "s"}`;
  const hours = Math.floor(diff / 3_600_000);
  if (hours > 0) return `in ${hours} hour${hours === 1 ? "" : "s"}`;
  return "soon";
}
