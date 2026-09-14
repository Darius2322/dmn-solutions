import { Hero } from "@/components/home/hero";
import { ServicesPreview } from "@/components/home/services-preview";
import { PartnersStrip } from "@/components/home/partners-strip";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ServicesPreview />
      <PartnersStrip />
    </main>
  );
}
