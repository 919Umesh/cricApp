import Link from "next/link";
import { NAV_LINKS, SITE_NAME, SITE_TAGLINE } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-lg text-primary-foreground">
              🏏
            </span>
            <span className="font-heading text-lg font-bold">{SITE_NAME}</span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">{SITE_TAGLINE}</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Satire, parody and meme content. We roast performances, never people.
            All statistics are real-ish; all affection is genuine.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-foreground">Explore</h3>
          <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/search" className="transition-colors hover:text-foreground">
                Search
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition-colors hover:text-foreground">
                Admin
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-foreground">House Rules</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>1. The duck stamp is sacred.</li>
            <li>2. Every collapse deserves a montage.</li>
            <li>3. We love this team beyond reason.</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5">
        <p className="container-page text-xs text-muted-foreground">
          © 2026 {SITE_NAME}. Unofficial, unaffiliated, unserious.
        </p>
      </div>
    </footer>
  );
}
