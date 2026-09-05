import Link from "next/link";
import * as Icons from "lucide-react";
import { getActiveServices } from "@/lib/actions/services";

export async function ServicesPreview() {
  const services = await getActiveServices();

  if (services.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm text-muted-foreground">Services will appear here once added.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 flex items-end justify-between">
        <h2 className="text-xl font-semibold text-foreground">Our services</h2>
        <Link href="/services" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.slice(0, 4).map((service) => {
          const Icon = (Icons as any)[toPascalCase(service.icon)] ?? Icons.Wrench;
          return (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary/40"
            >
              <Icon className="h-6 w-6 text-primary" aria-hidden />
              <h3 className="mt-3 text-sm font-medium text-foreground">{service.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{service.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function toPascalCase(str: string) {
  return str.replace(/(^\w|-\w)/g, (s) => s.replace("-", "").toUpperCase());
}
