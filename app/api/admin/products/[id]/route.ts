import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { majorToMinor } from "@/lib/crypto";
import { publishedMinor } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Products are not available.", 503);
  const { id } = await context.params;
  const before = await prisma.product.findUnique({ where: { id } });
  const body = (await readJson(request)) as Record<string, unknown> | null;
  if (!body) return fail("VALIDATION", "Nothing to update.");
  const data: Record<string, unknown> = {};
  for (const key of ["name", "slug", "shortDescription", "description", "sku", "type", "availability", "seoTitle", "seoDescription", "tags", "included", "compatibility", "details"] as const) {
    if (typeof body[key] === "string") data[key] = body[key];
  }
  if ("price" in body) {
    const type = typeof body.type === "string" ? body.type : before?.type;
    const catalog = type ? publishedMinor(type) : null;
    data.priceMinor = catalog ?? (body.price == null || body.price === "" ? null : majorToMinor(Number(body.price)));
  }
  if ("cost" in body) data.costMinor = body.cost == null || body.cost === "" ? null : majorToMinor(Number(body.cost));
  if ("compareAt" in body) data.compareAtMinor = body.compareAt == null || body.compareAt === "" ? null : majorToMinor(Number(body.compareAt));
  for (const key of ["stock", "lowStock", "sortOrder"] as const) {
    if (typeof body[key] === "number") data[key] = Math.max(0, Math.floor(body[key] as number));
  }
  for (const key of ["trackInventory", "allowBackorder", "featured", "active"] as const) {
    if (typeof body[key] === "boolean") data[key] = body[key];
  }
  const product = await prisma.product.update({ where: { id }, data });
  if (Array.isArray(body.images)) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    const images = body.images as { src?: string; alt?: string; isPrimary?: boolean }[];
    await prisma.productImage.createMany({
      data: images.filter((image) => image.src).map((image, index) => ({
        productId: id,
        src: String(image.src),
        alt: image.alt || product.name,
        sortOrder: index,
        isPrimary: Boolean(image.isPrimary) || index === 0,
      })),
    });
  }
  if (Array.isArray(body.relatedIds)) {
    await prisma.relatedProduct.deleteMany({ where: { productId: id } });
    const ids = body.relatedIds.filter((value): value is string => typeof value === "string" && value !== id);
    if (ids.length) {
      await prisma.relatedProduct.createMany({ data: ids.map((relatedId) => ({ productId: id, relatedId })) });
    }
  }
  if (before && typeof data.stock === "number" && before.stock <= 0 && data.stock > 0) {
    const alerts = await prisma.stockAlert.findMany({ where: { productId: id, notifiedAt: null } });
    const { sendEmail } = await import("@/lib/email/service");
    const { orderEmail } = await import("@/lib/email/templates");
    for (const alert of alerts) {
      await sendEmail({
        to: alert.email,
        type: "back_in_stock",
        dedupeKey: `back_in_stock:${alert.id}`,
        ...orderEmail({ title: "Available again", number: before.name, total: "", note: "You asked to be told if this product became available. Availability can change." }),
      });
      await prisma.stockAlert.update({ where: { id: alert.id }, data: { notifiedAt: new Date() } });
    }
  }
  return ok({ id: product.id });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Products are not available.", 503);
  const { id } = await context.params;
  await prisma.product.update({ where: { id }, data: { active: false } });
  return ok({ archived: true });
}
