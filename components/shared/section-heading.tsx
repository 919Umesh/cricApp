import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {href ? (
        <Button variant="ghost" size="sm" asChild className="shrink-0 text-muted-foreground">
          <Link href={href}>
            {linkLabel}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
