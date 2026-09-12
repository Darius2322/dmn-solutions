import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <Image
        src="https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=2400&q=80"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/55 to-ink/35" />
      <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-foreground sm:text-4xl">
            Practical technology, electrical, and training services
          </h1>
          <p className="mt-4 text-base text-ink-muted-foreground sm:text-lg">
            DMN Solutions helps individuals and businesses with software, electrical
            installation, computer training, and internet services — depending on
            where you're located.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Explore services
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="rounded-md border border-white/25 px-5 py-2.5 text-sm font-medium text-ink-foreground transition-colors hover:bg-white/10"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
