import { MetadataRoute } from "next";

function resolveSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dmn-solution.vercel.app";
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/track-order/", "/api/"],
    },
    sitemap: `${resolveSiteUrl()}/sitemap.xml`,
  };
}
