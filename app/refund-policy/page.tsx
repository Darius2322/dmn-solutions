import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Refund Policy</h1>
      <p className="mt-6 text-sm text-muted-foreground">
        Placeholder content — replace with your actual refund policy before launch.
        This page exists so the route and footer link are wired up correctly.
      </p>
    </main>
  );
}
