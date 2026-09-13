"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import { submitSupportSubmission } from "@/lib/actions/track-order";

export default function DonatePage() {
  const [type, setType] = useState<"equipment_donation" | "financial_support">("equipment_donation");
  const [form, setForm] = useState({ donorName: "", donorEmail: "", donorPhone: "", details: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const result = await submitSupportSubmission({ type, ...form });
    if (!result.success) { setStatus("error"); setError(result.error); return; }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <main className="mx-auto max-w-md px-6 py-16 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-primary" />
        <h1 className="text-lg font-semibold text-foreground">Thank you</h1>
        <p className="mt-2 text-sm text-muted-foreground">We've received your submission and will follow up.</p>
      </main>
    );
  }

  const inputClass = "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Donate</h1>

      <div className="mt-6 flex gap-2">
        {(["equipment_donation", "financial_support"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setType(t)}
            className={`rounded-md border px-4 py-2 text-sm ${type === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
            {t === "equipment_donation" ? "Equipment" : "Financial"}
          </button>
        ))}
      </div>

      {type === "financial_support" && (
        <div className="mt-6 rounded-lg border border-border bg-surface-muted p-5">
          <p className="text-sm font-medium text-foreground">How to send financial support</p>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>1. Open M-Pesa on your phone and select <strong className="text-foreground">Send Money</strong>.</li>
            <li>2. Send to <strong className="text-foreground">+254 110 554 040</strong> (Darius Momanyi Nyabuti).</li>
            <li>3. After sending, WhatsApp us your name and the M-Pesa confirmation code so we can confirm receipt.</li>
          </ol>
          <a
            href="https://wa.me/254110554040"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Confirm on WhatsApp
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <input placeholder="Your name (optional)" value={form.donorName} onChange={(e) => setForm({ ...form, donorName: e.target.value })} className={inputClass} />
        <input type="email" placeholder="Your email (optional)" value={form.donorEmail} onChange={(e) => setForm({ ...form, donorEmail: e.target.value })} className={inputClass} />
        <input placeholder="Your phone (optional)" value={form.donorPhone} onChange={(e) => setForm({ ...form, donorPhone: e.target.value })} className={inputClass} />
        <textarea required rows={4} placeholder={type === "equipment_donation" ? "Describe the equipment you'd like to donate" : "Describe how you'd like to support us"} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className={inputClass} />
        {status === "error" && <p className="text-sm text-error">{error}</p>}
        <button type="submit" disabled={status === "loading"} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit
        </button>
      </form>
    </main>
  );
}
