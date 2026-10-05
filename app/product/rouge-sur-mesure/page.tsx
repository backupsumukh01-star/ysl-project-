import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { currencyForPlace } from "@/lib/fx";
import { offerForCurrency } from "@/lib/pricing";
import { product } from "@/lib/product";
import { DeviceStory } from "@/components/device-story";
import { ProductView } from "@/components/product-view";
import { ReviewBrowser } from "@/components/review-panel";
import { getProductBySlug } from "@/lib/catalog";
import { reviewSummary } from "@/lib/reviews";
import { productJsonLd } from "@/lib/seo-product";
import "./product.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Custom Lip Color Creator",
  description: product.shortDescription,
  alternates: { canonical: "/product/rouge-sur-mesure" },
};

async function ProductReviews({ productId }: { productId: string }) {
  const summary = await reviewSummary(productId);
  return (
    <section className="section journal-section" id="reviews" aria-labelledby="reviews-title">
      <ReviewBrowser productId={productId} initialSummary={summary} />
    </section>
  );
}

export default async function ProductPage() {
  const catalog = await getProductBySlug("rouge-sur-mesure");
  const stockLimit = catalog?.trackInventory ? Math.max(0, catalog.stock - catalog.reserved) : 10;
  const offer = offerForCurrency("DEVICE", currencyForPlace((await cookies()).get("rsm-country")?.value));
  const jsonLd = productJsonLd({
    name: product.name,
    description: product.description,
    sku: catalog?.sku,
    price: offer.price ?? catalog?.price ?? product.price,
    currency: offer.currency,
    image: product.images.hero.src,
    path: "/product/rouge-sur-mesure",
    inStock: catalog ? catalog.inStock : true,
  });

  return (
    <main id="main" className="page device-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductView
        inStock={catalog ? catalog.inStock : true}
        stockLimit={stockLimit}
        offer={
          catalog
            ? {
                id: catalog.id,
                slug: catalog.slug,
                name: catalog.name,
                price: catalog.price,
                compareAt: catalog.compareAt,
                sku: catalog.sku,
                image: catalog.images[0]?.src || product.images.showcase.src,
              }
            : null
        }
      />
      {catalog ? (
        <Suspense fallback={null}>
          <ProductReviews productId={catalog.id} />
        </Suspense>
      ) : null}
      <DeviceStory />
    </main>
  );
}
