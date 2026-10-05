import { ok } from "@/lib/http";
import { searchProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") || "";
  const products = await searchProducts(query);
  return ok({
    query,
    products: products.slice(0, 24).map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      shortDescription: product.shortDescription,
      price: product.price,
      image: product.images[0]?.src || "",
      category: product.category,
    })),
  });
}
