import { ReferenceListing } from "@/components/reference/listing";
import { loadReferenceOffers } from "@/lib/reference/load";

export const dynamic = "force-dynamic";

export default async function ReferenceCartridges() {
  const products = (await loadReferenceOffers()).filter((item) => item.type === "CARTRIDGE_TRIO");
  return <ReferenceListing title="Cartridges" products={products} current="/reference/cartridges" />;
}
