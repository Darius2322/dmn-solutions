import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { AdminSidebar } from "@/components/admin/sidebar";

// The middleware already blocks any unauthenticated/non-admin request to
// this whole app before it gets here. This second check is defense-in-depth
// for the layout render itself — it must never be the only check, and it
// isn't: RLS policies in Postgres enforce the same rule at the data layer
// regardless of what this file does.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden bg-background p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
