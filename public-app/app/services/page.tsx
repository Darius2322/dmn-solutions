import Link from "next/link";
import * as Icons from "lucide-react";
import type { Metadata } from "next";
import { getActiveServices } from "@/lib/actions/services";

export const metadata: Metadata = {
  title: "Services",
  description: "Digital & technology, electrical, computer training, and internet services from DMN Solutions.",
};

const CATEGORY_LABELS: Record<string, string> = {
  digital_technology: "Digital & Technology",
  electrical: "Electrical Services",
  computer_training: "Computer Training",
  isp: "Internet Services",
};

function toPascalCase(str: string) {
  return str.replace(/(^\w|-\w)/g, (s) => s.replace("-", "").toUpperCase());
}

export default async function ServicesPage() {
  const services = await getActiveServices();
  const grouped = services.reduce<Record<string, typeof services>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Services</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Browse by category. Availability of some services depends on your location.
      </p>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mt-12">
          <h2 className="mb-5 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {CATEGORY_LABELS[category] ?? category}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((service) => {
              const Icon = (Icons as any)[toPascalCase(service.icon)] ?? Icons.Wrench;
              return (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary/40"
                >
                  <Icon className="h-6 w-6 text-primary" aria-hidden />
                  <h3 className="mt-3 text-sm font-medium text-foreground">{service.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{service.description}</p>
                  {service.price_label && (
                    <p className="mt-3 text-xs font-medium text-secondary">{service.price_label}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {services.length === 0 && (
        <p className="mt-12 text-sm text-muted-foreground">No services published yet.</p>
      )}
    </main>
  );
}
