import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentAdmin = {
  id: string;
  email: string;
  fullName: string | null;
  isAdmin: true;
};

/**
 * The ONLY source of truth for "is this person an admin" is the `is_admin`
 * boolean on their `profiles` row in Postgres, read here as the logged-in
 * user (RLS-respecting client) and re-checked by every RLS policy on every
 * table this app touches. There is no email allow-list anywhere in this
 * codebase — rotating/removing an admin is a database update, not a
 * redeploy.
 */
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile.full_name,
    isAdmin: true,
  };
}
