"use client";

import { useState } from "react";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { submitReview } from "@/lib/actions/reviews";

export function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState({ userName: "", service: "", comment: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const result = await submitReview({ ...form, rating });
    if (!result.success) {
      setStatus("error");
      setError(result.error);
      return;
    }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-center">
        <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-primary" />
        <p className="text-sm font-medium text-foreground">Thanks for your feedback!</p>
        <p className="mt-1 text-xs text-muted-foreground">Your review will appear once approved.</p>
      </div>
    );
  }

  const inputClass = "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-surface-muted p-5" noValidate>
      <p className="text-sm font-medium text-foreground">Leave a review</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-6 w-6 ${(hoverRating || rating) >= n ? "fill-secondary text-secondary" : "text-border"}`}
            />
          </button>
        ))}
      </div>
      <input
        required
        placeholder="Your name"
        value={form.userName}
        onChange={(e) => setForm({ ...form, userName: e.target.value })}
        className={inputClass}
      />
      <input
        placeholder="Service used (optional)"
        value={form.service}
        onChange={(e) => setForm({ ...form, service: e.target.value })}
        className={inputClass}
      />
      <textarea
        required
        rows={4}
        placeholder="Tell us about your experience"
        value={form.comment}
        onChange={(e) => setForm({ ...form, comment: e.target.value })}
        className={inputClass}
      />
      {status === "error" && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit review
      </button>
    </form>
  );
}
