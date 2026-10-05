"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AddToCartButton, BuyNowButton, Price, QuantitySelector } from "@/components/commerce";
import { cartridgeIngredients, shadeNotes } from "@/lib/product";
import { trioDots, trioLook } from "@/lib/trio-images";
import { CrossfadeImage } from "@/components/crossfade-image";
import { PageBack } from "@/components/page-back";

const pickOrder = ["Red", "Pink", "Orange", "Nude", "Warm Red", "Warm Nude", "Cool Nude"] as const;

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

export type TrioOffer = {
  id: string;
  slug: string;
  name: string;
  price: number | null;
  compareAt?: number | null;
  sku: string;
  shortDescription: string;
  description: string;
  codes: string[];
  compatibility: string;
  inStock: boolean;
  maxQuantity: number;
  image?: string;
  imageAlt?: string;
  seoTitle?: string;
};

export type TrioRelated = {
  id: string;
  slug: string;
  name: string;
  price: number | null;
  compareAt?: number | null;
  sku: string;
  image?: string;
  imageAlt?: string;
  inStock: boolean;
};

export function TrioPurchase({ product: initial, offers = [], related }: { product: TrioOffer; offers?: TrioOffer[]; related: TrioRelated[] }) {
  const choices = offers.length ? offers : [initial];
  const [slug, setSlug] = useState(initial.slug);
  const product = choices.find((offer) => offer.slug === slug) ?? initial;
  const [quantity, setQuantity] = useState(1);
  const [showBar, setShowBar] = useState(false);
  const [photo, setPhoto] = useState(0);
  const touchX = useRef<number | null>(null);
  const shortName = product.name.replace(/^Cartridge Trio — /, "");
  const familyName = pickOrder.find((name) => name === shortName);
  const picks = pickOrder.flatMap((name) => {
    const note = shadeNotes.find((entry) => entry.name === name);
    if (!note) return [];
    return [{ name, href: note.href, colors: trioDots[name], label: trioLook[name] }];
  });
  const gallery = [
    ...(product.image
      ? [{ src: product.image, alt: product.imageAlt || product.name, fit: "contain" as const }]
      : []),
    ...sharedGallery,
  ];
  const item = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    compareAt: product.compareAt ?? null,
    sku: product.sku,
    image: product.image || undefined,
  };
  useEffect(() => {
    setSlug(initial.slug);
    setPhoto(0);
    setQuantity(1);
  }, [initial.slug]);

  useEffect(() => {
    const base = product.seoTitle || product.name;
    if (!base) return;
    document.title = base.includes("|") ? base : `${base} | Rouge Sur Mesure`;
  }, [product.slug, product.seoTitle, product.name]);

  useEffect(() => {
    const onPop = () => {
      const next = window.location.pathname.split("/").pop() || "";
      if (choices.some((offer) => offer.slug === next)) setSlug(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [choices]);

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
          <h1>Color Cartridge Trio</h1>
        </header>
        <div className="trio-buy">
          <p className="trio-lede">Create custom lip shades in pink, orange, red and nude. Cartridges are removable and interchangeable in your Rouge Sur Mesure Custom Lip Color Creator.</p>
          <Price amount={product.price} compareAt={product.compareAt ?? null} />
          {familyName ? (
            <div className="trio-picks">
              <div role="listbox" aria-label="Cartridge trio colors">
                {picks.map((pick) => {
                  const selected = pick.name === familyName;
                  const offer = choices.find((item) => item.name.replace(/^Cartridge Trio — /, "") === pick.name);
                  return (
                    <button
                      key={pick.name}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      aria-label={`${pick.name}, ${pick.label}`}
                      className={selected ? "is-on" : undefined}
                      onClick={() => {
                        if (!offer || offer.slug === product.slug) return;
                        setSlug(offer.slug);
                        setPhoto(0);
                        setQuantity(1);
                        window.history.pushState(null, "", pick.href);
                      }}
                    >
                      <span aria-hidden="true">
                        {pick.colors.map((color, index) => (
                          <i key={`${pick.name}-${index}`} style={{ background: color }} />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="trio-selected">{shortName} — {trioLook[familyName]}</p>
            </div>
          ) : null}
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
        <h2 id="about-trio-title">About this trio</h2>
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
            <dd>Lip Color Creator Cartridge Trio</dd>
          </div>
          <div>
            <dt>What it is</dt>
            <dd>Color cartridges to make personalized lipstick shades with Rouge Sur Mesure Custom Lip Color Creator.</dd>
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
        <p>This trio is sold separately from the Rouge Sur Mesure device.</p>
      </section>

      <section className="trio-block" id="ingredients" aria-labelledby="ingredients-title">
        <h2 id="ingredients-title">Ingredients</h2>
        <div className="trio-ingredients">
          {product.codes.map((code, index) => {
            const list = cartridgeIngredients[code as keyof typeof cartridgeIngredients];
            if (!list) return null;
            const shade = familyName ? trioLook[familyName].split(" · ")[index] : "";
            return (
              <details key={code}>
                <summary>{shade ? `${code} · ${shade}` : code}</summary>
                <p>{list}</p>
              </details>
            );
          })}
        </div>
      </section>

      {related.length ? (
        <section className="trio-block" id="related" aria-labelledby="related-title">
          <p className="kicker">The collection</p>
          <h2 id="related-title">Continue with</h2>
          <ul className="trio-related">
            {related.map((entry) => (
              <li key={entry.id}>
                <Link href={`/product/${entry.slug}`}>
                  {entry.image ? (
                    <span className="trio-related__media">
                      <span className="trio-related__shot">
                        <Image src={entry.image} alt={entry.imageAlt || entry.name} fill sizes="(max-width: 1023px) 78vw, 280px" style={{ objectFit: "contain" }} />
                      </span>
                    </span>
                  ) : (
                    <span className="trio-related__frame">{entry.name}</span>
                  )}
                  <span className="trio-related__name">{entry.name}</span>
                </Link>
                <Price amount={entry.price} compareAt={entry.compareAt ?? null} />
                <Link className="btn btn-ghost" href={`/product/${entry.slug}`}>
                  View product
                </Link>
                {entry.inStock ? (
                  <AddToCartButton item={{ id: entry.id, slug: entry.slug, name: entry.name, price: entry.price, sku: entry.sku, image: entry.image }} />
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showBar && product.inStock ? (
        <div className="sticky-buy">
          <div>
            <p>{product.name}</p>
            <Price amount={product.price} compareAt={product.compareAt ?? null} />
          </div>
          <AddToCartButton item={item} />
        </div>
      ) : null}
    </>
  );
}
