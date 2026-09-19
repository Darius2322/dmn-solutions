import type { Metadata } from "next";
import { getActiveFaqs } from "@/lib/actions/faqs";
import { FaqAccordion } from "@/components/faq-accordion";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const faqs = await getActiveFaqs();

  const categories = Array.from(new Set(faqs.map((f) => f.category ?? "General")));

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Frequently asked questions</h1>
      <p className="mt-2 text-sm text-muted-foreground">Answers to common questions about our services.</p>

      {faqs.length === 0 ? (
        <p className="mt-12 text-sm text-muted-foreground">No FAQs published yet.</p>
      ) : (
        <div className="mt-10 space-y-10">
          {categories.map((category) => {
            const group = faqs.filter((f) => (f.category ?? "General") === category);
            return (
              <div key={category}>
                {categories.length > 1 && (
                  <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{category}</h2>
                )}
                <FaqAccordion faqs={group} />
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
