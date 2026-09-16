"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SiteSearchResult = { label: string; sublabel: string; href: string };

export async function searchSite(query: string): Promise<SiteSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const supabase = createSupabaseServerClient();
  const q = `%${trimmed}%`;

  const [services, portfolio] = await Promise.all([
    supabase.from("services").select("title, slug").eq("active", true).ilike("title", q).limit(5),
    supabase.from("portfolio").select("title, slug").eq("active", true).ilike("title", q).limit(5),
  ]);

  const results: SiteSearchResult[] = [];
  (services.data ?? []).forEach((s) => results.push({ label: s.title, sublabel: "Service", href: `/services/${s.slug}` }));
  (portfolio.data ?? []).forEach((p) => results.push({ label: p.title, sublabel: "Portfolio", href: `/portfolio/${p.slug}` }));

  return results;
}
