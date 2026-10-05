import type { Metadata } from "next";
import { Suspense } from "react";
import { Fraunces, Outfit } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { siteConfig } from "@/lib/config";
import { CartProvider } from "@/components/cart-provider";
import { ToastProvider } from "@/components/toast-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RouteProgress } from "@/components/route-progress";
import { HelpLink, ScrollTop, StickyBuyBar } from "@/components/chrome";
import { AnalyticsListener } from "@/components/analytics-listener";
import { ConsentBanner } from "@/components/consent-banner";
import { MetaPixel } from "@/components/meta-pixel";
import { cookies, headers } from "next/headers";
import { getSettings } from "@/lib/settings";
import { getProductBySlug } from "@/lib/catalog";
import { MarketProvider } from "@/components/market";
import { marketFor, placeFor } from "@/lib/fx";
import { countryFromRequest } from "@/lib/visitor-country";
import "./globals.css";
import "./home-layer.css";
import "./device-layer.css";
import "./market.css";
import "./footer.css";

const serif = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-serif",
});

const sans = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "Rouge Sur Mesure | Custom Lip Color Creator",
    template: "%s | Rouge Sur Mesure",
  },
  description:
    "Discover Rouge Sur Mesure, a luxury custom lip color experience designed for personalized beauty and effortless shade exploration.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Rouge Sur Mesure | Custom Lip Color Creator",
    description:
      "Discover Rouge Sur Mesure, a luxury custom lip color experience designed for personalized beauty and effortless shade exploration.",
    url: siteConfig.siteUrl,
    siteName: siteConfig.siteName,
    images: [{ url: "/images/hero.png", width: 941, height: 1672, alt: "Rouge Sur Mesure device" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rouge Sur Mesure | Custom Lip Color Creator",
    description:
      "Discover Rouge Sur Mesure, a luxury custom lip color experience designed for personalized beauty and effortless shade exploration.",
    images: ["/images/hero.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, device, jar, head] = await Promise.all([getSettings(), getProductBySlug("rouge-sur-mesure"), cookies(), headers()]);
  const country = jar.get("rsm-country")?.value || (await countryFromRequest(head));
  const place = placeFor(country);
  const market = await marketFor(place.iso || country);
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {settings.announcement ? <p className="announcement">{settings.announcement}</p> : null}
        <MarketProvider initial={{ ...market, country: place.iso }}>
        <CartProvider>
          <ToastProvider>
            <RouteProgress />
            <Header />
            <ConsentBanner />
            {children}
            <Footer />
            <StickyBuyBar
              device={
                device
                  ? { id: device.id, slug: device.slug, name: device.name, price: device.price, sku: device.sku, image: device.images[0]?.src }
                  : null
              }
            />
            <ScrollTop />
            <HelpLink />
            <Suspense fallback={null}>
              <AnalyticsListener />
            </Suspense>
            <MetaPixel />
            <SpeedInsights />
          </ToastProvider>
        </CartProvider>
        </MarketProvider>
      </body>
    </html>
  );
}
