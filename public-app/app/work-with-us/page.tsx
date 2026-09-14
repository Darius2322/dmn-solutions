"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Briefcase } from "lucide-react";
import { submitSupportSubmission } from "@/lib/actions/track-order";

export default function WorkWithUsPage() {
  const [form, setForm] = useState({ donorName: "", donorEmail: "", donorPhone: "", details: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const result = await submitSupportSubmission({ type: "work_with_us", ...form });
    if (!result.success) { setStatus("error"); setError(result.error); return; }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <main className="mx-auto max-w-md px-6 py-16 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-primary" />
        <h1 className="text-lg font-semibold text-foreground">Thanks for reaching out</h1>
        <p className="mt-2 text-sm text-muted-foreground">We'll get back to you about working together soon.</p>
      </main>
    );
  }

  const inputClass = "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <Briefcase className="h-6 w-6 text-primary" aria-hidden />
      <h1 className="mt-3 text-2xl font-semibold text-foreground">Want to work with us?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell us about your business, project, or partnership idea — we'll follow up directly.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <input required placeholder="Your name" value={form.donorName} onChange={(e) => setForm({ ...form, donorName: e.target.value })} className={inputClass} />
        <input required type="email" placeholder="Your email" value={form.donorEmail} onChange={(e) => setForm({ ...form, donorEmail: e.target.value })} className={inputClass} />
        <input placeholder="Your phone (optional)" value={form.donorPhone} onChange={(e) => setForm({ ...form, donorPhone: e.target.value })} className={inputClass} />
        <textarea required rows={5} placeholder="What would you like to work on together?" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className={inputClass} />
        {status === "error" && <p className="text-sm text-error">{error}</p>}
        <button type="submit" disabled={status === "loading"} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          Send message
        </button>
      </form>
    </main>
  );
}
