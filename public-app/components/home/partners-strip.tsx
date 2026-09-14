import { getActivePartners } from "@/lib/actions/partners";

export async function PartnersStrip() {
  const partners = await getActivePartners();
  if (partners.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Partners we work with
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {partners.map((partner) => {
            const content = partner.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={partner.logo_url} alt={partner.name} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-sm font-medium text-muted-foreground">{partner.name}</span>
            );
            return partner.website_url ? (
              <a
                key={partner.id}
                href={partner.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-70 transition-opacity hover:opacity-100"
              >
                {content}
              </a>
            ) : (
              <div key={partner.id} className="opacity-70">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
