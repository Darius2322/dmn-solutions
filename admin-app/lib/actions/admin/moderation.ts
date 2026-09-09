"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentAdmin } from "@/lib/auth/admin";

async function withAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  return admin;
}

// ---- Reviews ----
export async function setReviewApproval(reviewId: string, approved: boolean) {
  const admin = await withAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("feedback").update({ approved }).eq("id", reviewId);
  if (error) return { success: false as const, error: "Could not update review" };
  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: approved ? "review.approved" : "review.hidden",
    resource_type: "feedback", resource_id: reviewId, new_state: { approved },
  });
  revalidatePath("/reviews");
  return { success: true as const };
}

export async function deleteReview(reviewId: string) {
  const admin = await withAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };
  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("feedback").select("*").eq("id", reviewId).single();
  const { error } = await supabase.from("feedback").delete().eq("id", reviewId);
  if (error) return { success: false as const, error: "Could not delete review" };
  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "review.deleted", resource_type: "feedback", resource_id: reviewId, previous_state: before,
  });
  revalidatePath("/reviews");
  return { success: true as const };
}

// ---- Referrals ----
export async function updateReferralStatus(referralId: string, status: string) {
  const admin = await withAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("referrals").update({ status }).eq("id", referralId);
  if (error) return { success: false as const, error: "Could not update referral" };
  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "referral.status_changed", resource_type: "referral", resource_id: referralId, new_state: { status },
  });
  revalidatePath("/referrals");
  return { success: true as const };
}

// ---- Support submissions ----
export async function updateSupportStatus(submissionId: string, status: string) {
  const admin = await withAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("support_submissions").update({ status }).eq("id", submissionId);
  if (error) return { success: false as const, error: "Could not update submission" };
  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "support.status_changed", resource_type: "support_submission", resource_id: submissionId, new_state: { status },
  });
  revalidatePath("/support");
  return { success: true as const };
}

// ---- Contact messages ----
export async function updateMessageStatus(messageId: string, status: string) {
  const admin = await withAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("contact_messages").update({ status }).eq("id", messageId);
  if (error) return { success: false as const, error: "Could not update message" };
  revalidatePath("/messages");
  return { success: true as const };
}

// ---- Customers / admin promotion ----
// This is the ENTIRE mechanism for granting admin access: flip a boolean on
// a profiles row. No email is ever compared anywhere in this codebase.
// Restricted to existing admins only (enforced both here and by the
// admin_all_profiles-equivalent RLS policy this action relies on).
export async function setAdminStatus(profileId: string, isAdmin: boolean) {
  const admin = await withAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", profileId);
  if (error) return { success: false as const, error: "Could not update admin status" };
  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: isAdmin ? "customer.granted_admin" : "customer.revoked_admin",
    resource_type: "profile", resource_id: profileId, new_state: { is_admin: isAdmin },
  });
  revalidatePath("/customers");
  return { success: true as const };
}

// ---- Site content ----
export async function updateSiteContent(key: string, value: unknown) {
  const admin = await withAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("site_content")
    .upsert({ key, value, updated_by: admin.id, updated_at: new Date().toISOString() });
  if (error) return { success: false as const, error: "Could not save content" };
  await supabase.from("audit_log").insert({
    actor_id: admin.id, action: "content.updated", resource_type: "site_content", resource_id: key, new_state: { value },
  });
  revalidatePath("/content");
  return { success: true as const };
}
