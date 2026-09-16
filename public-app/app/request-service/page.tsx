import type { Metadata } from "next";
import { getActiveServices } from "@/lib/actions/services";
import { ServiceRequestStepper } from "@/components/services/service-request-stepper";

export const metadata: Metadata = { title: "Request a Service" };

export default async function RequestServicePage({
  searchParams,
}: {
  searchParams: { similar?: string; service?: string };
}) {
  const services = await getActiveServices();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Request a service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Tell us what you need — it only takes a minute.</p>
      <div className="mt-8">
        <ServiceRequestStepper
          services={services.map((s) => ({ id: s.id, title: s.title }))}
          initialServiceId={searchParams.service}
          initialNote={searchParams.similar}
        />
      </div>
    </main>
  );
}
