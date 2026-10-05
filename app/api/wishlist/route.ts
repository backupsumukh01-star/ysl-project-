import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { getCustomer } from "@/lib/auth";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!siteConfig.features.wishlist) return fail("DISABLED", "The wishlist is not enabled.", 404);
  const user = await getCustomer();
  if (!user) return ok({ items: [] });
  const prisma = db();
  if (!prisma) return ok({ items: [] });
  const items = await prisma.wishlistItem.findMany({ where: { userId: user.id }, include: { product: true }, orderBy: { createdAt: "desc" } });
  return ok({
    items: items.map((item) => ({
      id: item.productId,
      variantId: item.variantId,
      slug: item.product.slug,
      name: item.product.name,
      active: item.product.active,
    })),
  });
}

export async function PUT(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  if (!siteConfig.features.wishlist) return fail("DISABLED", "The wishlist is not enabled.", 404);
  const user = await getCustomer();
  if (!user) return fail("UNAUTHORIZED", "Sign in to save a wishlist.", 401);
  const parsed = z.object({ items: z.array(z.object({ productId: z.string(), variantId: z.string().optional() })).max(50) }).safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "The wishlist could not be saved.");
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "The wishlist is not available.", 503);
  await prisma.wishlistItem.deleteMany({ where: { userId: user.id } });
  const products = await prisma.product.findMany({ where: { id: { in: parsed.data.items.map((item) => item.productId) }, active: true }, select: { id: true } });
  const allowed = new Set(products.map((item) => item.id));
  const rows = new Map<string, { userId: string; productId: string; variantId: string }>();
  for (const item of parsed.data.items) {
    if (!allowed.has(item.productId)) continue;
    const variantId = item.variantId || "";
    rows.set(`${item.productId}:${variantId}`, { userId: user.id, productId: item.productId, variantId });
  }
  if (rows.size) await prisma.wishlistItem.createMany({ data: [...rows.values()] });
  return ok({ saved: true });
}
