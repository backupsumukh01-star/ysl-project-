import { ReferenceListing } from "@/components/reference/listing";
import { loadReferenceOffers } from "@/lib/reference/load";

export const dynamic = "force-dynamic";

export default async function ReferenceShop({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = (params.q || "").trim().toLowerCase();
  const products = (await loadReferenceOffers()).filter((item) => {
    if (!query) return true;
    return `${item.name} ${item.shortDescription} ${item.included} ${item.sku}`.toLowerCase().includes(query);
  });
  return <ReferenceListing title="Shop" products={products} current="/reference/shop" />;
}
