import type { MetadataRoute } from "next";
import { listAllPlayerSlugs } from "@/lib/services/players";
import { listAllPostSlugs } from "@/lib/services/posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/posts`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/players`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/memes`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/rankings`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/matches`, changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/community`, changeFrequency: "daily", priority: 0.6 },
  ];

  const [playerSlugs, postSlugs] = await Promise.all([
    listAllPlayerSlugs(),
    listAllPostSlugs(),
  ]);

  return [
    ...staticRoutes,
    ...playerSlugs.map((slug) => ({
      url: `${siteUrl}/players/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...postSlugs.map((slug) => ({
      url: `${siteUrl}/posts/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
