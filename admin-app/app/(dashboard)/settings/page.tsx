import { getCurrentAdmin } from "@/lib/auth/admin";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Settings</h1>
      <div className="mt-6 max-w-md space-y-6">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Account</h2>
          <p className="mt-2 text-sm text-muted-foreground">Signed in as {admin?.email}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Change password</h2>
          <div className="mt-3">
            <ChangePasswordForm />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Adding or removing admins</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Done from the Customers page, not here — that keeps one place in the app responsible
            for who has access, instead of scattering admin-management across screens.
          </p>
        </div>
      </div>
    </div>
  );
}
