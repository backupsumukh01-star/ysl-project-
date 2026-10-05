import Link from "next/link";
import { Media } from "@/components/media";
import { AddToCartButton, Price } from "@/components/commerce";
import type { CatalogProduct } from "@/lib/catalog";
import { trioFamilyFromSlug, trioPreviewSrc } from "@/lib/trio-images";

export function ProductCards({ products }: { products: CatalogProduct[] }) {
  if (!products.length) {
    return <p>No products are published in this group yet.</p>;
  }
  return (
    <div className="shop-grid">
      {products.map((item) => {
        const image = item.images[0];
        const trio = Boolean(trioFamilyFromSlug(item.slug));
        const src = trioPreviewSrc(item.slug, image?.src);
        return (
          <article key={item.id}>
            {src ? <Media src={src} alt={image?.alt || item.name} position="center center" ratio={trio ? "ratio-square" : "ratio-portrait"} fit="contain" className={trio ? "trio-asset" : ""} /> : null}
            <p className="kicker">{item.category || item.type}</p>
            <h2>{item.name}</h2>
            <p>{item.included || item.shortDescription}</p>
            <Price amount={item.price} compareAt={item.compareAt} />
            <p className="muted">{item.inStock ? "Available to order" : "Out of stock"}</p>
            <div className="actions">
              {item.inStock ? (
                <AddToCartButton
                  item={{
                    id: item.id,
                    slug: item.slug,
                    name: item.name,
                    price: item.price,
                    sku: item.sku,
                    image: src,
                  }}
                />
              ) : (
                <Link className="btn btn-ghost" href={`/product/${item.slug}`}>
                  Notify me
                </Link>
              )}
              <Link className="btn btn-ghost" href={`/product/${item.slug}`}>
                View product
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
