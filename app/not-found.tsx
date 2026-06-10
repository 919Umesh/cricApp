import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center justify-center py-32 text-center">
      <p className="font-heading text-7xl font-bold text-primary">404</p>
      <h1 className="font-heading mt-4 text-2xl font-bold sm:text-3xl">
        Clean bowled. This page is a golden duck.
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        It faced one ball, missed it completely, and walked back to the pavilion. The page you
        wanted doesn&apos;t exist — much like our middle-order resistance.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Back to the pavilion</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/posts">Read some satire</Link>
        </Button>
      </div>
    </div>
  );
}
