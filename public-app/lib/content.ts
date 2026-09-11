import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getSiteContent<T = unknown>(key: string, fallback: T): Promise<T> {
  const supabase = createSupabaseServerClient();
  const { data: rawData, error } = await supabase.from("site_content").select("value").eq("key", key).single();
  const data = rawData as { value: unknown } | null;
  if (error || !data) return fallback;
  return data.value as T;
}

export async function getSiteContentBatch(keys: string[]): Promise<Record<string, unknown>> {
  const supabase = createSupabaseServerClient();
  const { data: rawData, error } = await supabase.from("site_content").select("key, value").in("key", keys);
  const data = rawData as { key: string; value: unknown }[] | null;
  if (error || !data) return {};
  return Object.fromEntries(data.map((row) => [row.key, row.value]));
}
