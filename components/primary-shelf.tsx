"use client";

import { useState } from "react";
import Link from "next/link";
import { AddToCartButton, Price, QuantitySelector } from "@/components/commerce";
import { CrossfadeImage } from "@/components/crossfade-image";
import { RefillMark } from "@/components/refill-mark";
import { RefillChoices } from "@/components/refill-choices";
import type { CartInput } from "@/components/cart-provider";

export type ShelfSwatch = {
  id: string;
  label: string;
  name?: string;
  code?: string;
  shade?: string;
  family?: string;
  colors: string[];
  href: string;
  image: string;
  cart: CartInput;
};

export type ShelfCard = {
  key: string;
  title: string;
  price: number | null;
  compareAt?: number | null;
  start: number;
  lead?: boolean;
  group?: string;
  detail?: string;
  cta?: { href: string; label: string };
  swatches: ShelfSwatch[];
};

function PickCard({ card }: { card: ShelfCard }) {
  const [index, setIndex] = useState(card.start);
  const [qty, setQty] = useState(1);
  const current = card.swatches[index] ?? card.swatches[0];
  const picks = card.swatches.some((swatch) => swatch.colors.length > 0);
  if (!current) return null;

  const sizes = card.lead ? "(max-width: 899px) 92vw, 640px" : "(max-width: 899px) 92vw, 380px";

  return (
    <div className={`pick-card pick-card--${card.key}${card.lead ? " pick-card--lead" : ""}`}>
      <Link href={current.href} prefetch className="pick-card__shot" aria-label={`${card.title}, ${current.name ? `${current.name}, ` : ""}${current.label}`}>
        {current.image ? (
          <CrossfadeImage src={current.image} alt={`${card.title}, ${current.name ? `${current.name}, ` : ""}${current.label}`} sizes={sizes} fit="contain" priority={card.lead} />
        ) : (
          <span className="pick-card__blank">
            <RefillMark color={current.colors[0] || "#8d6b56"} />
          </span>
        )}
      </Link>
      <div className="pick-card__body">
        <h3>
          <Link href={current.href} prefetch>{card.title}</Link>
        </h3>
        <p className="pick-card__choice">{card.key === "refill" ? "One cartridge for an existing setup." : current.name ? `${current.name} — ${current.label}` : current.label}</p>
        {!current.image ? <p className="pick-card__note">Color reference for the selected cartridge. This is not a photograph of the refill.</p> : null}
        <Price amount={card.price} compareAt={card.compareAt ?? null} />
        {picks && card.key === "refill" ? (
          <RefillChoices
            options={card.swatches.map((swatch) => ({
              id: swatch.id,
              code: swatch.code || swatch.label.slice(0, 2),
              shade: swatch.shade || swatch.label,
              family: swatch.family || "",
              color: swatch.colors[0] || "#8d6b56",
            }))}
            selectedId={current.id}
            onSelect={(id) => {
              const next = card.swatches.findIndex((swatch) => swatch.id === id);
              if (next >= 0) setIndex(next);
            }}
          />
        ) : picks ? (
          <div className="pick-card__swatches" role="listbox" aria-label={`${card.title} colors`}>
            {card.swatches.map((swatch, swatchIndex) => (
              <button
                key={swatch.id}
                type="button"
                role="option"
                aria-selected={swatchIndex === index}
                aria-label={swatch.name ? `${swatch.name}, ${swatch.label}` : swatch.label}
                className={swatchIndex === index ? "is-on" : undefined}
                onClick={() => setIndex(swatchIndex)}
              >
                <span aria-hidden="true">
                  {swatch.colors.map((color) => (
                    <i key={color} style={{ background: color }} />
                  ))}
                </span>
              </button>
            ))}
          </div>
        ) : null}
        {card.key === "refill" ? <QuantitySelector value={qty} onChange={setQty} /> : null}
        {card.cta ? (
          <Link className="btn btn-gold btn-full" href={card.cta.href} prefetch>{card.cta.label}</Link>
        ) : (
          <AddToCartButton full quantity={card.key === "refill" ? qty : 1} item={current.cart} />
        )}
      </div>
    </div>
  );
}

export function PrimaryShelf({ cards }: { cards: ShelfCard[] }) {
  return (
    <div className="shop-collection">
      {cards.map((card) => (
          <section id={card.key === "trio" ? "cartridges" : card.key === "refill" ? "refills" : undefined} key={card.key} className={card.lead ? "shop-feature" : "shop-group"} aria-label={card.group || card.title}>
          {card.group ? <p className="shop-label">{card.group}</p> : null}
          <PickCard card={card} />
        </section>
      ))}
    </div>
  );
}
