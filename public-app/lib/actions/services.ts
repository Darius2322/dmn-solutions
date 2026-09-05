import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getActiveServices() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("services").select("*").eq("active", true).order("sort_order");
  return data ?? [];
}

export async function getServiceBySlug(slug: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("services").select("*").eq("slug", slug).eq("active", true).single();
  return data ?? null;
}
