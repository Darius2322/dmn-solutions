"use server";

import { getCurrentAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type SearchResult = { label: string; sublabel: string; href: string };

export async function searchAdmin(query: string): Promise<SearchResult[]> {
  const admin = await getCurrentAdmin();
  const trimmed = query.trim();
  if (!admin || trimmed.length < 2) return [];

  const supabase = createSupabaseAdminClient();
  const q = `%${trimmed}%`;

  const [services, portfolio, partners, requests, messages] = await Promise.all([
    supabase.from("services").select("id, title").ilike("title", q).limit(5),
    supabase.from("portfolio").select("id, title").ilike("title", q).limit(5),
    supabase.from("partners").select("id, name").ilike("name", q).limit(5),
    supabase.from("service_requests").select("id, tracking_number, customer_name").or(`customer_name.ilike.${q},tracking_number.ilike.${q}`).limit(5),
    supabase.from("contact_messages").select("id, name").ilike("name", q).limit(5),
  ]);

  const results: SearchResult[] = [];
  (services.data ?? []).forEach((s) => results.push({ label: s.title, sublabel: "Service", href: "/services" }));
  (portfolio.data ?? []).forEach((p) => results.push({ label: p.title, sublabel: "Portfolio", href: "/portfolio" }));
  (partners.data ?? []).forEach((p) => results.push({ label: p.name, sublabel: "Partner", href: "/partners" }));
  (requests.data ?? []).forEach((r) =>
    results.push({ label: `${r.customer_name} (${r.tracking_number})`, sublabel: "Request", href: "/requests" })
  );
  (messages.data ?? []).forEach((m) => results.push({ label: m.name, sublabel: "Message", href: "/messages" }));

  return results;
}
