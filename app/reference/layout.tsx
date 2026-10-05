import type { Metadata } from "next";
import { ReferenceFrame } from "@/components/reference/frame";
import { loadReferenceOffers } from "@/lib/reference/load";
import "./reference.css";

export const metadata: Metadata = {
  title: "Reference",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const typeWords: Record<string, string> = {
  DEVICE: "device",
  CARTRIDGE_TRIO: "cartridge trio cartridges",
  REFILL: "refill refills restock",
  BUNDLE: "bundle",
};

export default async function ReferenceLayout({ children }: { children: React.ReactNode }) {
  const catalog = (await loadReferenceOffers()).map((offer) => ({
    slug: offer.slug,
    name: offer.name,
    price: offer.price,
    haystack: `${offer.name} ${offer.shortDescription} ${offer.included} ${typeWords[offer.type] || ""}`.toLowerCase(),
  }));
  return <ReferenceFrame catalog={catalog}>{children}</ReferenceFrame>;
}
