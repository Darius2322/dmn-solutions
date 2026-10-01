import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "About", description: "Learn about DMN Solutions." };

type AboutContent = { intro?: string; mission?: string; vision?: string };
type FounderContent = {
  name?: string; title?: string; bio?: string;
  phone?: string; email?: string; whatsapp?: string; photo?: string;
};

const DEFAULT_INTRO = "DMN Solutions provides practical digital, technology, electrical, computer training and internet-related services depending on location.";
const DEFAULT_MISSION = "To make useful technology and technical skills accessible and dependable for the communities we serve.";
const DEFAULT_FOUNDER: Required<FounderContent> = {
  name: "Darius Momanyi Nyabuti",
  title: "Founder & CEO — DMN Solutions",
  bio: "Darius Momanyi Nyabuti is the Founder and CEO of DMN Solutions, a technology and digital solutions company focused on creating practical, reliable and modern solutions for businesses and individuals.",
  phone: "+254110554040",
  email: "dariusmomanyi678@gmail.com",
  whatsapp: "254110554040",
  photo: "/images/founder/founder-3.jpg",
};

export default async function AboutPage() {
  const about = await getSiteContent<AboutContent>("about_page", {});
  const founderRaw = await getSiteContent<FounderContent>("founder", {});
  const intro = about.intro?.trim() || DEFAULT_INTRO;
  const mission = about.mission?.trim() || about.vision?.trim() || DEFAULT_MISSION;
  const f = {
    name: founderRaw.name?.trim() || DEFAULT_FOUNDER.name,
    title: founderRaw.title?.trim() || DEFAULT_FOUNDER.title,
    bio: founderRaw.bio?.trim() || DEFAULT_FOUNDER.bio,
    phone: founderRaw.phone?.trim() || DEFAULT_FOUNDER.phone,
    email: founderRaw.email?.trim() || DEFAULT_FOUNDER.email,
    whatsapp: (founderRaw.whatsapp?.trim() || DEFAULT_FOUNDER.whatsapp).replace(/[^0-9]/g, ""),
    photo: founderRaw.photo?.trim() || DEFAULT_FOUNDER.photo,
  };
  const founderAlt = `${f.name} — Founder and CEO of DMN Solutions`;

  return (
    <main>
      <section className="relative overflow-hidden bg-ink">
        <Image
          src="https://images.unsplash.com/photo-1560264280-88b68371db39?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/60 to-ink/40" />
        <div className="relative mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <h1 className="text-2xl font-semibold text-ink-foreground sm:text-3xl">About DMN Solutions</h1>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-base text-muted-foreground">{intro}</p>

        <div className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Our mission</h2>
          <p className="mt-2 text-base text-foreground">{mission}</p>
        </div>

        <div className="mt-10 grid gap-6 grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-5">
            <h3 className="text-sm font-medium text-foreground">Areas of expertise</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Software & web development</li>
              <li>Electrical installation & maintenance</li>
              <li>Computer training</li>
              <li>Internet services (Kisii & Nyamira)</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <h3 className="text-sm font-medium text-foreground">Why clients choose us</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Transparent, trackable project status</li>
              <li>Practical, tailored recommendations</li>
              <li>Support across multiple service areas</li>
            </ul>
          </div>
        </div>

        {/* Meet the Founder */}
        <div className="mt-16">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Meet the Founder</h2>

          <div className="mt-4 grid gap-6 sm:grid-cols-5 sm:items-center">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-xl border border-border sm:col-span-2 sm:max-w-none">
              <Image
                src={f.photo}
                alt={founderAlt}
                fill
                sizes="(min-width: 640px) 40vw, 80vw"
                className="object-cover"
              />
            </div>

            <div className="sm:col-span-3">
              <p className="text-lg font-semibold text-foreground">{f.name}</p>
              <p className="text-sm text-secondary">{f.title}</p>
              <p className="mt-4 text-sm text-muted-foreground">{f.bio}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={`tel:${f.phone}`}
                  className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  Call Me
                </a>
                <a
                  href={`mailto:${f.email}`}
                  className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  Email Me
                </a>
                <a
                  href={`https://wa.me/${f.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Our Products & Solutions */}
        <div className="mt-16">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Our Products & Solutions</h2>
          <div className="mt-4 rounded-lg border border-border bg-surface p-6">
            <p className="text-xs font-medium text-secondary">A DMN Solutions Product</p>
            <h3 className="mt-1 text-xl font-semibold text-foreground">ShopOS</h3>
            <p className="text-sm text-muted-foreground">Smart Point of Sale & Business Management</p>
            <p className="mt-3 text-sm text-muted-foreground">
              ShopOS is a modern point-of-sale and business management platform developed to help
              businesses manage sales, inventory, customers, debts, receipts and day-to-day operations
              from one system.
            </p>
            <a
              href="https://shopos-app.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Visit ShopOS
            </a>
          </div>
        </div>

        {/* Closing CTA */}
        <div className="mt-16 rounded-lg border border-border bg-surface-muted p-6 text-center">
          <h2 className="text-base font-semibold text-foreground">Let's work together</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tell us what you need and we'll take it from there.</p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </main>
  );
}
