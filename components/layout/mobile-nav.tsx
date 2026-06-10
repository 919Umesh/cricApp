"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NAV_LINKS, SITE_NAME } from "@/lib/nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="top-16 max-w-[92vw] translate-y-0 rounded-2xl p-6 md:hidden">
        <DialogTitle className="font-heading text-lg">{SITE_NAME}</DialogTitle>
        <nav className="mt-2 grid gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="rounded-lg px-3 py-2.5 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/search"
            onClick={close}
            className="rounded-lg px-3 py-2.5 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Search
          </Link>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
