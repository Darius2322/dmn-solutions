"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { submitReferral } from "@/lib/actions/track-order";

export default function ReferralPage() {
  const [form, setForm] = useState({
    referrerName: "", referrerEmail: "", referrerPhone: "",
    referredName: "", referredContact: "", serviceInterested: "", notes: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const result = await submitReferral(form);
    if (!result.success) { setStatus("error"); setError(result.error); return; }
    setReferenceNumber(result.referenceNumber);
    setStatus("success");
  }

  if (status === "success") {
    return (
      <main className="mx-auto max-w-md px-6 py-16 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-primary" />
        <h1 className="text-lg font-semibold text-foreground">Referral submitted</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your reference number:</p>
        <p className="mt-3 rounded-md bg-surface px-4 py-2 font-mono text-lg">{referenceNumber}</p>
      </main>
    );
  }

  const inputClass = "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Referral Program</h1>
      <p className="mt-2 text-sm text-muted-foreground">Know someone who could use our services? Refer them here.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <input required placeholder="Your name" value={form.referrerName} onChange={(e) => setForm({ ...form, referrerName: e.target.value })} className={inputClass} />
        <input required type="email" placeholder="Your email" value={form.referrerEmail} onChange={(e) => setForm({ ...form, referrerEmail: e.target.value })} className={inputClass} />
        <input placeholder="Your phone" value={form.referrerPhone} onChange={(e) => setForm({ ...form, referrerPhone: e.target.value })} className={inputClass} />
        <input required placeholder="Referred person's name" value={form.referredName} onChange={(e) => setForm({ ...form, referredName: e.target.value })} className={inputClass} />
        <input required placeholder="Referred person's contact" value={form.referredContact} onChange={(e) => setForm({ ...form, referredContact: e.target.value })} className={inputClass} />
        <input placeholder="Service they're interested in" value={form.serviceInterested} onChange={(e) => setForm({ ...form, serviceInterested: e.target.value })} className={inputClass} />
        <textarea placeholder="Additional information" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} />
        {status === "error" && <p className="text-sm text-error">{error}</p>}
        <button type="submit" disabled={status === "loading"} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit referral
        </button>
      </form>
    </main>
  );
}
