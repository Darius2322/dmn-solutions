"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentAdmin } from "@/lib/auth/admin";

export async function createService(input: {
  title: string; description: string; category: string; slug: string;
  icon: string; priceLabel?: string; features: string[];
}) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("services")
    .insert({
      title: input.title, description: input.description, category: input.category,
      slug: input.slug, icon: input.icon, price_label: input.priceLabel ?? null,
      features: input.features, active: true,
    })
    .select("id").single();

  if (error || !data) return { success: false as const, error: "Could not create service" };

  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "service.created", resource_type: "service", resource_id: data.id, new_state: input,
  });

  revalidatePath("/services");
  return { success: true as const, id: data.id as string };
}

export async function updateService(serviceId: string, input: {
  title: string; description: string; category: string; slug: string;
  icon: string; priceLabel?: string; features: string[];
}) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("services").select("*").eq("id", serviceId).single();
  const { error } = await supabase
    .from("services")
    .update({
      title: input.title, description: input.description, category: input.category,
      slug: input.slug, icon: input.icon, price_label: input.priceLabel ?? null,
      features: input.features, updated_at: new Date().toISOString(),
    })
    .eq("id", serviceId);

  if (error) return { success: false as const, error: "Could not update service" };

  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "service.updated", resource_type: "service",
    resource_id: serviceId, previous_state: before, new_state: input,
  });

  revalidatePath("/services");
  return { success: true as const };
}

export async function reorderServices(orderedIds: string[]) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  await Promise.all(
    orderedIds.map((id, index) => supabase.from("services").update({ sort_order: index }).eq("id", id))
  );

  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "service.reordered", resource_type: "service", new_state: { order: orderedIds },
  });

  revalidatePath("/services");
  return { success: true as const };
}

export async function updateServiceStatus(serviceId: string, active: boolean) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("services").select("active").eq("id", serviceId).single();
  const { error } = await supabase.from("services").update({ active }).eq("id", serviceId);
  if (error) return { success: false as const, error: "Could not update service" };

  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: active ? "service.activated" : "service.deactivated",
    resource_type: "service", resource_id: serviceId, previous_state: before, new_state: { active },
  });

  revalidatePath("/services");
  return { success: true as const };
}

export async function deleteService(serviceId: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("services").select("*").eq("id", serviceId).single();
  const { error } = await supabase.from("services").delete().eq("id", serviceId);
  if (error) return { success: false as const, error: "Could not delete service" };

  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "service.deleted", resource_type: "service", resource_id: serviceId, previous_state: before,
  });

  revalidatePath("/services");
  return { success: true as const };
}

export async function updateRequestStatus(requestId: string, status: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("service_requests").select("status").eq("id", requestId).single();
  const { error } = await supabase.from("service_requests").update({ status }).eq("id", requestId);
  if (error) return { success: false as const, error: "Could not update status" };

  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "request.status_changed", resource_type: "service_request",
    resource_id: requestId, previous_state: before, new_state: { status },
  });

  return { success: true as const };
}

export async function assignRequest(requestId: string, assignedTo: string | null) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("service_requests").update({ assigned_to: assignedTo }).eq("id", requestId);
  if (error) return { success: false as const, error: "Could not assign request" };

  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "request.assigned", resource_type: "service_request",
    resource_id: requestId, new_state: { assigned_to: assignedTo },
  });

  revalidatePath("/requests");
  return { success: true as const };
}

export async function updateInternalNote(requestId: string, internalNotes: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("service_requests").update({ internal_notes: internalNotes }).eq("id", requestId);
  if (error) return { success: false as const, error: "Could not save note" };

  revalidatePath("/requests");
  return { success: true as const };
}
