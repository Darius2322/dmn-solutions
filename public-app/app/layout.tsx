import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TrackPageView } from "@/components/analytics/track-page-view";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

function resolveSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dmn-solution.vercel.app";
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
}

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
  title: {
    default: "DMN Solutions — Technology, Electrical & Training Services",
    template: "%s | DMN Solutions",
  },
  description:
    "DMN Solutions provides practical digital, technology, electrical, computer training and internet services.",
  openGraph: {
    type: "website",
    siteName: "DMN Solutions",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        <TrackPageView />
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
