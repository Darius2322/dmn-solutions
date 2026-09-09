import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "About", description: "Learn about DMN Solutions." };

export default async function AboutPage() {
  const intro = await getSiteContent("about.intro", "DMN Solutions provides practical digital, technology, electrical, computer training and internet-related services depending on location.");
  const mission = await getSiteContent("about.mission", "To make useful technology and technical skills accessible and dependable for the communities we serve.");

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">About DMN Solutions</h1>
      <p className="mt-6 text-base text-muted-foreground">{intro as string}</p>

      <div className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Our mission</h2>
        <p className="mt-2 text-base text-foreground">{mission as string}</p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
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
    </main>
  );
}
