import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "linear-gradient(to bottom right, black, transparent 75%)",
          WebkitMaskImage: "linear-gradient(to bottom right, black, transparent 75%)",
        }}
      />
      <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
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
