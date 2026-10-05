import { notFound } from "next/navigation";
import { ReferencePdp } from "@/components/reference/pdp";
import { loadReferenceOffers, pick } from "@/lib/reference/load";

export const dynamic = "force-dynamic";

export default async function ReferenceProduct({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const offers = await loadReferenceOffers();
  const offer = pick(offers, slug);
  if (!offer) notFound();
  const mode = offer.type === "DEVICE" ? "device" : offer.type === "REFILL" ? "refill" : offer.type === "BUNDLE" ? "bundle" : "trio";
  const related = ["DEVICE", "CARTRIDGE_TRIO", "REFILL", "BUNDLE"]
    .map((type) => offers.find((item) => item.type === type && item.slug !== offer.slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  return <ReferencePdp offer={offer} related={related} mode={mode} />;
}
