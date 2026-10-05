import type { Metadata } from "next";
import { TrioStory } from "@/components/trio-story";
import { getProductBySlug } from "@/lib/catalog";

const slug = "cartridge-trio-orange";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription,
    alternates: { canonical: `/product/${slug}` },
  };
}

export default function OrangeTrioPage() {
  return <TrioStory slug={slug} />;
}
