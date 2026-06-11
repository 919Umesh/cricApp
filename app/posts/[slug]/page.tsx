import { Eye } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LikeButton } from "@/components/posts/like-button";
import { ViewTracker } from "@/components/posts/view-tracker";
import { PostCard } from "@/components/shared/post-card";
import { ReactionCard } from "@/components/shared/reaction-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveImage } from "@/lib/appwrite/files";
import { SITE_NAME } from "@/lib/nav";
import { listReactions } from "@/lib/services/community";
import { listPlayers } from "@/lib/services/players";
import { getPostBySlug, listPublishedPosts } from "@/lib/services/posts";
import { SATIRE_CATEGORY_LABELS, type SatirePost } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/posts/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  const description = post.excerpt ?? post.content.slice(0, 160);
  const image = resolveImage(post.image, "/placeholder-post.svg");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const canonicalUrl = `${siteUrl}/posts/${post.slug}`;
  return {
    title: post.title,
    description,
    keywords: [post.title, "cricket satire", "cricket humor", SITE_NAME],
    authors: [{ name: SITE_NAME }],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.$createdAt,
      modifiedTime: post.$updatedAt,
      tags: [post.category, "cricket", "nepal"],
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image],
      creator: "@cricsatire",
    },
  };
}

async function RelatedAndReactions({ post }: { post: SatirePost }) {
  const [{ rows: related }, reactions] = await Promise.all([
    listPublishedPosts({ category: post.category, limit: 4 }),
    listReactions({ postId: post.$id, limit: 3 }),
  ]);
  const others = related.filter((p) => p.$id !== post.$id).slice(0, 3);

  return (
    <>
      {reactions.length > 0 ? (
        <section className="mt-14">
          <SectionHeading eyebrow="Live from the stands" title="Reactions" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reactions.map((r) => (
              <ReactionCard key={r.$id} reaction={r} />
            ))}
          </div>
        </section>
      ) : null}
      {others.length > 0 ? (
        <section className="mt-14">
          <SectionHeading eyebrow="More of the same energy" title="Related Satire" href="/posts" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <PostCard key={p.$id} post={p} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

async function PlayerChip({ playerId }: { playerId: string }) {
  const { rows } = await listPlayers({ limit: 100 });
  const player = rows.find((p) => p.$id === playerId);
  if (!player) return null;
  return (
    <Link href={`/players/${player.slug}`}>
      <Badge variant="outline" className="gap-1.5">
        <Image
          src={resolveImage(player.image, "/placeholder-player.svg")}
          alt={player.name}
          width={16}
          height={16}
          className="rounded-full"
        />
        {player.name}
      </Badge>
    </Link>
  );
}

async function PostArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "published") notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: post.title,
            description: post.excerpt ?? undefined,
            image: {
              "@type": "ImageObject",
              url: resolveImage(post.image, `${siteUrl}/placeholder-post.svg`),
              width: 1200,
              height: 630,
            },
            datePublished: post.$createdAt,
            dateModified: post.$updatedAt,
            author: { "@type": "Organization", name: SITE_NAME },
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
              logo: {
                "@type": "ImageObject",
                url: `${siteUrl}/logo.svg`,
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${siteUrl}/posts/${post.slug}`,
            },
            articleSection: "Cricket Satire",
            keywords: ["cricket", "nepal", "satire", "humor"],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteUrl,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Posts",
                item: `${siteUrl}/posts`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: `${siteUrl}/posts/${post.slug}`,
              },
            ],
          }),
        }}
      />
      <ViewTracker postId={post.$id} />

      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Link href={`/posts?category=${post.category}`}>
            <Badge>{SATIRE_CATEGORY_LABELS[post.category] ?? post.category}</Badge>
          </Link>
          {post.playerId ? (
            <Suspense fallback={null}>
              <PlayerChip playerId={post.playerId} />
            </Suspense>
          ) : null}
          {post.source === "auto" ? (
            <Badge variant="secondary" title="Generated by the satire pipeline">
              🤖 Auto-roasted
            </Badge>
          ) : null}
        </div>

        <h1 className="font-heading text-3xl leading-tight font-bold tracking-tight sm:text-5xl">
          {post.title}
        </h1>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{formatDate(post.$createdAt)}</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="size-4" />
            {post.views.toLocaleString()} views
          </span>
          <LikeButton postId={post.$id} initialLikes={post.likes} />
        </div>

        <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl border border-border bg-secondary">
          <Image
            src={resolveImage(post.image, "/placeholder-post.svg")}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>

        <Separator className="my-8" />

        <div className="space-y-5 text-[17px] leading-relaxed">
          {post.content.split(/\n{2,}|\\n\\n/).map((paragraph, i) => (
            <p key={i} className={i === 0 ? "font-medium" : "text-foreground/90"}>
              {paragraph.replace(/\\n/g, " ")}
            </p>
          ))}
        </div>

        <Separator className="my-8" />
        <p className="text-xs text-muted-foreground italic">
          Satire notice: this article roasts performances, not people. Names, quotes and
          committees are invented for comedy. The ducks, sadly, are real.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="mt-14 h-64 rounded-xl" />}>
        <RelatedAndReactions post={post} />
      </Suspense>
    </article>
  );
}

export default function PostPage({ params }: PageProps<"/posts/[slug]">) {
  return (
    <div className="container-page py-14">
      <Suspense
        fallback={
          <div className="mx-auto max-w-3xl space-y-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-40 w-full" />
          </div>
        }
      >
        <PostArticle params={params} />
      </Suspense>
    </div>
  );
}
