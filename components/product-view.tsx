"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cartridgeIngredients, deviceFacts, deviceOffering, ingredientGroups, product, supportedTrios, type GalleryImage } from "@/lib/product";
import { Price } from "@/components/commerce";
import { useCart, type CartInput } from "@/components/cart-provider";
import { deviceFamilySelection, trioPhotoSrc, type TrioFamilyName, trioImageFiles } from "@/lib/trio-images";
import { SetContains } from "@/components/set-contains";
import { FaqList } from "@/components/faq-list";
import { faqItems } from "@/lib/content";
import { trackViewContent } from "@/lib/analytics/meta";
import { publishedPrices } from "@/lib/pricing";
import { CrossfadeImage } from "@/components/crossfade-image";
import { PageBack } from "@/components/page-back";
const trioChoices = Object.keys(trioImageFiles) as TrioFamilyName[];

const families = [
  { name: "Red", note: "Classic scarlets, cherry tones & deep burgundies" },
  { name: "Pink", note: "Rosy pinks & vibrant plums" },
  { name: "Orange", note: "Corals, tangerines & warm orange tones" },
  { name: "Nude", note: "A spectrum of nude-toned possibilities" },
  { name: "Warm Red", note: "Brick reds & warm orangish tones" },
  { name: "Warm Nude", note: "Peach, caramel & warm beige tones" },
  { name: "Cool Nude", note: "Pink-beige & rosewood tones" },
] as const;

const pdpFaq = [
  "What is Rouge Sur Mesure?",
  "What comes with the device?",
  "Are cartridges included?",
  "How many cartridges are included?",
  "Is the app required?",
  "Which phones support the app?",
  "How do I download the companion app?",
  "Where is the user manual?",
  "Is there a separate shipping charge?",
  "How do I return or replace a product?",
].flatMap((question) => {
  const item = faqItems.find((entry) => entry.question === question);
  return item ? [item] : [];
});

const gallery: Array<GalleryImage & { width: number; height: number }> = [
  { src: "/images/product/1.png", alt: "The closed Rouge Sur Mesure device on a stone surface.", position: "center center", width: 1024, height: 1536 },
  { src: "/images/product/2.png", alt: "The device open, with the lid raised and three red points inside.", position: "center center", width: 1024, height: 1536 },
  { src: "/images/product/3.png", alt: "The open device beside three cartridges, with the quilted lid raised.", position: "center center", width: 1024, height: 1536 },
  { src: "/images/product/4.png", alt: "Three cartridges on marble, each with a color dot beneath it.", position: "center center", width: 1024, height: 1536 },
  { src: "/images/product/5.png", alt: "Three cartridges held in front of a portrait.", position: "center center", width: 1024, height: 1536 },
  { src: "/images/product/6.png", alt: "The device and cartridges on a vanity, shown with a phone, a pouch, and shade dots.", position: "center center", width: 1024, height: 1536 },
];

