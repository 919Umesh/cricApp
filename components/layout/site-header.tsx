import { Search } from "lucide-react";
import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE_NAME } from "@/lib/nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-sm">
            🏏
          </span>
          <span className="font-heading text-lg font-bold tracking-tight">
            {SITE_NAME}
            <span className="text-primary">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild aria-label="Search">
            <Link href="/search">
              <Search className="size-4" />
            </Link>
          </Button>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
