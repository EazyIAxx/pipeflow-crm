import { Syne, DM_Sans, IBM_Plex_Mono } from "next/font/google";

import { CtaSection } from "@/components/landing/CtaSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { Navbar } from "@/components/landing/Navbar";
import { NoiseOverlay } from "@/components/landing/NoiseOverlay";
import { PricingSection } from "@/components/landing/PricingSection";
import { StatsSection } from "@/components/landing/StatsSection";

/**
 * PipeFlow Brand Guide v2 — "Editorial Brutalist x Fintech"
 *
 * Loaded LOCALLY for the public landing route only — an isolated visual
 * island, same pattern as /pipeline and /dashboard. The authenticated app
 * shell (Sidebar, Header, leads, etc.) keeps using Inter / the shadcn slate
 * theme from src/app/layout.tsx.
 */
const pfDisplay = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-pf-display",
});

const pfBody = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-pf-body",
});

const pfMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-pf-mono",
});

export default function Home() {
  return (
    <div
      className={`${pfDisplay.variable} ${pfBody.variable} ${pfMono.variable} relative bg-pf-bg font-pf-body text-pf-text`}
    >
      <NoiseOverlay />
      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <StatsSection />
          <FeaturesSection />
          <PricingSection />
          <CtaSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
