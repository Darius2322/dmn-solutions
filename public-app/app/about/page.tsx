import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "About", description: "Learn about DMN Solutions." };

export default async function AboutPage() {
  const intro = await getSiteContent("about.intro", "DMN Solutions provides practical digital, technology, electrical, computer training and internet-related services depending on location.");
  const mission = await getSiteContent("about.mission", "To make useful technology and technical skills accessible and dependable for the communities we serve.");

  const founderAlt = "Darius Momanyi Nyabuti — Founder and CEO of DMN Solutions";

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
        <p className="text-base text-muted-foreground">{intro as string}</p>

        <div className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Our mission</h2>
          <p className="mt-2 text-base text-foreground">{mission as string}</p>
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

          {/* Desktop: asymmetric layout */}
          <div className="mt-4 hidden grid-cols-3 gap-3 sm:grid">
            <div className="relative col-span-2 h-[412px] overflow-hidden rounded-lg">
              <Image
                src="/images/founder/founder-3.jpg"
                alt={founderAlt}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="relative h-[200px] overflow-hidden rounded-lg">
                <Image
                  src="/images/founder/founder-1.jpg"
                  alt={founderAlt}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="relative h-[200px] overflow-hidden rounded-lg">
                <Image
                  src="/images/founder/founder-2.jpg"
                  alt={founderAlt}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Mobile: swipeable carousel */}
          <div
            className="mt-4 flex gap-3 overflow-x-auto pb-2 sm:hidden"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {["founder-3.jpg", "founder-1.jpg", "founder-2.jpg"].map((src) => (
              <div
                key={src}
                className="relative h-72 w-56 shrink-0 overflow-hidden rounded-lg"
                style={{ scrollSnapAlign: "start" }}
              >
                <Image src={`/images/founder/${src}`} alt={founderAlt} fill className="object-cover" />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-lg font-semibold text-foreground">Darius Momanyi Nyabuti</p>
            <p className="text-sm text-secondary">Founder & CEO — DMN Solutions</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Darius Momanyi Nyabuti is the Founder and CEO of DMN Solutions, a technology and digital
              solutions company focused on creating practical, reliable and modern solutions for
              businesses and individuals.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="tel:+254110554040"
                className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
              >
                <Phone className="h-4 w-4" aria-hidden />
                Call Me
              </a>
              <a
                href="mailto:dariusmomanyi678@gmail.com"
                className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
              >
                <Mail className="h-4 w-4" aria-hidden />
                Email Me
              </a>
              <a
                href="https://wa.me/254110554040"
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
