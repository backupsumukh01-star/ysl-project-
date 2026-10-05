"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AddToCartButton, BuyNowButton, Price, QuantitySelector } from "@/components/commerce";
import { cartridgeIngredients } from "@/lib/product";
import { RefillChoices, type RefillChoice } from "@/components/refill-choices";
import { CrossfadeImage } from "@/components/crossfade-image";
import { PageBack } from "@/components/page-back";

const sharedGallery = [
  {
    src: "/images/trio-gallery-cartridges.jpg",
    alt: "Close view of Rouge Sur Mesure cartridges, some closed and some open.",
    fit: "cover" as const,
  },
  {
    src: "/images/trio-gallery-looks.jpg",
    alt: "Four models wearing custom lip colour.",
    fit: "cover" as const,
  },
];

export type RefillOption = RefillChoice & {
  name: string;
  sku: string;
  price: number | null;
  image: string;
};

export function RefillPurchase({
  product,
  options,
  initialCode,
}: {
  product: { id: string; slug: string; name: string; maxQuantity: number; inStock: boolean };
  options: RefillOption[];
  initialCode: string;
}) {
  const start = options.find((option) => option.code === initialCode) || options.find((option) => option.code === "R3") || options[0];
  const [code, setCode] = useState(start?.code || "");
  const [quantity, setQuantity] = useState(1);
  const [showBar, setShowBar] = useState(false);
  const [photo, setPhoto] = useState(0);
  const touchX = useRef<number | null>(null);
  const selected = options.find((option) => option.code === code) || start;
  const gallery = selected
    ? [
        { src: selected.image, alt: `${selected.name} cartridge`, fit: "contain" as const },
        ...sharedGallery,
      ]
    : sharedGallery;
  const item = selected
    ? {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: selected.price,
        sku: selected.sku,
        image: selected.image,
        variantId: selected.id,
        variantName: selected.name,
      }
    : null;
  const ingredients = selected ? cartridgeIngredients[selected.code as keyof typeof cartridgeIngredients] : "";

  useEffect(() => {
    setCode(start?.code || "");
    setPhoto(0);
  }, [start?.code]);

  useEffect(() => {
    const target = document.getElementById("purchase");
    const footer = document.querySelector("footer");
    if (!target) return;
    let purchaseAway = false;
    let footerVisible = false;
    const update = () => setShowBar(purchaseAway && !footerVisible);
    const purchaseObserver = new IntersectionObserver(([entry]) => {
      purchaseAway = !entry.isIntersecting && entry.boundingClientRect.top < 80;
      update();
    });
    purchaseObserver.observe(target);
    const footerObserver = footer
      ? new IntersectionObserver(([entry]) => {
          footerVisible = entry.isIntersecting;
          update();
        })
      : null;
    if (footer) footerObserver?.observe(footer);
    return () => {
      purchaseObserver.disconnect();
      footerObserver?.disconnect();
    };
  }, []);

  if (!selected || !item) return null;

  return (
    <>
      <div className="trio-purchase" id="purchase">
        <div className="trio-visual">
          <div
            className="trio-visual__frame"
            onTouchStart={(event) => {
              touchX.current = event.changedTouches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              if (touchX.current == null) return;
              const delta = (event.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
              if (delta < -40) setPhoto((current) => Math.min(gallery.length - 1, current + 1));
              if (delta > 40) setPhoto((current) => Math.max(0, current - 1));
              touchX.current = null;
            }}
          >
            <CrossfadeImage
              src={gallery[photo].src}
              alt={gallery[photo].alt}
              sizes="(max-width: 1023px) 92vw, 560px"
              fit={gallery[photo].fit}
              priority={photo === 0}
            />
          </div>
          <div className="trio-shots" role="tablist" aria-label="Product images">
            {gallery.map((shot, index) => (
              <button
                key={shot.src}
                type="button"
                role="tab"
                aria-label={`Show image ${index + 1}`}
                aria-selected={index === photo}
                onClick={() => setPhoto(index)}
              >
                <Image src={shot.src} alt="" width={72} height={72} sizes="72px" />
              </button>
            ))}
          </div>
        </div>
        <header className="trio-intro">
          <PageBack href="/shop">All products</PageBack>
          <p className="kicker">Rouge Sur Mesure</p>
          <h1>Cartridge refill</h1>
        </header>
        <div className="trio-buy">
          <p className="trio-lede">Create custom lip shades in pink, orange, red and nude. Cartridges are removable and interchangeable in your Rouge Sur Mesure Custom Lip Color Creator.</p>
          <Price amount={selected.price} compare={false} />
          <RefillChoices
            options={options}
            selectedId={selected.id}
            onSelect={(id) => {
              const next = options.find((option) => option.id === id);
              if (!next) return;
              setCode(next.code);
              setPhoto(0);
            }}
          />
          <QuantitySelector value={quantity} onChange={setQuantity} max={product.maxQuantity} />
          {product.inStock ? (
            <div className="actions">
              <AddToCartButton quantity={quantity} full item={item} />
              <BuyNowButton quantity={quantity} full item={item} />
            </div>
          ) : (
            <p className="muted">Out of stock</p>
          )}
        </div>
      </div>

      <section className="trio-block" id="about-trio" aria-labelledby="about-trio-title">
        <h2 id="about-trio-title">About this cartridge</h2>
        <dl className="trio-facts">
          <div>
            <dt>Keywords</dt>
            <dd>Personalization · Lip Color Creator · Liquid Lipstick · Velvet Matte · 1,300+ Colors</dd>
          </div>
          <div>
            <dt>Benefits</dt>
            <dd>Create custom lip shades in pink, orange, red and nude. Cartridges are removable and interchangeable in your Rouge Sur Mesure Custom Lip Color Creator.</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>Lip Color Creator Cartridge</dd>
          </div>
          <div>
            <dt>What it is</dt>
            <dd>A single color cartridge to restock a personalized lipstick shade with Rouge Sur Mesure Custom Lip Color Creator. It does not create a new trio.</dd>
          </div>
        </dl>
        <p>Rouge Sur Mesure will only produce colors from the following trios. Cartridges cannot be blended outside the below trio formats:</p>
        <ul className="trio-formats">
          <li>Red: R1, R2, R3</li>
          <li>Orange: O1, O2, O3</li>
          <li>Pink: P1, P2, P3</li>
          <li>Nude: N1, N2, N3</li>
          <li>Warm Red: O1, R1, R2</li>
          <li>Cool Nude: N1, P1, N3</li>
          <li>Warm Nude: N1, O1, N3</li>
        </ul>
        <details className="trio-fold">
          <summary>How to apply</summary>
          <p>Insert three cartridges in the Rouge Sur Mesure device by sliding the device bottom to reveal three openings. Remove the cartridge caps and insert the cartridges. The app will recognize the cartridges and calibrate. Use the in-app features to create your custom shade within the selected shade family. After creating your target shade, use the included retractable lip brush to thoroughly mix the dispensed formula. Use the tip of the brush to line your lips with high-impact color just as you would with a pencil. Then, glide the brush across your lips to complete the application.</p>
        </details>
        <p>This refill is sold separately from the Rouge Sur Mesure device.</p>
      </section>

      {ingredients ? (
        <section className="trio-block" id="ingredients" aria-labelledby="ingredients-title">
          <h2 id="ingredients-title">Ingredients</h2>
          <div className="trio-ingredients">
            <details>
              <summary>{selected.name}</summary>
              <p>{ingredients}</p>
            </details>
          </div>
        </section>
      ) : null}

      {showBar && product.inStock ? (
        <div className="sticky-buy">
          <div>
            <p>{selected.name}</p>
            <Price amount={selected.price} compare={false} />
          </div>
          <AddToCartButton item={item} />
        </div>
      ) : null}
    </>
  );
}
