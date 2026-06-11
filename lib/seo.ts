import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  canonical?: string;
}

export function generateSEOMetadata(props: SEOProps): Metadata {
  const {
    title,
    description,
    image = `${siteUrl}/og-image.jpg`,
    url,
    type = "website",
    publishedTime,
    modifiedTime,
    canonical = url,
  } = props;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: type === "article" ? "article" : "website",
      title,
      description,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@cricsatire",
    },
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateArticleSchema(props: {
  title: string;
  description: string;
  image: string;
  publishedTime: string;
  modifiedTime: string;
  author: string;
  url: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: props.title,
    description: props.description,
    image: {
      "@type": "ImageObject",
      url: props.image,
      width: 1200,
      height: 630,
    },
    datePublished: props.publishedTime,
    dateModified: props.modifiedTime,
    author: {
      "@type": "Organization",
      name: props.author,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": props.url,
    },
  };
}

export function generatePersonSchema(props: {
  name: string;
  image: string;
  jobTitle: string;
  team: string;
  url: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: props.name,
    image: props.image,
    jobTitle: props.jobTitle,
    affiliation: {
      "@type": "SportsTeam",
      name: props.team,
    },
    url: props.url,
  };
}

export function generateSportsTeamSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: "Nepal National Cricket Team",
    sport: "Cricket",
    url: `${siteUrl}/players`,
  };
}

export const CRICKET_KEYWORDS = [
  "Nepal cricket",
  "cricket news",
  "cricket satire",
  "cricket memes",
  "Nepal cricket team",
  "cricket humor",
  "cricket analysis",
  "cricket stats",
  "cricket rankings",
  "cricket scores",
  "T20 cricket",
  "ODI cricket",
  "test cricket",
  "cricket commentary",
  "cricket entertainment",
];
