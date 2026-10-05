"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentAdmin } from "@/lib/auth/admin";

export async function getNotifications(limit = 20) {
  const admin = await getCurrentAdmin();
  if (!admin) return [];

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_type", "admin")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getUnreadNotificationCount() {
  const admin = await getCurrentAdmin();
  if (!admin) return 0;

  const supabase = createSupabaseAdminClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_type", "admin")
    .eq("read", false);
  return count ?? 0;
}

export async function getUnreadCountsByType() {
  const admin = await getCurrentAdmin();
  if (!admin) return {} as Record<string, number>;

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("notifications")
    .select("type")
    .eq("recipient_type", "admin")
    .eq("read", false);

  const counts: Record<string, number> = {};
  (data ?? []).forEach((n) => {
    counts[n.type] = (counts[n.type] ?? 0) + 1;
  });
  return counts;
}

export async function markNotificationRead(notificationId: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId);
  if (error) return { success: false as const, error: "Could not update notification" };
  revalidatePath("/");
  return { success: true as const };
}

export async function markAllNotificationsRead() {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false as const, error: "Not authorized" };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("recipient_type", "admin")
    .eq("read", false);
  if (error) return { success: false as const, error: "Could not update notifications" };
  revalidatePath("/");
  return { success: true as const };
}

export async function getAdminNotificationSnapshot() {
  const admin = await getCurrentAdmin();
  if (!admin) return { unread: 0, latest: null as null | { id: string; title: string; message: string | null; type: string; created_at: string } };

  const supabase = createSupabaseAdminClient();
  const [{ count }, { data: latest }] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("recipient_type", "admin").eq("read", false),
    supabase
      .from("notifications")
      .select("id, title, message, type, created_at")
      .eq("recipient_type", "admin")
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);
  return { unread: count ?? 0, latest: latest?.[0] ?? null };
}
