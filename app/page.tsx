import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import {
  DiscussedPlayersSection,
  FanReactionsSection,
  FeaturedMemesSection,
  LatestArticlesSection,
  LeaderboardSection,
  MatchDisastersSection,
  NewsletterSection,
  TrendingPostsSection,
} from "@/components/home/sections";
import { Skeleton } from "@/components/ui/skeleton";

function SectionSkeleton() {
  return (
    <div className="container-page py-16">
      <Skeleton className="mb-8 h-9 w-64" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="hidden h-72 rounded-xl lg:block" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={<SectionSkeleton />}>
        <TrendingPostsSection />
      </Suspense>
      <Suspense fallback={null}>
        <MatchDisastersSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <DiscussedPlayersSection />
      </Suspense>
      <Suspense fallback={null}>
        <FanReactionsSection />
      </Suspense>
      <Suspense fallback={null}>
        <FeaturedMemesSection />
      </Suspense>
      <Suspense fallback={null}>
        <LeaderboardSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <LatestArticlesSection />
      </Suspense>
      <NewsletterSection />
    </>
  );
}
