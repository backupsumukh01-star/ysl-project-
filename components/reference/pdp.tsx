"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/product";
import { colorFamilies, familyGroups, referenceFacts, referenceFaqs, referenceMethods, referenceSteps, type FamilyGroup } from "@/lib/reference/catalog";
import { referenceImages } from "@/lib/reference/images";
import type { RefOffer } from "@/lib/reference/types";
import { RefPhoto } from "@/components/reference/photo";

export function ReferencePdp({
  offer,
  related,
  mode,
}: {
  offer: RefOffer;
  related: RefOffer[];
  mode: "device" | "trio" | "refill" | "bundle";
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [index, setIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState<string | null>("Description");
  const [group, setGroup] = useState<FamilyGroup>("ALL");
  const [variantId, setVariantId] = useState(offer.variants[0]?.id || "");
  const [panel, setPanel] = useState<"reviews" | "qa">("reviews");
  const [question, setQuestion] = useState("");
  const touchX = useRef<number | null>(null);
  const variant = offer.variants.find((item) => item.id === variantId);
  const price = variant?.price ?? offer.price;
  const image = offer.images[index] || offer.images[0];
  const visibleFamilies = colorFamilies.filter((family) => group === "ALL" || family.group === group);

  useEffect(() => {
    const raw = window.localStorage.getItem("rsm-ref-fav");
    const savedIds = raw ? (JSON.parse(raw) as string[]) : [];
    setSaved(savedIds.includes(offer.slug));
  }, [offer.slug]);

  function toggleSave() {
    const raw = window.localStorage.getItem("rsm-ref-fav");
    const savedIds = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
    if (savedIds.has(offer.slug)) savedIds.delete(offer.slug);
    else savedIds.add(offer.slug);
    window.localStorage.setItem("rsm-ref-fav", JSON.stringify([...savedIds]));
    setSaved(savedIds.has(offer.slug));
  }

  function line() {
    return {
      id: offer.id,
      slug: offer.slug,
      name: offer.name,
      price,
      sku: variant?.sku || offer.sku,
      image: image?.src,
      quantity: qty,
      variantId: variant?.id,
      variantName: variant?.name,
    };
  }

  function add() {
    if (!offer.id || !offer.inStock) return;
    addItem(line());
  }

  function buy() {
    if (!offer.id || !offer.inStock) return;
    addItem(line());
    router.push("/reference/checkout");
  }

  const crumbs = mode === "device"
    ? [{ href: "/reference", label: "Home" }, { href: "/reference/shop", label: "Custom lip creator" }]
    : [{ href: "/reference", label: "Home" }, { href: "/reference/cartridges", label: "Cartridges" }];

  return (
    <article>
      <p className="ref-crumb">
        {crumbs.map((crumb) => (
          <span key={crumb.href}><Link href={crumb.href}>{crumb.label}</Link> {" › "}</span>
        ))}
        <span>{offer.name}</span>
      </p>
      <div className="ref-buy">
        <div>
          <h1 className="ref-title">{mode === "trio" ? "Rouge Sur Mesure color cartridge trio" : offer.name}</h1>
          <p className="ref-price-row">
            <span className="ref-price">{formatMoney(price)}</span>
            <span className="ref-muted">{offer.inStock ? "Available to order" : "Out of stock"}</span>
          </p>
          <p className="ref-lede">{offer.shortDescription}</p>
          <p className="ref-rating"><span aria-hidden="true">☆☆☆☆☆ </span>No verified reviews yet. <Link href="/contact">Write a review</Link></p>
          <div
            className="ref-stage"
            tabIndex={0}
            role="group"
            aria-label="Product gallery"
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") setIndex((value) => (value + 1) % offer.images.length);
              if (event.key === "ArrowLeft") setIndex((value) => (value - 1 + offer.images.length) % offer.images.length);
            }}
            onTouchStart={(event) => { touchX.current = event.changedTouches[0]?.clientX ?? null; }}
            onTouchEnd={(event) => {
              if (touchX.current == null) return;
              const delta = (event.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
              if (delta < -40) setIndex((value) => (value + 1) % offer.images.length);
              if (delta > 40) setIndex((value) => (value - 1 + offer.images.length) % offer.images.length);
              touchX.current = null;
            }}
          >
            {image ? <RefPhoto src={image.src} alt={image.alt} priority={index === 0} sizes="100vw" /> : null}
            <button className="ref-heart" type="button" aria-pressed={saved} aria-label={saved ? "Remove favorite" : "Save favorite"} onClick={toggleSave}>
              {saved ? "♥" : "♡"}
            </button>
          </div>
          <div className="ref-thumbs">
            <button className="ref-arrow" type="button" aria-label="Previous image" onClick={() => setIndex((value) => (value - 1 + offer.images.length) % offer.images.length)}>‹</button>
            <div className="ref-thumbs-rail">
              {offer.images.map((item, imageIndex) => (
                <button key={item.src + imageIndex} type="button" aria-label={`Show image ${imageIndex + 1}`} aria-current={imageIndex === index ? "true" : undefined} onClick={() => setIndex(imageIndex)}>
                  <RefPhoto src={item.src} alt="" sizes="72px" />
                </button>
              ))}
            </div>
            <button className="ref-arrow" type="button" aria-label="Next image" onClick={() => setIndex((value) => (value + 1) % offer.images.length)}>›</button>
          </div>
        </div>
        <div className="ref-buy-side" id="purchase">
          {mode === "trio" ? (
            <>
              <label>
                Colour
                <select className="ref-select" aria-label="Color family" value={offer.slug} onChange={(event) => router.push(`/reference/product/${event.target.value}`)}>
                  {colorFamilies.map((family) => (
                    <option key={family.href} value={family.href.split("/").pop()}>{family.name} · {family.codes}</option>
                  ))}
                </select>
              </label>
              <div className="ref-tabs" role="tablist" aria-label="Color groups">
                {familyGroups.map((item) => (
                  <button key={item.id} type="button" role="tab" aria-selected={group === item.id} onClick={() => setGroup(item.id)}>{item.label}</button>
                ))}
              </div>
              <div className="ref-swatches">
                {visibleFamilies.map((family) => (
                  <Link key={family.name} href={family.href} aria-label={family.name} aria-current={family.href.endsWith(offer.slug) ? "page" : undefined}>
                    <span className="ref-swatch" style={{ background: family.swatch }} />
                  </Link>
                ))}
              </div>
              <p className="ref-muted">{offer.included}</p>
            </>
          ) : null}
          {offer.variants.length ? (
            <label>
              Option
              <select className="ref-select" value={variantId} onChange={(event) => setVariantId(event.target.value)}>
                {offer.variants.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="ref-qty">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQty((value) => Math.max(1, value - 1))}>−</button>
            <span>{qty}</span>
            <button type="button" aria-label="Increase quantity" onClick={() => setQty((value) => Math.min(10, value + 1))}>+</button>
          </div>
          <button className="ref-cta ref-split" type="button" disabled={!offer.inStock || !offer.id} onClick={add}>
            <span>{formatMoney(price)}</span>
            <span>{offer.inStock ? "Add to cart" : "Unavailable"}</span>
          </button>
          <button className="ref-ghost" type="button" disabled={!offer.inStock || !offer.id} onClick={buy}>Buy now</button>
          <p className="ref-muted">{offer.inStock ? offer.availability || "Available to order" : "Out of stock"}</p>
          <p className="ref-muted">Shipping calculated at checkout</p>
          {mode !== "device" ? <p><Link href="/reference/product/rouge-sur-mesure">View the device</Link></p> : null}
        </div>
      </div>

      {related[0] ? (
        <section>
          <h2 className="ref-h-strong">Frequently bought together</h2>
          {related.slice(0, 4).map((item) => (
            <article className="ref-together" key={item.id}>
              {item.images[0] ? <RefPhoto src={item.images[0].src} alt={item.images[0].alt} sizes="96px" ratio="96 / 120" /> : null}
              <div>
                <h3>{item.name}</h3>
                <p className="ref-muted">{item.shortDescription}</p>
                <p>{formatMoney(item.price)}</p>
                <button className="ref-ghost" type="button" disabled={!item.inStock || !item.id} onClick={() => addItem({
                  id: item.id,
                  slug: item.slug,
                  name: item.name,
                  price: item.price,
                  sku: item.sku,
                  image: item.images[0]?.src,
                })}>Add to cart</button>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <section>
        <h2 className="ref-h">Product information</h2>
        {referenceFacts.map((fact) => (
          <div className="ref-acc" key={fact.title}>
            <button className="ref-acc-btn" type="button" aria-expanded={open === fact.title} onClick={() => setOpen(open === fact.title ? null : fact.title)}>
              {fact.title} <span>{open === fact.title ? "−" : "+"}</span>
            </button>
            <div className={`ref-panel ${open === fact.title ? "open" : ""}`}>
              <div><p>{fact.body}</p></div>
            </div>
          </div>
        ))}
      </section>

      <ColorFamily />
      <Steps />
      <ShadeWheel />
      <AppBlock />
      <Methods />
      <section>
        <h2 className="ref-h-strong">Restock your favorites</h2>
        <RefPhoto src={referenceImages.lifestyle.src} alt={referenceImages.lifestyle.alt} ratio="4 / 5" sizes="100vw" />
        <p>Each supported color family uses three cartridges. The official app can warn when formula is low.</p>
        <Link className="ref-cta" href="/reference/refills">Restock now</Link>
      </section>

      <div className="ref-tabs-block" role="tablist">
        <button type="button" role="tab" aria-selected={panel === "reviews"} onClick={() => setPanel("reviews")}>Reviews</button>
        <button type="button" role="tab" aria-selected={panel === "qa"} onClick={() => setPanel("qa")}>Questions & answers</button>
      </div>
      {panel === "reviews" ? <ReviewEmpty /> : <QuestionList query={question} onQuery={setQuestion} />}
    </article>
  );
}

function ColorFamily() {
  const [index, setIndex] = useState(0);
  const family = colorFamilies[index];
  return (
    <section id="colors">
      <p className="ref-h">Choose your color family</p>
      <div
        className="ref-circle"
        style={{ background: `radial-gradient(circle at 30% 30%, #fff, ${family.swatch})` }}
        role="img"
        aria-label={`${family.name} color placeholder`}
      />
      <h2 className="ref-h-strong">{family.name}</h2>
      <p>{family.codes}</p>
      <p>{family.note}</p>
      <Link className="ref-cta" href={family.href}>View color family</Link>
      <div className="ref-dots">
        {colorFamilies.map((item, itemIndex) => (
          <button key={item.name} type="button" aria-label={item.name} aria-current={itemIndex === index ? "true" : undefined} onClick={() => setIndex(itemIndex)} />
        ))}
      </div>
    </section>
  );
}

function Steps() {
  const photos = [referenceImages.device[3], referenceImages.colorVisual, referenceImages.app, referenceImages.lifestyle];
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  return (
    <section>
      <h2 className="ref-sr" id="how">How it works</h2>
      <div
        className="ref-rail"
        ref={rail}
        tabIndex={0}
        aria-label="How it works"
        onKeyDown={(event) => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          event.preventDefault();
          const next = event.key === "ArrowRight" ? Math.min(active + 1, referenceSteps.length - 1) : Math.max(active - 1, 0);
          const child = rail.current?.children[next] as HTMLElement | undefined;
          if (rail.current && child) rail.current.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
        }}
        onScroll={(event) => {
          const el = event.currentTarget;
          const next = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
          setActive(Math.min(referenceSteps.length - 1, Math.max(0, next)));
        }}
      >
        {referenceSteps.map((step, index) => {
          const photo = photos[index] || referenceImages.device[0];
          return (
            <article className="ref-card" key={step.index}>
              <RefPhoto src={photo.src} alt={photo.alt} ratio="4 / 5" sizes="90vw" />
              <h3 className="ref-h-strong">{Number(step.index)}. {step.title}</h3>
              <p>{step.copy}</p>
            </article>
          );
        })}
      </div>
      <div className="ref-dots">
        {referenceSteps.map((step, index) => (
          <button
            key={step.index}
            type="button"
            aria-label={step.title}
            aria-current={index === active ? "true" : undefined}
            onClick={() => {
              const child = rail.current?.children[index] as HTMLElement | undefined;
              if (rail.current && child) rail.current.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
            }}
          />
        ))}
      </div>
    </section>
  );
}

function ShadeWheel() {
  return (
    <section aria-label="Shade wheel">
      <div className="ref-wheel">
        {colorFamilies.map((family) => (
          <figure key={family.name}>
            <span style={{ background: family.swatch }} />
            <figcaption>{family.name}</figcaption>
          </figure>
        ))}
      </div>
      <h2 className="ref-h-strong">Shade wheel</h2>
      <p>The official app includes a shade wheel for custom colors. This page shows the seven supported cartridge families. It does not run the wheel.</p>
    </section>
  );
}

function AppBlock() {
  return (
    <section id="app">
      <div className="ref-app-art">
        <div>
          <p>App artwork placeholder</p>
          <p className="ref-muted">Store badges stay hidden until official download links are configured.</p>
        </div>
      </div>
      <h2 className="ref-h-strong">3. Download the app</h2>
      <p>Create and share custom shades with the official companion app on iOS and Android.</p>
      <ul>
        <li>iOS 13 or later on iPhone 6S or newer</li>
        <li>Android 8.0 or later</li>
        <li>Bluetooth 4.2</li>
      </ul>
      <button className="ref-ghost" type="button" disabled>App Store link not configured</button>
      <button className="ref-ghost" type="button" disabled>Google Play link not configured</button>
    </section>
  );
}

function Methods() {
  const visuals = [referenceImages.colorVisual, referenceImages.app, referenceImages.lifestyle, referenceImages.device[5]];
  return (
    <section>
      <h2 className="ref-h">Shade creation</h2>
      <div className="ref-rail" aria-label="Shade creation methods">
        {referenceMethods.map((method, index) => (
          <article className="ref-card" key={method.title}>
            <RefPhoto src={visuals[index].src} alt={visuals[index].alt} ratio="4 / 3" sizes="90vw" />
            <p>{method.index}</p>
            <h3>{method.title}</h3>
            <p className="ref-muted">{method.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReviewEmpty() {
  return (
    <section className="ref-snapshot" aria-label="Reviews">
      <h2 className="ref-h-strong">Reviews</h2>
      <p>Rating snapshot</p>
      <p className="ref-muted">No verified customer reviews yet.</p>
      {[5, 4, 3, 2, 1].map((star) => (
        <div className="ref-barline" key={star}>
          <span>{star} star</span>
          <span><i /></span>
          <span>0</span>
        </div>
      ))}
      <p>Overall rating</p>
      <p className="ref-stars">No rating yet</p>
    </section>
  );
}

function QuestionList({ query, onQuery }: { query: string; onQuery: (value: string) => void }) {
  const items = referenceFaqs.filter((item) => item.question.toLowerCase().includes(query.toLowerCase()) || item.answer.toLowerCase().includes(query.toLowerCase()));
  return (
    <section>
      <h2 className="ref-h-strong">Questions & answers</h2>
      <label>
        Search questions
        <input className="ref-select" value={query} onChange={(event) => onQuery(event.target.value)} />
      </label>
      {items.map((item) => (
        <details key={item.question} className="ref-acc">
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
      <Link className="ref-ghost" href="/contact">Ask a question</Link>
    </section>
  );
}
