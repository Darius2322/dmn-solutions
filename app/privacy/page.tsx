import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Privacy Policy</h1>
      <p className="mt-6 text-sm text-muted-foreground">
        Placeholder content — replace with your actual privacy policy before launch.
        This page exists so the route and footer link are wired up correctly.
      </p>
    </main>
  );
}
