import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="mt-8 space-y-6 text-sm text-muted-foreground">
        <section>
          <h2 className="text-base font-medium text-foreground">Information we collect</h2>
          <p className="mt-2">
            We collect information you provide directly, such as your name, email, phone number, and
            project details when you submit a service request, contact form, review, referral, donation,
            or other form on this site. We also collect basic technical information automatically, such
            as pages visited and general visitor activity, to help us understand how the site is used.
          </p>
        </section>
        <section>
          <h2 className="text-base font-medium text-foreground">How we use your information</h2>
          <p className="mt-2">
            We use the information you provide to respond to your request, deliver the services you ask
            for, track the status of a service request, and improve our website and offerings. We do not
            sell your personal information.
          </p>
        </section>
        <section>
          <h2 className="text-base font-medium text-foreground">Data security</h2>
          <p className="mt-2">
            We take reasonable measures to protect the information you share with us, including access
            controls on our systems. No method of transmission or storage is completely secure, and we
            cannot guarantee absolute security.
          </p>
        </section>
        <section>
          <h2 className="text-base font-medium text-foreground">Your rights</h2>
          <p className="mt-2">
            You can ask us what information we hold about you, request a correction, or ask us to delete
            it, subject to any legitimate business or legal reasons we may need to retain it.
          </p>
        </section>
        <section>
          <h2 className="text-base font-medium text-foreground">Contact us</h2>
          <p className="mt-2">
            Questions about this policy can be sent to dmnsolutions63@gmail.com or via our{" "}
            <a href="/contact" className="text-primary hover:underline">contact page</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
