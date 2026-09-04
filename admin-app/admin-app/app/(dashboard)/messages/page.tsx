import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { StatusSelect } from "@/components/admin/status-select";
import { updateMessageStatus } from "@/lib/actions/admin/moderation";

const MESSAGE_STATUSES = ["new", "read", "replied", "archived"];

export default async function AdminMessagesPage() {
  const supabase = createSupabaseAdminClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Messages</h1>
      <p className="mt-1 text-sm text-muted-foreground">Submissions from the public Contact page.</p>
      <div className="mt-6 space-y-3">
        {(messages ?? []).map((m) => (
          <div key={m.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
                <p className="mt-2 text-sm text-foreground">{m.message}</p>
              </div>
              <StatusSelect id={m.id} currentStatus={m.status} options={MESSAGE_STATUSES} action={updateMessageStatus} />
            </div>
          </div>
        ))}
        {(messages ?? []).length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
      </div>
    </div>
  );
}
