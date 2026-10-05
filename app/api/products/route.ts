import { ok } from "@/lib/http";
import { listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await listProducts();
  return ok({ products });
}
