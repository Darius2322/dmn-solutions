"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ChevronLeft, ChevronRight, Check, Copy, MessageCircle } from "lucide-react";
import { submitServiceRequest } from "@/lib/actions/track-order";

const CONTACT_METHODS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

type ServiceOption = { id: string; title: string };

type Props = {
  services: ServiceOption[];
  initialServiceId?: string;
  initialNote?: string;
  initialNoteUrl?: string;
};

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
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

function buildInitialDescription(note?: string, noteUrl?: string) {
  if (!note) return "";
  return noteUrl ? `I'd like something similar to: ${note} (${noteUrl})` : `I'd like something similar to: ${note}`;
}

export function ServiceRequestStepper({ services, initialServiceId, initialNote, initialNoteUrl }: Props) {
  const startStep = initialServiceId ? 1 : 0;
  const [step, setStep] = useState(startStep);
  const [form, setForm] = useState({
    serviceId: initialServiceId ?? "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    location: "",
    description: buildInitialDescription(initialNote, initialNoteUrl),
    budgetRange: "",
    preferredContact: "email" as (typeof CONTACT_METHODS)[number]["value"],
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [copied, setCopied] = useState(false);

  const steps = ["Service", "Project", "Budget", "Contact", "Review"];
  const selectedService = services.find((s) => s.id === form.serviceId);

  function canProceed() {
    if (step === 0) return form.serviceId !== "";
    if (step === 1) return form.description.trim().length >= 10;
    if (step === 3) return form.customerName.trim().length >= 2 && /\S+@\S+\.\S+/.test(form.customerEmail);
    return true;
  }

  function next() {
    if (canProceed()) setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setStatus("loading");
    setErrorMessage("");
    const { serviceId, ...rest } = form;
    const result = await submitServiceRequest({ ...rest, serviceId });
    if (!result.success) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }
    setTrackingNumber(result.trackingNumber);
    setStatus("success");
  }

  function copyTrackingNumber() {
    navigator.clipboard?.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareTrackLinkOnWhatsApp() {
    const trackUrl = typeof window !== "undefined" ? `${window.location.origin}/track-order` : "/track-order";
    const text = `My DMN Solutions request tracking number is ${trackingNumber}. Track it here: ${trackUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
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
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={copyTrackingNumber}
            className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied!" : "Copy number"}
          </button>
          <button
            type="button"
            onClick={shareTrackLinkOnWhatsApp}
            className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Save link on WhatsApp
          </button>
        </div>
        <a href="/track-order" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Go to Track Order
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="mb-8 flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                i < step ? "bg-primary text-primary-foreground" : i === step ? "border-2 border-primary text-primary" : "border border-border text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Which service do you need?</p>
          <div className="grid gap-2 grid-cols-2">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setForm({ ...form, serviceId: s.id })}
                className={`rounded-md border p-3 text-left text-sm transition-colors ${
                  form.serviceId === s.id ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          {selectedService && <p className="text-xs text-muted-foreground">Service: <span className="text-foreground">{selectedService.title}</span></p>}
          <Field label="Project description" required>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
      )}

      {step === 2 && (
        <div className="space-y-5">
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
              onChange={(e) => setForm({ ...form, preferredContact: e.target.value as typeof form.preferredContact })}
              className={inputClass}
            >
              {CONTACT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" required>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Email address" required>
            <input
              type="email"
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
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">Review your request</p>
          <div className="space-y-1.5 rounded-md bg-background p-4 text-muted-foreground">
            <p><span className="text-foreground">Service:</span> {selectedService?.title ?? "—"}</p>
            <p><span className="text-foreground">Description:</span> {form.description}</p>
            {form.location && <p><span className="text-foreground">Location:</span> {form.location}</p>}
            {form.budgetRange && <p><span className="text-foreground">Budget:</span> {form.budgetRange}</p>}
            <p><span className="text-foreground">Contact:</span> {form.customerName} · {form.customerEmail} {form.customerPhone && `· ${form.customerPhone}`}</p>
            <p><span className="text-foreground">Preferred contact:</span> {form.preferredContact}</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <p role="alert" className="mt-4 rounded-md border border-error/30 bg-error/5 px-3.5 py-2.5 text-sm text-error">
          {errorMessage}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground disabled:opacity-0"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canProceed()}
            className="flex items-center gap-1 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Continue <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit request
          </button>
        )}
      </div>
    </div>
  );
}
