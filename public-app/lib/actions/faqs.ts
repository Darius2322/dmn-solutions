import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getActiveFaqs() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("faqs").select("*").eq("active", true).order("sort_order");
  return data ?? [];
}
