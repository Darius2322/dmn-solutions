import { getActivePartners } from "@/lib/actions/partners";

export async function PartnersStrip() {
  const partners = await getActivePartners();
  if (partners.length === 0) return null;

  const track = [...partners, ...partners];

  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Partners we work with
        </p>
        <div
          className="relative mt-6 overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="animate-marquee flex w-max items-center gap-12">
            {track.map((partner, i) => {
              const content = partner.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partner.logo_url} alt={partner.name} className="h-8 w-auto object-contain grayscale transition-all hover:grayscale-0" />
              ) : (
                <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">{partner.name}</span>
              );
              return partner.website_url ? (
                <a
                  key={`${partner.id}-${i}`}
                  href={partner.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
                  aria-label={partner.name}
                >
                  {content}
                </a>
              ) : (
                <div key={`${partner.id}-${i}`} className="shrink-0 opacity-70" aria-label={partner.name}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
