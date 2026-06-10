import type { Metadata } from "next";
import { Suspense } from "react";
import { PollWidget } from "@/components/community/poll-widget";
import { ReactionForm } from "@/components/community/reaction-form";
import { MemeSubmitForm } from "@/components/memes/meme-submit-form";
import { EmptyState } from "@/components/shared/empty-state";
import { ReactionCard } from "@/components/shared/reaction-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { listActivePolls, listReactions } from "@/lib/services/community";
import { listPlayers } from "@/lib/services/players";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Submit reactions, vote in polls and share memes. The Silly Point community: more reliable than the top order since day one.",
};

async function SubmitSection() {
  const { rows: players } = await listPlayers({ limit: 50 });
  return <ReactionForm players={players} />;
}

async function PollsSection() {
  const polls = await listActivePolls(2);
  if (polls.length === 0) return null;
  return (
    <div className="grid gap-6">
      {polls.map((poll) => (
        <PollWidget key={poll.$id} poll={poll} />
      ))}
    </div>
  );
}

async function ReactionsWall() {
  const reactions = await listReactions({ limit: 18 });
  if (reactions.length === 0) {
    return <EmptyState title="No reactions yet" hint="Be the first to roast responsibly." />;
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {reactions.map((reaction) => (
        <ReactionCard key={reaction.$id} reaction={reaction} />
      ))}
    </div>
  );
}

export default function CommunityPage() {
  return (
    <div className="container-page py-14">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
            The 12th Player
          </p>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Community
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Reactions, polls and fan submissions. The only place where Nepal&apos;s fielding
            statistics bring people together.
          </p>
        </div>
        <MemeSubmitForm />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <Suspense fallback={<Skeleton className="h-72 rounded-xl" />}>
            <SubmitSection />
          </Suspense>
          <div>
            <SectionHeading eyebrow="Live from the stands" title="Reaction Wall" />
            <Suspense
              fallback={
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-xl" />
                  ))}
                </div>
              }
            >
              <ReactionsWall />
            </Suspense>
          </div>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Suspense fallback={<Skeleton className="h-80 rounded-xl" />}>
            <PollsSection />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
