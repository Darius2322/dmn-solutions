import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Refund Policy</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="mt-8 space-y-6 text-sm text-muted-foreground">
        <section>
          <h2 className="text-base font-medium text-foreground">Service payments</h2>
          <p className="mt-2">
            Payment terms for a given service are agreed directly with you before work begins, based on
            the scope discussed for that request.
          </p>
        </section>
        <section>
          <h2 className="text-base font-medium text-foreground">Cancellations</h2>
          <p className="mt-2">
            If you need to cancel a service request, contact us as early as possible. Refund eligibility
            depends on how much work has already been carried out or committed on your behalf (such as
            materials purchased for an electrical installation).
          </p>
        </section>
        <section>
          <h2 className="text-base font-medium text-foreground">Non-refundable items</h2>
          <p className="mt-2">
            Costs already incurred on your behalf — such as purchased hardware, materials, or third-party
            fees — are generally non-refundable once committed.
          </p>
        </section>
        <section>
          <h2 className="text-base font-medium text-foreground">Requesting a refund</h2>
          <p className="mt-2">
            To request a refund, contact us with your service reference number and the reason for your
            request. We will review each request individually and respond promptly.
          </p>
        </section>
        <section>
          <h2 className="text-base font-medium text-foreground">Contact us</h2>
          <p className="mt-2">
            Reach us at dmnsolutions63@gmail.com or via our{" "}
            <a href="/contact" className="text-primary hover:underline">contact page</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
