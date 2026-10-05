import { fail, ok } from "@/lib/http";
import { publicOrder } from "@/lib/commerce";
import { loadOwnedOrder } from "@/lib/order-access";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const order = await loadOwnedOrder(id);
  if (!order) return fail("NOT_FOUND", "That order was not found.", 404);
  const prisma = db();
  const active = new Map<string, { active: boolean; slug: string }>();
  if (prisma) {
    const products = await prisma.product.findMany({
      where: { id: { in: order.items.map((item) => item.productId) } },
      select: { id: true, active: true, slug: true },
    });
    for (const product of products) active.set(product.id, product);
  }
  const data = publicOrder(order);
  return ok({
    order: {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        available: active.get(item.productId)?.active === true,
        slug: active.get(item.productId)?.slug || "",
      })),
    },
  });
}
