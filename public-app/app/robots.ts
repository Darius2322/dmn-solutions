import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const adminSegment = process.env.ADMIN_ROUTE_SEGMENT;
  if (!adminSegment) throw new Error("ADMIN_ROUTE_SEGMENT env var is not set");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [`/${adminSegment}/`, "/track-order/", "/api/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://dmn-solution.vercel.app"}/sitemap.xml`,
  };
}
