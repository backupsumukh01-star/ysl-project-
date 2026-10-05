"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AddToCartButton, BuyNowButton, Price, QuantitySelector } from "@/components/commerce";
import type { CatalogProduct } from "@/lib/catalog";
import { ApiError, api } from "@/lib/api-client";
import { shadeNotes } from "@/lib/product";
import { useMoney } from "@/components/market";
import { trioPreviewSrc } from "@/lib/trio-images";
import { RefillMark, refillSwatch } from "@/components/refill-mark";
import { publishedPrices } from "@/lib/pricing";
import { trackViewContent } from "@/lib/analytics/meta";

export function CatalogProductView({
  product,
  shippingNote = "A shipping price has not been published yet.",
}: {
  product: CatalogProduct;
  shippingNote?: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState(product.variants[0]?.id || "");
  const variant = product.variants.find((item) => item.id === variantId);
  const money = useMoney();
  const price = variant?.price ?? product.price;
  const refill = product.slug === "cartridge-refill";
  const image = refill
    ? ""
    : trioPreviewSrc(product.slug, product.images.find((item) => item.src && !item.src.endsWith("/swatches.png"))?.src) || "";
  const item = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price,
    sku: variant?.sku || product.sku,
    image,
    variantId: variant?.id,
    variantName: variant?.name,
  };

  const [showBar, setShowBar] = useState(false);
  const variantName = variant?.name || "";

  useEffect(() => {
    const target = document.getElementById("purchase");
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 80);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    trackViewContent({
      contentIds: [product.id],
      contentName: variantName ? `${product.name} ${variantName}` : product.name,
      ...(price != null ? { value: price, currency: publishedPrices.currency } : {}),
    });
  }, [product.id, product.name, variantName, price]);

  return (
    <div className="product-layout">
      <div className="gallery">
        {refill ? (
          <div className="refill-stage">
            <RefillMark color={refillSwatch(variant?.name)} />
            <p className="refill-stage__note">Color reference for the selected cartridge. This is not a photograph of the refill.</p>
          </div>
        ) : image ? (
          <div className="catalog-shot">
            <Image src={image} alt={product.images[0]?.alt || product.name} width={1200} height={1500} sizes="(max-width: 768px) 92vw, 520px" style={{ width: "auto", maxWidth: "100%", height: "auto", maxHeight: "min(72svh, 720px)", objectFit: "contain" }} />
          </div>
        ) : null}
      </div>
      <aside className="buy-panel" id="purchase">
        <p className="kicker">{product.category || product.type}</p>
        <h1>{product.name}</h1>
        <p>{product.shortDescription}</p>
        <Price amount={price} compareAt={product.compareAt} />
        <p className="muted">Reviews from this shop appear after a verified purchase.</p>
        {product.type === "CARTRIDGE_TRIO" ? (
          <div className="family-select">
            <p className="kicker">Explore other color families</p>
            <div className="family-list">
              {shadeNotes.filter((family) => !family.href.endsWith(product.slug)).map((family) => (
                <Link key={family.href} href={family.href}>
                  <strong>{family.name}</strong>
                  <span>{family.codes}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        {product.variants.length ? (
          <label className="field">
            <span>{product.type === "BUNDLE" ? "Included trio" : "Cartridge"}</span>
            <select value={variantId} onChange={(event) => setVariantId(event.target.value)}>
              {product.variants.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <QuantitySelector value={quantity} onChange={setQuantity} />
        <div className="actions">
          {product.inStock ? (
            <>
              <AddToCartButton quantity={quantity} full item={item} />
              <BuyNowButton quantity={quantity} full item={item} />
            </>
          ) : (
            <p className="muted">Out of stock</p>
          )}
          <Link className="btn btn-ghost" href="/wishlist">
            Save
          </Link>
        </div>
        <p className="muted">{product.inStock ? product.availability : "Out of stock"}</p>
        <p className="muted">{shippingNote}</p>
        {product.type === "CARTRIDGE_TRIO" ? <p><Link href="/product/rouge-sur-mesure">View the device</Link></p> : null}
        {!product.inStock ? <StockAlert productId={product.id} variantId={variant?.id || ""} /> : null}
      </aside>
      {showBar && product.inStock ? (
        <div className="sticky-buy">
          <div>
            <p>{product.name}</p>
            <p className="muted">{money(price)}</p>
          </div>
          <AddToCartButton item={item} />
        </div>
      ) : null}
    </div>
  );
}

function StockAlert({ productId, variantId }: { productId: string; variantId: string }) {
  const [note, setNote] = useState("");
  return (
    <form
      className="stack-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const email = String(new FormData(event.currentTarget).get("email") || "");
        try {
          await api("/api/stock-alerts", { method: "POST", body: JSON.stringify({ email, productId, variantId }) });
          setNote("Saved. A note is sent only if this product is marked available again.");
        } catch (error) {
          setNote(error instanceof ApiError ? error.message : "That request was not saved.");
        }
      }}
    >
      <p>Notify me when available</p>
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" required />
      </label>
      <button className="btn btn-ghost" type="submit">Notify me</button>
      {note ? <p>{note}</p> : null}
    </form>
  );
}
