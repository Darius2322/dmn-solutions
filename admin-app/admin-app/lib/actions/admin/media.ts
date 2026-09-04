"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentAdmin } from "@/lib/auth/admin";

export async function uploadMedia(formData: FormData) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const file = formData.get("file") as File | null;
  const altText = (formData.get("altText") as string) || null;
  const usageContext = (formData.get("usageContext") as string) || null;
  if (!file || file.size === 0) return { success: false as const, error: "No file selected" };
  if (file.size > 5 * 1024 * 1024) return { success: false as const, error: "File too large (5MB max)" };

  const supabase = createSupabaseAdminClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("website-media")
    .upload(path, file, { contentType: file.type });
  if (uploadError) return { success: false as const, error: "Upload failed. Check the storage bucket exists." };

  const { error: dbError } = await supabase.from("media_assets").insert({
    storage_path: path,
    bucket: "website-media",
    file_name: file.name,
    mime_type: file.type,
    alt_text: altText,
    usage_context: usageContext,
    uploaded_by: admin.id,
  });
  if (dbError) return { success: false as const, error: "Uploaded, but could not save the record." };

  revalidatePath("/media");
  return { success: true as const };
}

export async function deleteMedia(mediaId: string, storagePath: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  await supabase.storage.from("website-media").remove([storagePath]);
  const { error } = await supabase.from("media_assets").delete().eq("id", mediaId);
  if (error) return { success: false as const, error: "Could not delete record" };

  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "media.deleted", resource_type: "media_asset", resource_id: mediaId,
  });

  revalidatePath("/media");
  return { success: true as const };
}
