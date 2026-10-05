import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { majorToMinor } from "@/lib/crypto";
import { publishedMinor } from "@/lib/pricing";
import { toCatalogProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isPrimary: z.boolean().optional(),
});

const schema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(160),
  shortDescription: z.string().max(400).optional(),
  description: z.string().max(8000).optional(),
  price: z.number().min(0).nullable().optional(),
  compareAt: z.number().min(0).nullable().optional(),
  sku: z.string().max(80).optional(),
  type: z.string().max(40).optional(),
  categoryId: z.string().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  lowStock: z.number().int().min(0).optional(),
  trackInventory: z.boolean().optional(),
  allowBackorder: z.boolean().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  seoTitle: z.string().max(160).optional(),
  seoDescription: z.string().max(300).optional(),
  tags: z.string().max(300).optional(),
  included: z.string().max(2000).optional(),
  compatibility: z.string().max(2000).optional(),
  details: z.string().max(4000).optional(),
  availability: z.string().max(300).optional(),
  images: z.array(imageSchema).optional(),
  relatedIds: z.array(z.string()).optional(),
});

function dataFrom(input: z.infer<typeof schema>) {
  return {
    name: input.name,
    slug: input.slug,
    shortDescription: input.shortDescription || "",
    description: input.description || "",
    priceMinor: publishedMinor(input.type || "DEVICE") ?? (input.price == null ? null : majorToMinor(input.price)),
    compareAtMinor: input.compareAt == null ? null : majorToMinor(input.compareAt),
    sku: input.sku || "",
    type: input.type || "DEVICE",
    categoryId: input.categoryId || null,
    stock: input.stock ?? 0,
    lowStock: input.lowStock ?? 2,
    trackInventory: input.trackInventory ?? false,
    allowBackorder: input.allowBackorder ?? false,
    featured: input.featured ?? false,
    active: input.active ?? true,
    sortOrder: input.sortOrder ?? 0,
    seoTitle: input.seoTitle || "",
    seoDescription: input.seoDescription || "",
    tags: input.tags || "",
    included: input.included || "",
    compatibility: input.compatibility || "",
    details: input.details || "",
    availability: input.availability || "Availability is confirmed with your order.",
  };
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return ok({ products: [], categories: [] });
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { images: true, variants: true, category: true }, orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany(),
  ]);
  return ok({ products: products.map((product) => toCatalogProduct(product)), categories });
}

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Products are not available.", 503);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "Check the product details.");
  const product = await prisma.product.create({ data: dataFrom(parsed.data) });
  if (parsed.data.images?.length) {
    await prisma.productImage.createMany({
      data: parsed.data.images.map((image, index) => ({
        productId: product.id,
        src: image.src,
        alt: image.alt || product.name,
        sortOrder: image.sortOrder ?? index,
        isPrimary: image.isPrimary ?? index === 0,
      })),
    });
  }
  return ok({ id: product.id });
}
