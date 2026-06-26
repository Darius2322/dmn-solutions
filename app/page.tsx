// app/page.tsx
import { Suspense } from 'react';
import { HeroSection } from '@/components/hero/HeroSection';
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid';
import { getServices, getPortfolio } from '@/lib/actions';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { FeedbackSection } from '@/components/sections/FeedbackSection';
import { getAllFeedback } from '@/lib/actions';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const revalidate = 60; // ISR — regenerate every 60 seconds

export default async function HomePage() {
  const [services, portfolio, reviews] = await Promise.all([
    getServices(true),
    getPortfolio(),
    getAllFeedback(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />

        <Suspense fallback={<SectionSkeleton />}>
          <ServicesSection services={services} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <PortfolioGrid items={portfolio} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <FeedbackSection reviews={reviews} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function SectionSkeleton() {
  return (
    <div className="py-24 px-6 max-w-7xl mx-auto">
      <div className="h-8 w-48 rounded-xl bg-white/[0.03] animate-pulse mb-4 mx-auto" />
      <div className="h-4 w-72 rounded-xl bg-white/[0.02] animate-pulse mb-12 mx-auto" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 rounded-2xl bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
