import Link from "next/link";
import type { Metadata } from "next";
import { HeartHandshake, Laptop, Wallet } from "lucide-react";

export const metadata: Metadata = { title: "Support Us", description: "Ways to support DMN Solutions." };

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Support Us</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        DMN Solutions relies on community support to extend training and equipment access.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-6">
          <Laptop className="h-6 w-6 text-primary" aria-hidden />
          <h2 className="mt-3 text-base font-medium text-foreground">Donate Equipment</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Computers, laptops, monitors, and accessories help us extend training access.
          </p>
          <Link href="/donate" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Donate equipment
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6">
          <Wallet className="h-6 w-6 text-primary" aria-hidden />
          <h2 className="mt-3 text-base font-medium text-foreground">Financial Support</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Contributions help fund training programs and community projects.
          </p>
          <Link href="/donate" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Give financial support
          </Link>
        </div>
      </div>

      <div className="mt-10 rounded-lg border border-border bg-surface p-6">
        <HeartHandshake className="h-6 w-6 text-primary" aria-hidden />
        <h2 className="mt-3 text-base font-medium text-foreground">Refer a customer</h2>
        <p className="mt-2 text-sm text-muted-foreground">Know someone who needs our services?</p>
        <Link href="/referral" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Go to Referral Program
        </Link>
      </div>
    </main>
  );
}
