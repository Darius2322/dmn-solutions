import type { Metadata } from "next";
import { Mail, Phone, MessageCircle, Clock } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with DMN Solutions." };

export default function ContactPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-ink">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div aria-hidden className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <h1 className="text-2xl font-semibold text-ink-foreground sm:text-3xl">Contact us</h1>
          <p className="mt-3 max-w-xl text-sm text-ink-muted-foreground sm:text-base">
            Reach out for a quote, a question, or to start a service request — we usually respond the same day.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">dmnsolutions63@gmail.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-medium text-foreground">Phone</p>
              <p className="text-sm text-muted-foreground">+254 110 554 040</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-medium text-foreground">WhatsApp</p>
              <p className="text-sm text-muted-foreground">+254 110 554 040</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-medium text-foreground">Business hours</p>
              <p className="text-sm text-muted-foreground">Mon–Sat, 8:00 AM – 6:00 PM</p>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
      </div>
    </main>
  );
}
