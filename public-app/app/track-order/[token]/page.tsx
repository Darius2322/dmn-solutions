import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { getTrackOrderStatus } from "@/lib/actions/track-order";
import { TrackOrderTimeline } from "@/components/track-order/track-order-timeline";
import { RefreshButton } from "@/components/track-order/refresh-button";

// Status changes server-side (admin updates); never let this page get
// statically cached or a customer could see a stale status after Refresh.
export const dynamic = "force-dynamic";

export default async function TrackOrderStatusPage({
  params,
}: {
  params: { token: string };
}) {
  const request = await getTrackOrderStatus(params.token);

  if (!request) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
        <AlertCircle className="mb-4 h-8 w-8 text-muted-foreground" aria-hidden />
        <h1 className="text-lg font-semibold text-foreground">This session has expired</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track Order sessions last 30 minutes for your security. Look up your order again to continue.
        </p>
        <Link
          href="/track-order"
          className="mt-6 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Look up my order
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{request.tracking_number}</p>
          <h1 className="mt-1 text-xl font-semibold text-foreground">
            {request.customer_name}&rsquo;s project
          </h1>
        </div>
        <RefreshButton />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 rounded-lg border border-border bg-surface p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Payment status</p>
          <p className="mt-1 text-sm font-medium capitalize text-foreground">
            {request.payment_status ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Created</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {new Date(request.created_at).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Last updated</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {new Date(request.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <h2 className="mb-4 text-sm font-medium text-foreground">Project timeline</h2>
      <TrackOrderTimeline currentStatus={request.status} />

      {request.customer_notes && (
        <div className="mt-8 rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-2 text-sm font-medium text-foreground">Notes from our team</h2>
          <p className="text-sm text-muted-foreground">{request.customer_notes}</p>
        </div>
      )}
    </main>
  );
}
