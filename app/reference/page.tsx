import { ReferenceListing } from "@/components/reference/listing";
import { loadReferenceOffers } from "@/lib/reference/load";

export const dynamic = "force-dynamic";

export default async function ReferenceHome() {
  const products = await loadReferenceOffers();
  return <ReferenceListing title="Custom lip creator" products={products} current="/reference/shop" />;
}
