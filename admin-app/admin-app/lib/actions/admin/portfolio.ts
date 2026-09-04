"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentAdmin } from "@/lib/auth/admin";

type ProjectInput = {
  title: string; slug: string; description: string; category: string;
  technologies: string[]; imageUrl?: string; liveUrl?: string;
  clientName?: string; completionDate?: string; tags: string[]; featured: boolean;
};

export async function createProject(input: ProjectInput) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("portfolio")
    .insert({
      title: input.title, slug: input.slug, description: input.description,
      category: input.category, technologies: input.technologies,
      image_url: input.imageUrl ?? null, live_url: input.liveUrl ?? null,
      client_name: input.clientName ?? null, completion_date: input.completionDate ?? null,
      tags: input.tags, featured: input.featured,
    })
    .select("id").single();

  if (error || !data) return { success: false as const, error: "Could not create project" };
  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "portfolio.created", resource_type: "portfolio", resource_id: data.id, new_state: input,
  });
  revalidatePath("/portfolio");
  return { success: true as const, id: data.id as string };
}

export async function updateProject(projectId: string, input: ProjectInput) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("portfolio").select("*").eq("id", projectId).single();
  const { error } = await supabase
    .from("portfolio")
    .update({
      title: input.title, slug: input.slug, description: input.description,
      category: input.category, technologies: input.technologies,
      image_url: input.imageUrl ?? null, live_url: input.liveUrl ?? null,
      client_name: input.clientName ?? null, completion_date: input.completionDate ?? null,
      tags: input.tags, featured: input.featured,
    })
    .eq("id", projectId);

  if (error) return { success: false as const, error: "Could not update project" };
  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "portfolio.updated", resource_type: "portfolio",
    resource_id: projectId, previous_state: before, new_state: input,
  });
  revalidatePath("/portfolio");
  return { success: true as const };
}

export async function toggleFeatured(projectId: string, featured: boolean) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("portfolio").update({ featured }).eq("id", projectId);
  if (error) return { success: false as const, error: "Could not update project" };

  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "portfolio.featured_toggled", resource_type: "portfolio",
    resource_id: projectId, new_state: { featured },
  });
  revalidatePath("/portfolio");
  return { success: true as const };
}

export async function deleteProject(projectId: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("portfolio").select("*").eq("id", projectId).single();
  const { error } = await supabase.from("portfolio").delete().eq("id", projectId);
  if (error) return { success: false as const, error: "Could not delete project" };

  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "portfolio.deleted", resource_type: "portfolio", resource_id: projectId, previous_state: before,
  });
  revalidatePath("/portfolio");
  return { success: true as const };
}
