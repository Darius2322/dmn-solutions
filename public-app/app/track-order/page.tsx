"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { lookupTrackOrder } from "@/lib/actions/track-order";

export default function TrackOrderPage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const result = await lookupTrackOrder({ trackingNumber, email });

    if (!result.success) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }

    router.push(`/track-order/${result.token}`);
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Track your order</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your tracking number and the email you used when you submitted your request.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="trackingNumber" className="mb-1.5 block text-sm font-medium text-foreground">
            Tracking number
          </label>
          <input
            id="trackingNumber"
            name="trackingNumber"
            type="text"
            required
            placeholder="DMN-26-000123"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {status === "error" && (
          <p role="alert" className="rounded-md border border-error/30 bg-error/5 px-3.5 py-2.5 text-sm text-error">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Checking…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" aria-hidden />
              Track order
            </>
          )}
        </button>
      </form>
    </main>
  );
}
