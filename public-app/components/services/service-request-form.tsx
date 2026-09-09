"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitServiceRequest } from "@/lib/actions/track-order";

const CONTACT_METHODS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

export function ServiceRequestForm({ serviceId }: { serviceId: string }) {
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    location: "",
    description: "",
    budgetRange: "",
    preferredContact: "email" as (typeof CONTACT_METHODS)[number]["value"],
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const result = await submitServiceRequest({ ...form, serviceId });

    if (!result.success) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }

    setTrackingNumber(result.trackingNumber);
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-primary" aria-hidden />
        <h2 className="text-base font-semibold text-foreground">Your request has been received</h2>
        <p className="mt-2 text-sm text-muted-foreground">Save this tracking number to check your status:</p>
        <p className="mt-3 rounded-md bg-background px-4 py-2 font-mono text-lg font-medium text-foreground">
          {trackingNumber}
        </p>
        <a
          href="/track-order"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Go to Track Order
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required>
          <input
            type="text"
            required
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Email address" required>
          <input
            type="email"
            required
            value={form.customerEmail}
            onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Phone number">
          <input
            type="tel"
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Location">
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Project description" required>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Budget range">
          <input
            type="text"
            placeholder="e.g. KES 50,000 – 100,000"
            value={form.budgetRange}
            onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Preferred contact method">
          <select
            value={form.preferredContact}
            onChange={(e) =>
              setForm({ ...form, preferredContact: e.target.value as typeof form.preferredContact })
            }
            className={inputClass}
          >
            {CONTACT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {status === "error" && (
        <p role="alert" className="rounded-md border border-error/30 bg-error/5 px-3.5 py-2.5 text-sm text-error">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Submit request
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-error"> *</span>}
      </span>
      {children}
    </label>
  );
}
