import { notFound } from "next/navigation";
import * as Icons from "lucide-react";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { getServiceBySlug } from "@/lib/actions/services";
import { ServiceRequestForm } from "@/components/services/service-request-form";

function toPascalCase(str: string) {
  return str.replace(/(^\w|-\w)/g, (s) => s.replace("-", "").toUpperCase());
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);
  if (!service) return {};
  return { title: service.title, description: service.description };
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = await getServiceBySlug(params.slug);
  if (!service) notFound();

  const Icon = (Icons as any)[toPascalCase(service.icon)] ?? Icons.Wrench;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{service.title}</h1>
          {service.price_label && <p className="mt-1 text-sm font-medium text-secondary">{service.price_label}</p>}
        </div>
      </div>

      <p className="mt-6 text-base text-muted-foreground">{service.description}</p>

      {service.features?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-foreground">What's included</h2>
          <ul className="mt-3 space-y-2">
            {service.features.map((feature: string) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-12 rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-5 text-base font-semibold text-foreground">Request this service</h2>
        <ServiceRequestForm serviceId={service.id} />
      </div>
    </main>
  );
}
