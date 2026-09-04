import { Check } from "lucide-react";

const STAGES = [
  { key: "request_received", label: "Request received" },
  { key: "reviewing", label: "Reviewing" },
  { key: "quote_prepared", label: "Quote prepared" },
  { key: "payment_pending", label: "Payment pending" },
  { key: "work_started", label: "Work started" },
  { key: "in_progress", label: "In progress" },
  { key: "review_testing", label: "Review / testing" },
  { key: "completed", label: "Completed" },
  { key: "delivered", label: "Delivered" },
] as const;

export function TrackOrderTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);

  return (
    <ol className="relative">
      {STAGES.map((stage, index) => {
        const isComplete = currentIndex >= 0 && index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STAGES.length - 1;

        return (
          <li key={stage.key} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={`absolute left-[15px] top-8 h-full w-px ${
                  isComplete ? "bg-primary" : "bg-border"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium ${
                isComplete
                  ? "border-primary bg-primary text-primary-foreground"
                  : isCurrent
                  ? "border-primary bg-surface text-primary"
                  : "border-border bg-surface text-muted-foreground"
              }`}
            >
              {isComplete ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
            </span>
            <div className="pt-1">
              <p
                className={`text-sm font-medium ${
                  isCurrent ? "text-foreground" : isComplete ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {stage.label}
              </p>
              {isCurrent && (
                <p className="mt-0.5 text-xs text-primary">Current stage</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
