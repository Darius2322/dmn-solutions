import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Terms of Service</h1>
      <p className="mt-6 text-sm text-muted-foreground">
        Placeholder content — replace with your actual terms of service before launch.
        This page exists so the route and footer link are wired up correctly.
      </p>
    </main>
  );
}
