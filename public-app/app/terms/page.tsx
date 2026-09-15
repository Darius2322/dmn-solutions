import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Terms of Service</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="mt-8 space-y-6 text-sm text-muted-foreground">
        <section>
          <h2 className="text-base font-medium text-foreground">Using this website</h2>
          <p className="mt-2">
            By using this website you agree to use it lawfully and not to misuse any form, service
            request, or feature for fraudulent or harmful purposes.
          </p>
        </section>
        <section>
          <h2 className="text-base font-medium text-foreground">Our services</h2>
          <p className="mt-2">
            Service requests submitted through this site are subject to confirmation and scheduling by
            DMN Solutions. Submitting a request does not guarantee immediate availability or acceptance.
            Specific terms, pricing, and timelines for a given project will be agreed with you directly.
          </p>
        </section>
        <section>
          <h2 className="text-base font-medium text-foreground">Intellectual property</h2>
          <p className="mt-2">
            The content, branding, and design of this website belong to DMN Solutions unless otherwise
            noted. Portfolio items are shown to represent work completed for or by DMN Solutions.
          </p>
        </section>
        <section>
          <h2 className="text-base font-medium text-foreground">Limitation of liability</h2>
          <p className="mt-2">
            DMN Solutions provides this website and its services on an "as available" basis and is not
            liable for indirect or consequential losses arising from use of the site, to the extent
            permitted by applicable law.
          </p>
        </section>
        <section>
          <h2 className="text-base font-medium text-foreground">Contact us</h2>
          <p className="mt-2">
            Questions about these terms can be sent to dmnsolutions63@gmail.com or via our{" "}
            <a href="/contact" className="text-primary hover:underline">contact page</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
