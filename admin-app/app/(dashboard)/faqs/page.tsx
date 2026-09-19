import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { FaqFormModal } from "@/components/admin/faq-form-modal";
import { FaqStatusToggle } from "@/components/admin/faq-status-toggle";
import { ConfirmDeleteFaq } from "@/components/admin/confirm-delete-faq";

export default async function AdminFaqsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: faqs } = await supabase.from("faqs").select("*").order("sort_order");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">FAQs</h1>
        <FaqFormModal />
      </div>

      <div className="mt-6 space-y-3">
        {(faqs ?? []).map((faq) => (
          <div key={faq.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">{faq.question}</p>
                {faq.category && <p className="text-xs text-muted-foreground">{faq.category}</p>}
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${faq.active ? "bg-success/10 text-success" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                {faq.active ? "Visible" : "Hidden"}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <FaqFormModal faq={faq} />
              <FaqStatusToggle faqId={faq.id} active={faq.active} />
              <ConfirmDeleteFaq faqId={faq.id} />
            </div>
          </div>
        ))}
        {(faqs ?? []).length === 0 && <p className="text-sm text-muted-foreground">No FAQs yet.</p>}
      </div>
    </div>
  );
}
