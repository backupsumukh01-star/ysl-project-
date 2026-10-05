import { cache } from "react";
import { db } from "@/lib/db";
import { minorToMajor } from "@/lib/crypto";
import { authoritativeMinor, publishedCompareMajor } from "@/lib/pricing";

const productInclude = {
  images: { where: { active: true }, orderBy: { sortOrder: "asc" as const } },
  variants: { where: { active: true } },
  category: true,
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number | null;
  compareAt: number | null;
  sku: string;
  type: string;
  category: string;
  availability: string;
  stock: number;
  reserved: number;
  createdAt: string;
  lowStock: number;
  trackInventory: boolean;
  inStock: boolean;
  featured: boolean;
  tags: string[];
  included: string;
  compatibility: string;
  details: string;
  shippingNote: string;
  seoTitle: string;
  seoDescription: string;
  images: { src: string; alt: string; isPrimary: boolean }[];
  variants: { id: string; name: string; sku: string; price: number | null; stock: number }[];
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  priceMinor: number | null;
  compareAtMinor: number | null;
  sku: string;
  type: string;
  availability: string;
  stock: number;
  reserved: number;
  createdAt: Date;
  lowStock: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  featured: boolean;
  tags: string;
  included: string;
  compatibility: string;
  details: string;
  shippingNote: string;
  seoTitle: string;
  seoDescription: string;
  category: { name: string } | null;
  images: { src: string; alt: string; isPrimary: boolean }[];
  variants: { id: string; name: string; sku: string; priceMinor: number | null; stock: number }[];
};

export function toCatalogProduct(product: ProductRow): CatalogProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    price: minorToMajor(authoritativeMinor(product.type, product.priceMinor)),
    compareAt: publishedCompareMajor(product.type),
    sku: product.sku,
    type: product.type,
    category: product.category?.name || "",
    availability: product.availability,
    stock: product.stock,
    reserved: product.reserved,
    createdAt: product.createdAt.toISOString(),
    lowStock: product.lowStock,
    trackInventory: product.trackInventory,
    inStock: !product.trackInventory || product.allowBackorder || product.stock - product.reserved > 0,
    featured: product.featured,
    tags: product.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    included: product.included,
    compatibility: product.compatibility,
    details: product.details,
    shippingNote: product.shippingNote,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    images: product.images.map((image) => ({ src: image.src, alt: image.alt, isPrimary: image.isPrimary })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      price: minorToMajor(authoritativeMinor(product.type, product.priceMinor)),
      stock: variant.stock,
    })),
  };
}

export async function listProducts() {
  const prisma = db();
  if (!prisma) return [];
  try {
    const rows = await prisma.product.findMany({
      where: { active: true },
      include: productInclude,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return rows.map((row) => toCatalogProduct(row));
  } catch {
    return [];
  }
}

export async function listProductsByType(type: string) {
  const prisma = db();
  if (!prisma) return [];
  try {
    const rows = await prisma.product.findMany({
      where: { active: true, type },
      include: productInclude,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return rows.map((row) => toCatalogProduct(row));
  } catch {
    return [];
  }
}

export const getProductBySlug = cache(async (slug: string) => {
  const prisma = db();
  if (!prisma) return null;
  try {
    const row = await prisma.product.findUnique({ where: { slug }, include: productInclude });
    if (!row || !row.active) return null;
    return toCatalogProduct(row);
  } catch {
    return null;
  }
});

export async function relatedProducts(productId: string) {
  const prisma = db();
  if (!prisma) return [];
  try {
    const links = await prisma.relatedProduct.findMany({ where: { productId } });
    if (!links.length) return [];
    const rows = await prisma.product.findMany({
      where: { id: { in: links.map((link) => link.relatedId) }, active: true },
      include: productInclude,
    });
    return rows.map((row) => toCatalogProduct(row));
  } catch {
    return [];
  }
}

export async function searchProducts(query: string) {
  const products = await listProducts();
  const needle = query.trim().toLowerCase();
  if (!needle) return products;
  return products.filter((product) =>
    [product.name, product.sku, product.category, product.shortDescription, product.description, product.included, product.tags.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}

function publishedReview(row: {
  id: string;
  rating: number;
  title: string;
  comment: string;
  imageUrl: string;
  createdAt: Date;
  orderId: string | null;
  user: { name: string } | null;
}) {
  const stored = row as typeof row & {
    reviewerName?: string;
    reviewDate?: Date;
    verifiedPurchase?: boolean;
    isDemo?: boolean;
  };
  const when = stored.reviewDate instanceof Date ? stored.reviewDate : stored.createdAt;
  return {
    id: stored.id,
    rating: stored.rating,
    title: stored.title,
    comment: stored.comment,
    name: stored.reviewerName || stored.user?.name || "Reviewer",
    createdAt: when.toISOString(),
    imageUrl: stored.imageUrl,
    verified: Boolean(stored.orderId) && Boolean(stored.verifiedPurchase) && !stored.isDemo,
  };
}

export async function approvedReviews(productId: string) {
  const prisma = db();
  if (!prisma) return [];
  try {
    const rows = await prisma.review.findMany({
      where: { productId, status: "APPROVED", isDemo: false },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { name: true } } },
    });
    return rows.map((row) => publishedReview(row));
  } catch {
    return [];
  }
}
