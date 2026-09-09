import type { Metadata } from "next";
import { Mail, Phone, MessageCircle, Clock } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with DMN Solutions." };

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Contact us</h1>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
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
    </main>
  );
}
