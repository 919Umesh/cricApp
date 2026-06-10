import {
  Flag,
  LayoutDashboard,
  Newspaper,
  Settings,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LogoutButton } from "@/components/admin/logout-button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin | Silly Point" },
  robots: { index: false, follow: false },
};

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/players", label: "Players", icon: Users },
  { href: "/admin/posts", label: "Posts", icon: Newspaper },
  { href: "/admin/moderation", label: "Moderation", icon: Flag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[230px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="truncate text-sm font-semibold">{user.name || user.email}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {ADMIN_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
          <LogoutButton />
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="container-page grid gap-8 py-10 lg:grid-cols-[230px_1fr]">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-130 rounded-xl" />
        </div>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
