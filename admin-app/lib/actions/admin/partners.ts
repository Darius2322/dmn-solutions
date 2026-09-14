"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentAdmin } from "@/lib/auth/admin";

type PartnerInput = {
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  sortOrder?: number;
};

export async function createPartner(input: PartnerInput) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("partners")
    .insert({
      name: input.name,
      logo_url: input.logoUrl ?? null,
      website_url: input.websiteUrl ?? null,
      sort_order: input.sortOrder ?? 0,
    })
    .select("id")
    .single();

  if (error || !data) return { success: false as const, error: "Could not create partner" };
  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "partner.created", resource_type: "partner", resource_id: data.id, new_state: input,
  });
  revalidatePath("/partners");
  return { success: true as const, id: data.id as string };
}

export async function updatePartner(partnerId: string, input: PartnerInput) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("partners").select("*").eq("id", partnerId).single();
  const { error } = await supabase
    .from("partners")
    .update({
      name: input.name,
      logo_url: input.logoUrl ?? null,
      website_url: input.websiteUrl ?? null,
      sort_order: input.sortOrder ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", partnerId);

  if (error) return { success: false as const, error: "Could not update partner" };
  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "partner.updated", resource_type: "partner",
    resource_id: partnerId, previous_state: before, new_state: input,
  });
  revalidatePath("/partners");
  return { success: true as const };
}

export async function updatePartnerStatus(partnerId: string, active: boolean) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("partners").select("active").eq("id", partnerId).single();
  const { error } = await supabase.from("partners").update({ active }).eq("id", partnerId);
  if (error) return { success: false as const, error: "Could not update partner" };

  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: active ? "partner.activated" : "partner.deactivated",
    resource_type: "partner", resource_id: partnerId, previous_state: before, new_state: { active },
  });
  revalidatePath("/partners");
  return { success: true as const };
}

export async function deletePartner(partnerId: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("partners").select("*").eq("id", partnerId).single();
  const { error } = await supabase.from("partners").delete().eq("id", partnerId);
  if (error) return { success: false as const, error: "Could not delete partner" };

  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "partner.deleted", resource_type: "partner", resource_id: partnerId, previous_state: before,
  });
  revalidatePath("/partners");
  return { success: true as const };
}
