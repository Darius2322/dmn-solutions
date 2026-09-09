import type { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dmn-solution.vercel.app";

const STATIC_ROUTES = ["", "/services", "/portfolio", "/about", "/support", "/track-order", "/contact", "/referral", "/donate", "/privacy", "/terms", "/refund-policy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseServerClient();
  const [{ data: services }, { data: portfolio }] = await Promise.all([
    supabase.from("services").select("slug, updated_at").eq("active", true),
    supabase.from("portfolio").select("slug, created_at"),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.6,
  }));
  const serviceEntries: MetadataRoute.Sitemap = (services ?? []).map((s) => ({
    url: `${BASE_URL}/services/${s.slug}`, lastModified: s.updated_at, changeFrequency: "monthly", priority: 0.7,
  }));
  const portfolioEntries: MetadataRoute.Sitemap = (portfolio ?? []).map((p) => ({
    url: `${BASE_URL}/portfolio/${p.slug}`, lastModified: p.created_at, changeFrequency: "monthly", priority: 0.5,
  }));

  return [...staticEntries, ...serviceEntries, ...portfolioEntries];
}
