import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TrackPageView } from "@/components/analytics/track-page-view";

// Render all pages on demand so edits made in the admin Content editor show up immediately.
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });

function resolveSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dmnsolutions.co.ke";
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
}

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
  title: {
    default: "DMN Solutions Kenya — Technology, Electrical & Training Services in Nairobi",
    template: "%s | DMN Solutions",
  },
  description:
    "DMN Solutions Kenya provides practical digital, technology, electrical installation, computer training and internet services in Nairobi and across Kenya.",
  openGraph: {
    type: "website",
    siteName: "DMN Solutions",
    locale: "en_KE",
  },
};

const SITE_URL = resolveSiteUrl();

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "DMN Solutions",
      alternateName: ["DMN Solutions Kenya", "DMN"],
      url: `${SITE_URL}/`,
      inLanguage: "en-KE",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "DMN Solutions",
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/icons/icon-512.png`,
      areaServed: "KE",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='dark'||(!('theme' in localStorage)&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}",
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <TrackPageView />
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
