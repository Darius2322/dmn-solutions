import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/track-order/", "/api/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://dmn-solution.vercel.app"}/sitemap.xml`,
  };
}
