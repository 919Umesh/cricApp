import { ArrowRight, Flame, Trophy } from "lucide-react";
import Link from "next/link";
import { HeroReveal } from "@/components/shared/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/nav";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/70 via-background to-background"
      />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -z-10 h-130 w-225 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="container-page flex flex-col items-center py-20 text-center sm:py-28">
        <HeroReveal>
          <Badge variant="outline" className="mb-6 gap-1.5 rounded-full px-4 py-1.5 text-xs">
            <Flame className="size-3.5 text-primary" />
            Fresh disasters served daily
          </Badge>
          <h1 className="font-heading mx-auto max-w-4xl text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Nepali cricket,
            <br />
            <span className="text-gradient">lovingly roasted.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {SITE_NAME} is the nation&apos;s premier destination for golden ducks, synchronized
            collapses, dropped sitters and the heroes who deliver them. ESPN meets meme culture —
            all love, zero malice.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/posts">
                Read the Satire
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/rankings">
                <Trophy className="size-4" />
                The Rankings of Shame
              </Link>
            </Button>
          </div>
        </HeroReveal>
      </div>
    </section>
  );
}
