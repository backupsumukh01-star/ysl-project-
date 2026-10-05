import { ReferenceRestock } from "@/components/reference/restock";
import { loadReferenceOffers } from "@/lib/reference/load";

export const dynamic = "force-dynamic";

export default async function ReferenceRefills() {
  const offer = (await loadReferenceOffers()).find((item) => item.type === "REFILL") ?? null;
  return <ReferenceRestock offer={offer} />;
}
