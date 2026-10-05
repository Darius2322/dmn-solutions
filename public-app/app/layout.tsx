import type { Metadata } from "next";
import Script from "next/script";
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

const KEYWORDS = [
  "DMN Solutions", "DMN Solutions Kenya", "dmnsolutions.co.ke",
  "web development Kenya", "website design Nairobi", "software development Nairobi", "mobile app development Kenya",
  "POS system Kenya", "business management software Kenya", "ShopOS",
  "electrical installation Nairobi", "electrician Nairobi", "electrician Kisii", "electrician Nyamira",
  "house wiring Kenya", "solar installation Kenya", "electrical maintenance Kenya", "licensed electricians Kenya",
  "computer training Nairobi", "computer classes Kisii", "ICT training Kenya", "digital skills training Kenya",
  "internet services Kisii", "internet services Nyamira", "WiFi installation Kenya", "ISP Kisii", "home internet Nyamira",
  "IT services Kenya", "tech company Nairobi", "CCTV installation Kenya", "network installation Kenya",
  "plumbing services Kenya", "technology solutions Kenya", "digital solutions Kenya",
];

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
  applicationName: "DMN Solutions",
  title: {
    default: "DMN Solutions — Web, Electrical, Computer Training & Internet Services in Kenya",
    template: "%s | DMN Solutions",
  },
  description:
    "DMN Solutions provides web & software development, licensed electrical installation, computer training and internet services in Nairobi, Kisii, Nyamira and across Kenya. Request a service and track it online.",
  keywords: KEYWORDS,
  authors: [{ name: "DMN Solutions", url: resolveSiteUrl() }],
  creator: "DMN Solutions",
  publisher: "DMN Solutions",
  category: "technology",
  alternates: { canonical: "./" },
  formatDetection: { telephone: true, email: true, address: true },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "DMN Solutions",
    locale: "en_KE",
    title: "DMN Solutions — Technology, Electrical & Training Services in Kenya",
    description:
      "Web & software development, electrical installation, computer training and internet services in Nairobi, Kisii, Nyamira and across Kenya.",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "DMN Solutions logo" }],
  },
  twitter: {
    card: "summary",
    title: "DMN Solutions — Technology, Electrical & Training Services in Kenya",
    description: "Web development, electrical installation, computer training and internet services across Kenya.",
    images: ["/icons/icon-512.png"],
  },
  other: { "apple-mobile-web-app-title": "DMN Solutions", "geo.region": "KE", "geo.placename": "Nairobi, Kenya" },
};

const SITE_URL = resolveSiteUrl();

const AREAS = ["Nairobi", "Kisii", "Nyamira", "Kenya"].map((name) => ({
  "@type": name === "Kenya" ? "Country" : "AdministrativeArea",
  name,
}));

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "DMN Solutions",
      alternateName: ["DMN Solutions Kenya"],
      url: `${SITE_URL}/`,
      inLanguage: "en-KE",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": ["Organization", "ProfessionalService", "LocalBusiness"],
      "@id": `${SITE_URL}/#organization`,
      name: "DMN Solutions",
      legalName: "DMN Solutions",
      url: `${SITE_URL}/`,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icons/icon-512.png`, width: 512, height: 512 },
      image: `${SITE_URL}/icons/icon-512.png`,
      description:
        "Web & software development, licensed electrical installation, computer training and internet services in Nairobi, Kisii, Nyamira and across Kenya.",
      telephone: "+254110554040",
      email: "dariusmomanyi678@gmail.com",
      priceRange: "KES",
      address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
      areaServed: AREAS,
      knowsAbout: ["Web development", "Software development", "Electrical installation", "Computer training", "Internet services", "WiFi installation", "POS systems"],
      contactPoint: [
        { "@type": "ContactPoint", telephone: "+254110554040", contactType: "customer service", areaServed: "KE", availableLanguage: ["en", "sw"] },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "DMN Solutions services",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Web & software development", areaServed: "KE" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Electrical installation & maintenance", areaServed: ["Nairobi", "Kisii", "Nyamira"] } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Computer training", areaServed: "KE" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Internet services (ISP)", areaServed: ["Kisii", "Nyamira"] } },
        ],
      },
    },
  ],
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        <TrackPageView />
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
