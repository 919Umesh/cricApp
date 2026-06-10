import type { NextConfig } from "next";

const appwriteHost = (() => {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://fra.cloud.appwrite.io/v1",
    ).hostname;
  } catch {
    return "fra.cloud.appwrite.io";
  }
})();

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: appwriteHost,
        pathname: "/v1/storage/buckets/**",
      },
    ],
    // Seeded artwork is SVG served from Appwrite Storage.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
