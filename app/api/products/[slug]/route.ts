import { fail, ok } from "@/lib/http";
import { approvedReviews, getProductBySlug, relatedProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const product = await getProductBySlug(slug);
  if (!product) return fail("NOT_FOUND", "That product was not found.", 404);
  const [related, reviews] = await Promise.all([relatedProducts(product.id), approvedReviews(product.id)]);
  return ok({ product, related, reviews });
}
