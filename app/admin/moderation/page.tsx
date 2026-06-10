import { Check, X } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { ActionButton } from "@/components/admin/action-button";
import { Card, CardContent } from "@/components/ui/card";
import { moderateMeme, moderateReaction } from "@/lib/actions/admin";
import { resolveImage } from "@/lib/appwrite/files";
import { listPendingReactions } from "@/lib/services/community";
import { listPendingMemes } from "@/lib/services/memes";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Moderation" };

export default async function ModerationPage() {
  const [memes, reactions] = await Promise.all([
    listPendingMemes(),
    listPendingReactions(),
  ]);

  return (
    <div>
      <h1 className="font-heading mb-1 text-2xl font-bold">Moderation Queue</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Approve the funny, reject the unkind. Performances are fair game; people are not.
      </p>

      <section className="mb-10">
        <h2 className="font-heading mb-4 text-lg font-semibold">
          Pending memes ({memes.length})
        </h2>
        {memes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Queue empty. Suspiciously professional.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {memes.map((meme) => (
              <Card key={meme.$id} className="overflow-hidden py-0">
                <div className="relative aspect-video bg-secondary">
                  <Image
                    src={resolveImage(meme.image, "/placeholder-post.svg")}
                    alt={meme.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <CardContent className="space-y-3 p-4">
                  <div>
                    <p className="truncate text-sm font-semibold">{meme.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by {meme.submittedBy ?? "anonymous"} · {formatDate(meme.$createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <ActionButton action={moderateMeme.bind(null, meme.$id, "published")}>
                      <Check className="size-3.5" />
                      Approve
                    </ActionButton>
                    <ActionButton
                      variant="destructive"
                      action={moderateMeme.bind(null, meme.$id, "rejected")}
                    >
                      <X className="size-3.5" />
                      Reject
                    </ActionButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-heading mb-4 text-lg font-semibold">
          Pending reactions ({reactions.length})
        </h2>
        {reactions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No hot takes awaiting review.
          </p>
        ) : (
          <div className="grid gap-4">
            {reactions.map((reaction) => (
              <Card key={reaction.$id} className="py-0">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{reaction.reaction}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      @{reaction.username} · {formatDate(reaction.$createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <ActionButton action={moderateReaction.bind(null, reaction.$id, true)}>
                      <Check className="size-3.5" />
                      Approve
                    </ActionButton>
                    <ActionButton
                      variant="destructive"
                      action={moderateReaction.bind(null, reaction.$id, false)}
                    >
                      <X className="size-3.5" />
                      Delete
                    </ActionButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