export function ProductView({
  offer,
  inStock = true,
}: {
  offer?: CartInput & { compareAt?: number | null } | null;
  inStock?: boolean;
  stockLimit?: number;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [trios, setTrios] = useState<TrioFamilyName[]>([]);
  const [adding, setAdding] = useState(false);
  const { addItem, acknowledgeAdd } = useCart();
  const router = useRouter();
  const triosReady = trios.length === 3;
  const touchX = useRef<number | null>(null);
  const swiped = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const current = gallery[index];
  const price = offer ? offer.price : product.price;
  const item: CartInput | undefined = offer
    ? { id: offer.id, slug: offer.slug, name: offer.name, price: offer.price, image: offer.image, sku: offer.sku }
    : undefined;

  useEffect(() => {
    if (!offer?.id) return;
    trackViewContent({
      contentIds: [offer.id],
      contentName: offer.name,
      ...(offer.price != null ? { value: offer.price, currency: publishedPrices.currency } : {}),
    });
  }, [offer?.id, offer?.name, offer?.price]);

  useEffect(() => {
    if (!lightbox) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowRight") setIndex((value) => (value + 1) % gallery.length);
      if (event.key === "ArrowLeft") setIndex((value) => (value - 1 + gallery.length) % gallery.length);
    }
    const scrollY = window.scrollY;
    const previous = {
      bodyOverflow: document.body.style.overflow,
      htmlOverflow: document.documentElement.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    closeRef.current?.focus();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous.bodyOverflow;
      document.documentElement.style.overflow = previous.htmlOverflow;
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      window.scrollTo(0, scrollY);
      document.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  function step(direction: number) {
    setIndex((value) => (value + direction + gallery.length) % gallery.length);
  }

  return (
    <div className="product-layout">
      <div className="gallery">
        <div className="gallery-frame">
        <div
          className="media ratio-portrait"
          style={{ "--shot": `${current.width} / ${current.height}` } as CSSProperties}
          tabIndex={0}
          role="group"
          aria-label="Product gallery"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") step(1);
            if (event.key === "ArrowLeft") step(-1);
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setLightbox(true);
            }
          }}
          onTouchStart={(event) => {
            touchX.current = event.changedTouches[0]?.clientX ?? null;
          }}
          onClick={() => {
            if (swiped.current) {
              swiped.current = false;
              return;
            }
            setLightbox(true);
          }}
          onTouchEnd={(event) => {
            if (touchX.current == null) return;
            const delta = (event.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
            swiped.current = Math.abs(delta) > 40;
            if (delta < -40) step(1);
            if (delta > 40) step(-1);
            touchX.current = null;
          }}
        >
          <CrossfadeImage
            src={current.src}
            alt={current.alt}
            priority={index === 0}
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 55vw, 720px"
            fit="contain"
          />
        </div>
        <div className="thumbs" role="tablist" aria-label="Product images">
          {gallery.map((image, imageIndex) => (
            <button
              key={image.src}
              type="button"
              role="tab"
              aria-label={`Show image ${imageIndex + 1}`}
              aria-selected={imageIndex === index}
              aria-current={imageIndex === index ? "true" : undefined}
              onClick={() => setIndex(imageIndex)}
            >
              <Image src={image.src} alt="" width={72} height={96} sizes="72px" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </button>
          ))}
        </div>
        </div>
      </div>
      <aside className="buy-panel" id="purchase">
        <div className="buy-head">
          <PageBack href="/shop">All products</PageBack>
          <p className="kicker">Yves Saint Laurent Beauté</p>
          <p className="kicker">L’Oréal Luxe</p>
          <h1>Rouge Sur Mesure</h1>
          <p className="buy-lede">The Custom Lip Color Creator</p>
          <p className="buy-summary">{product.shortDescription}</p>
          <Price amount={price} compare={false} />
        </div>
        <div className="buy-shop">
          <div className="trio-pick" id="trios">
            <div className="trio-pick__head">
              <p className="trio-pick__label">Choose 3 families</p>
              <p className="trio-pick__count" role="status">{trios.length} of 3 selected</p>
            </div>
            <div className="trio-pick__grid" role="group" aria-label="Cartridge trios">
              {trioChoices.map((family) => {
                const count = trios.filter((pick) => pick === family).length;
                const locked = !inStock || (trios.length >= 3 && count === 0);
                return (
                  <div key={family} className={count ? "trio-card is-on" : locked ? "trio-card is-locked" : "trio-card"}>
                    <div className="trio-chip__shot">
                      <Image src={trioPhotoSrc(family)} alt="" width={64} height={64} sizes="64px" />
                      <button
                        id={`trio-${family.replaceAll(" ", "-")}`}
                        type="button"
                        className="trio-chip"
                        aria-pressed={count > 0}
                        aria-label={count ? `${family}, selected ${count} time${count === 1 ? "" : "s"}. Add another` : `Select ${family}`}
                        disabled={locked || trios.length >= 3}
                        onClick={() => setTrios((currentPicks) => {
                          if (currentPicks.length >= 3) return currentPicks;
                          return [...currentPicks, family];
                        })}
                      />
                      {count > 0 ? (
                        <button
                          type="button"
                          className="trio-chip__x"
                          aria-label={`Remove ${family}`}
                          onClick={() => setTrios((currentPicks) => {
                            const pick = currentPicks.lastIndexOf(family);
                            if (pick < 0) return currentPicks;
                            return currentPicks.filter((_, itemIndex) => itemIndex !== pick);
                          })}
                        >
                          ×
                        </button>
                      ) : null}
                    </div>
                    <label className="trio-chip__name" htmlFor={`trio-${family.replaceAll(" ", "-")}`}>
                      {family}
                    </label>
                    {count > 1 ? <span className="trio-chip__qty">×{count}</span> : null}
                  </div>
                );
              })}
            </div>
            {trios.length ? <p className="trio-pick__shades">{trios.join(" · ")}</p> : null}
          </div>
          <div className="actions buy-cta">
            {inStock ? (
              <>
              {!triosReady ? <p className="buy-cta__note">{trios.length === 0 ? "Select 3 families to continue." : `Select ${3 - trios.length} more ${trios.length === 2 ? "family" : "families"} to continue.`}</p> : null}
              <button
                type="button"
                className="buy-add"
                disabled={!triosReady || adding}
                onClick={() => {
                  if (adding) return;
                  const selection = deviceFamilySelection(trios.join(" · "));
                  if (!selection) return;
                  setAdding(true);
                  addItem({ ...(item || { id: product.id, slug: product.slug, name: product.name, price, image: product.images.hero.src }), quantity: 1, variantName: selection });
                  acknowledgeAdd();
                  window.setTimeout(() => setAdding(false), 700);
                }}
              >
                {adding ? "Added" : "Add to cart"}
              </button>
              <button
                type="button"
                className="buy-now"
                disabled={!triosReady || adding}
                onClick={() => {
                  if (adding) return;
                  const selection = deviceFamilySelection(trios.join(" · "));
                  if (!selection) return;
                  addItem({ ...(item || { id: product.id, slug: product.slug, name: product.name, price, image: product.images.hero.src }), quantity: 1, variantName: selection });
                  router.push("/checkout");
                }}
              >
                Buy now
              </button>
              </>
            ) : (
              <p>Out of stock</p>
            )}
          </div>
          <details className="set-fold">
            <summary>
              <span>This set contains</span>
              <span>4 products</span>
            </summary>
            {triosReady ? <SetContains trios={trios} bare /> : <p>Select any 3 families. Remove clears that choice.</p>}
          </details>
          <div className="buy-folds">
            <details>
              <summary>Description</summary>
              <div className="description-sheet">
                <h3>What it is</h3>
                <p>Create thousands of custom shades with YSL color expertise and cutting edge PERSO technology. This purchase includes the Rouge Sur Mesure device, 3 complimentary cartridge trios — 9 cartridges total — and a retractable lip brush. You choose those 3 trios before the device is added to your bag.</p>
                <h3>What it does</h3>
                <p>Lip color designed by you, styled by YSL Beauty. Experience a new way to dress your lips in liquid velvet with the latest advanced beauty technology. Choose colors in four unique ways: shade palette, shade match, YSL shade stylist, and Get The Look. Rouge Sur Mesure app is available on iOS (minimum iOS 13 with iPhone 6S or higher) and Android 8.0 or higher supporting Bluetooth 4.2.</p>
                <p>Rouge Sur Mesure will only produce colors from the following trios. Cartridges cannot be blended outside the below trio formats:</p>
                <ul>
                  {supportedTrios.map((trio) => (
                    <li key={trio.name}>
                      <strong>{trio.name}:</strong> {trio.codes}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
            <details>
              <summary>Ingredients</summary>
              <div className="ingredient-sheet">
                {ingredientGroups.map((group) => (
                  <section key={group.name}>
                    <h3>{group.name}</h3>
                    {group.codes.map((cartridge) => (
                      <details key={cartridge.code} className="ingredient-code">
                        <summary>{cartridge.label}</summary>
                        <ul>
                          {cartridgeIngredients[cartridge.code].split(" • ").map((item, index) => (
                            <li key={`${cartridge.code}-${index}`}>{item}</li>
                          ))}
                        </ul>
                      </details>
                    ))}
                  </section>
                ))}
              </div>
            </details>
            <details>
              <summary>Seven families</summary>
              <div className="family-sheet">
                <p className="kicker">Cartridges</p>
                <h3>Seven families</h3>
                <p>Any 3 of the seven families. A family can be chosen more than once.</p>
                <ul className="pdp-families">
                  {families.map((family) => {
                    const codes = supportedTrios.find((trio) => trio.name === family.name)?.codes;
                    return (
                      <li key={family.name}>
                        <strong>{family.name}</strong>
                        <span>{family.note}{codes ? ` · ${codes}` : ""}</span>
                      </li>
                    );
                  })}
                </ul>
                <p>{deviceOffering.separateNote}</p>
              </div>
            </details>
            <details>
              <summary>Product details</summary>
              <p>{deviceFacts.type}</p>
              <ul className="pdp-families">
                {deviceOffering.items.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
              <p>{deviceFacts.whatItDoes}</p>
            </details>
            <details id="faq">
              <summary>FAQ</summary>
              <FaqList items={pdpFaq} />
            </details>
          </div>
        </div>
      </aside>
      {lightbox ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged product image"
          onClick={(event) => {
            if (event.target === event.currentTarget) setLightbox(false);
          }}
        >
          <button ref={closeRef} type="button" className="lightbox-close" onClick={() => setLightbox(false)}>
            Close
          </button>
          <button type="button" className="lightbox-nav" onClick={() => step(-1)} aria-label="Previous image">
            Previous
          </button>
          <Image src={current.src} alt={current.alt} width={current.width} height={current.height} style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "78vh", objectFit: "contain" }} />
          <button type="button" className="lightbox-nav" onClick={() => step(1)} aria-label="Next image">
            Next
          </button>
          <p>
            {index + 1} / {gallery.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}
