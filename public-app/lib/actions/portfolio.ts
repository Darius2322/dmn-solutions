import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getPortfolioProjects() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("portfolio")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getPortfolioBySlug(slug: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("portfolio").select("*").eq("slug", slug).eq("active", true).single();
  return data ?? null;
}
