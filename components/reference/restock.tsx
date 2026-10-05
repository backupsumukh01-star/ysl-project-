"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/product";
import { referenceImages } from "@/lib/reference/images";
import type { RefOffer } from "@/lib/reference/types";
import { RefPhoto } from "@/components/reference/photo";

export function ReferenceRestock({ offer }: { offer: RefOffer | null }) {
  const { addItem } = useCart();
  return (
    <div>
      <p className="ref-crumb"><Link href="/reference">Home</Link> / Refills</p>
      <RefPhoto src={referenceImages.lifestyle.src} alt={referenceImages.lifestyle.alt} ratio="4 / 5" sizes="100vw" />
      <h1 className="ref-title">Restock your favorites</h1>
      <p>A refill is one cartridge for a shade you already use. It is not a new three-cartridge trio. Official individual listings are O2, O3, R3, N2, and N3.</p>
      {offer ? (
        <article className="ref-together">
          {offer.images[0] ? <RefPhoto src={offer.images[0].src} alt={offer.images[0].alt} sizes="96px" ratio="96 / 120" /> : null}
          <div>
            <h2>{offer.name}</h2>
            <p className="ref-muted">{offer.shortDescription}</p>
            <p>{formatMoney(offer.price)}</p>
            <p className="ref-muted">One cartridge. {offer.inStock ? "Available to order" : "Out of stock"}</p>
            <button
              className="ref-cta"
              type="button"
              disabled={!offer.inStock || !offer.id}
              onClick={() => addItem({
                id: offer.id,
                slug: offer.slug,
                name: offer.name,
                price: offer.price,
                sku: offer.sku,
                image: offer.images[0]?.src,
              })}
            >
              Restock now
            </button>
          </div>
        </article>
      ) : (
        <p>The single-cartridge refill is not in the catalog.</p>
      )}
    </div>
  );
}
