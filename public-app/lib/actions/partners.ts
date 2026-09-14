import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getActivePartners() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("partners")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  return data ?? [];
}
