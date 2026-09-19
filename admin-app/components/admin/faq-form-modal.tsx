"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil, X } from "lucide-react";
import { createFaq, updateFaq } from "@/lib/actions/admin/faqs";

type FaqLike = { id: string; question: string; answer: string; category: string | null; sort_order: number };

export function FaqFormModal({ faq }: { faq?: FaqLike }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [category, setCategory] = useState(faq?.category ?? "");
  const [sortOrder, setSortOrder] = useState(String(faq?.sort_order ?? 0));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const input = { question, answer, category: category || undefined, sortOrder: Number(sortOrder) || 0 };
    startTransition(async () => {
      const result = faq ? await updateFaq(faq.id, input) : await createFaq(input);
      if (!result.success) { setError(result.error); return; }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={faq
          ? "rounded-md border border-border px-3 py-1 text-xs text-foreground hover:bg-background"
          : "flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"}
      >
        {faq ? <Pencil className="h-3 w-3" /> : <Plus className="h-4 w-4" />}
        {faq ? "Edit" : "Add FAQ"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <form onSubmit={handleSubmit} className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">{faq ? "Edit FAQ" : "Add FAQ"}</h2>
              <button type="button" onClick={() => setOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Question</label>
                <input required value={question} onChange={(e) => setQuestion(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Answer</label>
                <textarea required rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Category (optional)</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Services, Payments, General"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Sort order</label>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-error">{error}</p>}
            <button type="submit" disabled={isPending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {faq ? "Save changes" : "Add FAQ"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
