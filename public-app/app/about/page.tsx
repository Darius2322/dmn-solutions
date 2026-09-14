import Image from "next/image";
import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "About", description: "Learn about DMN Solutions." };

export default async function AboutPage() {
  const intro = await getSiteContent("about.intro", "DMN Solutions provides practical digital, technology, electrical, computer training and internet-related services depending on location.");
  const mission = await getSiteContent("about.mission", "To make useful technology and technical skills accessible and dependable for the communities we serve.");

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
      </div>
    </main>
  );
}
