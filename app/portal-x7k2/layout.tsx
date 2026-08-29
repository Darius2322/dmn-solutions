import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { AdminSidebar } from "@/components/admin/sidebar";

// Note: the middleware already blocks unauthenticated/non-admin access to
// this whole path. This second check is defense-in-depth for the layout
// itself, not the primary security boundary — never remove the middleware
// check and rely on this alone.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-background p-8">{children}</main>
    </div>
  );
}
