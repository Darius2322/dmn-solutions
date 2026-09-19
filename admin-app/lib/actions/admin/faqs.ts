"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentAdmin } from "@/lib/auth/admin";

type FaqInput = { question: string; answer: string; category?: string; sortOrder?: number };

export async function createFaq(input: FaqInput) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("faqs")
    .insert({ question: input.question, answer: input.answer, category: input.category || null, sort_order: input.sortOrder ?? 0 })
    .select("id")
    .single();

  if (error || !data) return { success: false as const, error: "Could not create FAQ" };
  await supabase.from("audit_log").insert({ actor_id: admin.id, action: "faq.created", resource_type: "faq", resource_id: data.id, new_state: input });
  revalidatePath("/faqs");
  return { success: true as const, id: data.id as string };
}

export async function updateFaq(faqId: string, input: FaqInput) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("faqs")
    .update({ question: input.question, answer: input.answer, category: input.category || null, sort_order: input.sortOrder ?? 0 })
    .eq("id", faqId);

  if (error) return { success: false as const, error: "Could not update FAQ" };
  await supabase.from("audit_log").insert({ actor_id: admin.id, action: "faq.updated", resource_type: "faq", resource_id: faqId, new_state: input });
  revalidatePath("/faqs");
  return { success: true as const };
}

export async function updateFaqStatus(faqId: string, active: boolean) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("faqs").update({ active }).eq("id", faqId);
  if (error) return { success: false as const, error: "Could not update FAQ" };
  await supabase.from("audit_log").insert({ actor_id: admin.id, action: active ? "faq.activated" : "faq.deactivated", resource_type: "faq", resource_id: faqId, new_state: { active } });
  revalidatePath("/faqs");
  return { success: true as const };
}

export async function deleteFaq(faqId: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("faqs").delete().eq("id", faqId);
  if (error) return { success: false as const, error: "Could not delete FAQ" };
  await supabase.from("audit_log").insert({ actor_id: admin.id, action: "faq.deleted", resource_type: "faq", resource_id: faqId });
  revalidatePath("/faqs");
  return { success: true as const };
}
