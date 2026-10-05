import { getActivePartners } from "@/lib/actions/partners";
import { PartnersCarousel } from "./partners-carousel";

export async function PartnersStrip() {
  const partners = await getActivePartners();
  if (partners.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Partners we work with
        </p>
        <PartnersCarousel
          partners={partners.map((p) => ({ id: p.id, name: p.name, logo_url: p.logo_url, website_url: p.website_url }))}
        />
      </div>
    </section>
  );
}
