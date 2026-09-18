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

type HistoryEntry = { status: string; changedAt: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function TrackOrderTimeline({
  currentStatus,
  createdAt,
  history = [],
}: {
  currentStatus: string;
  createdAt?: string;
  history?: HistoryEntry[];
}) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);
  const timestampByStatus = new Map(history.map((h) => [h.status, h.changedAt]));

  return (
    <ol className="relative">
      {STAGES.map((stage, index) => {
        const isComplete = currentIndex >= 0 && index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STAGES.length - 1;
        const timestamp =
          timestampByStatus.get(stage.key) ?? (stage.key === "request_received" ? createdAt : undefined);

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
              {isCurrent && <p className="mt-0.5 text-xs text-primary">Current stage</p>}
              {(isComplete || isCurrent) && timestamp && (
                <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(timestamp)}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
