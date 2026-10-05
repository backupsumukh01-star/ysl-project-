"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { experienceSteps, shadeMethods, whyPoints, faqItems } from "@/lib/content";
import { product, shadeNotes } from "@/lib/product";
import { Media } from "@/components/media";
import { AddToCartButton, BuyNowButton, Price, QuantitySelector } from "@/components/commerce";
import { track } from "@/lib/analytics";
import { trackCustom } from "@/lib/analytics/meta";

const stepImages = [product.images.showcase, product.images.swatches, product.images.app, product.images.lip];
let howViewed = false;
let colorViewed = false;

export function HowItWorks({ linked = true }: { linked?: boolean }) {
  useEffect(() => {
    const node = document.getElementById("how");
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || howViewed) return;
      howViewed = true;
      trackCustom("HowItWorksViewed");
      observer.disconnect();
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <section className="section" id="how">
      <div className="frame">
        <p className="kicker">How it works</p>
        <h2 className="title">Device, trio, app, then the lip</h2>
        <p className="lede">Includes 3 complimentary cartridge sets — 9 cartridges total. Create your shades with the official app, then apply with the included brush.</p>
        <div className="step-grid">
          {experienceSteps.map((step, index) => (
            <article key={step.index} className="step-card">
              <Media {...stepImages[index]} ratio="ratio-story" sizes="(max-width: 768px) 100vw, 25vw" />
              <p className="index">{step.index}</p>
              <h3>{step.title}</h3>
              <p className="muted">{step.copy}</p>
            </article>
          ))}
        </div>
        {linked ? (
          <Link className="btn btn-ghost" href="/experience" onClick={() => track("view_experience")}>
            See how it works
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export function ColorExplorer() {
  const [shade, setShade] = useState(0);
  const current = shadeNotes[shade];

  useEffect(() => {
    const node = document.getElementById("colors");
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || colorViewed) return;
      colorViewed = true;
      trackCustom("ColorExperienceViewed");
      observer.disconnect();
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section" id="colors">
      <div className="frame">
        <div>
          <p className="kicker">Discover your color family</p>
          <h2 className="title">Choose your color family</h2>
          <p className="lede">The device works with these seven trios only. Cartridges are not blended outside them.</p>
          <div className="swatch-list" role="list">
            {shadeNotes.map((item, index) => (
              <button
                key={item.name}
                type="button"
                className={`swatch ${shade === index ? "is-selected" : ""}`}
                aria-pressed={shade === index}
                onClick={() => {
                  setShade(index);
                  track("view_shades", { shade: item.name });
                }}
              >
                <small>{item.name}</small>
                <small>{item.codes}</small>
              </button>
            ))}
          </div>
          <p className="kicker">{current.name}</p>
          <p>{current.codes}</p>
          <p>{current.note}</p>
          <div className="actions">
            <Link className="btn btn-gold" href={current.href} onClick={() => track("view_shades")}>
              Shop trio
            </Link>
            <Link className="btn btn-ghost" href={current.href}>
              View trio
            </Link>
          </div>
        </div>
        <div className="shade-visuals">
          <Media {...product.images.swatches} ratio="ratio-square" sizes="(max-width: 768px) 100vw, 40vw" />
          <Media {...product.images.finished} ratio="ratio-square" sizes="(max-width: 768px) 100vw, 40vw" />
        </div>
      </div>
    </section>
  );
}

export function Routine() {
  const beats = [
    { image: product.images.vanity, line: "This belongs on your vanity." },
    { image: product.images.woman, line: "Explore your color." },
    { image: product.images.lifestyle, line: "Finish with the shade you love." },
  ];
  return (
    <section className="section">
      <div className="frame">
        <p className="kicker">Beauty in real life</p>
        <h2 className="title">See it in your routine</h2>
        <div className="beats">
          {beats.map((beat) => (
            <figure key={beat.line}>
              <Media
                {...beat.image}
                sizes="(max-width: 768px) 100vw, 33vw"
                shot={
                  beat.image.src.endsWith("vanity.png") || beat.image.src.endsWith("lifestyle.png")
                    ? { width: 720, height: 1280 }
                    : { width: 941, height: 1672 }
                }
              />
              <figcaption>{beat.line}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Included() {
  return (
    <section className="section">
      <div className="frame">
        <p className="kicker">What&apos;s in the box</p>
        <h2 className="title">Designed to be unboxed</h2>
        <p className="lede">The photographs show the device and the black presentation box. This purchase also includes 3 complimentary cartridge sets — 9 cartridges total — and a retractable lip brush. The brush is described in the official instructions and is not shown in these photographs.</p>
        <div className="included">
          <article>
            <Media {...product.images.packaging} />
            <h3>Device</h3>
            <p className="muted">The matte-black creator with its quilted lid, shown in the box.</p>
          </article>
          <article>
            <Media {...product.images.unboxing} />
            <h3>Packaging</h3>
            <p className="muted">A black presentation box, opened to the lid and the device.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function PurchaseBlock({ offer }: { offer?: { id: string; slug: string; name: string; price: number | null; compareAt?: number | null; sku?: string; image?: string } | null }) {
  const [quantity, setQuantity] = useState(1);
  const item = offer
    ? { id: offer.id, slug: offer.slug, name: offer.name, price: offer.price, sku: offer.sku, image: offer.image }
    : undefined;
  return (
    <section className="section purchase-block" id="purchase">
      <div className="frame split">
        <Media {...product.images.showcase} priority sizes="(max-width: 768px) 100vw, 50vw" />
        <div className="buy-panel">
          <p className="kicker">Rouge Sur Mesure</p>
          <h2>Custom Lip Color Creator</h2>
          <Price amount={offer ? offer.price : undefined} compareAt={offer?.compareAt} />
          <QuantitySelector value={quantity} onChange={setQuantity} />
          <div className="actions">
            <AddToCartButton quantity={quantity} full item={item} />
            <BuyNowButton quantity={quantity} full item={item} />
          </div>
          <ul className="quiet">
            <li>Secure checkout</li>
            <li>Premium presentation</li>
            <li>Shipping calculated at checkout</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function WhySection() {
  return (
    <section className="section">
      <div className="frame why-layout">
        <div>
          <p className="kicker">Why Rouge Sur Mesure?</p>
          <h2 className="title">Made for your color.</h2>
          <div className="why-grid">
            {whyPoints.map((point) => (
              <article key={point.title}>
                <h3>{point.title}</h3>
                <p className="muted">{point.copy}</p>
              </article>
            ))}
          </div>
        </div>
        <Media {...product.images.marble} ratio="ratio-portrait" sizes="(max-width: 768px) 100vw, 40vw" shot={{ width: 864, height: 1152 }} />
      </div>
    </section>
  );
}

export function AppExperience() {
  return (
    <section className="section" id="app">
      <div className="frame split">
        <Media {...product.images.app} sizes="(max-width: 768px) 100vw, 50vw" />
        <div>
          <p className="kicker">The official app</p>
          <h2 className="title">Download the app</h2>
          <p className="lede">Create and share custom shades with the official Rouge Sur Mesure app. The app is required for shade creation.</p>
          <ul className="plain">
            <li>iOS 13 or later on iPhone 6S or newer</li>
            <li>Android 8.0 or later</li>
            <li>Bluetooth 4.2</li>
          </ul>
          <div className="actions">
            <button className="btn btn-ghost" type="button" disabled>
              App Store link not configured
            </button>
            <button className="btn btn-ghost" type="button" disabled>
              Google Play link not configured
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ShadeMethodCards() {
  const visuals = [product.images.swatches, product.images.app, product.images.lifestyle, product.images.lip];
  return (
    <section className="section" id="methods">
      <div className="frame">
        <p className="kicker">Shade creation</p>
        <h2 className="title">Four ways to choose a shade</h2>
        <div className="method-rail">
          {shadeMethods.map((method, index) => (
            <article key={method.title} className="method-card">
              <Media {...visuals[index]} ratio="ratio-square" sizes="(max-width: 768px) 80vw, 25vw" />
              <p className="index">{method.index}</p>
              <h3>{method.title}</h3>
              <p className="muted">{method.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RestockSection() {
  return (
    <section className="section" id="restock">
      <div className="frame split">
        <Media {...product.images.finished} sizes="(max-width: 768px) 100vw, 50vw" />
        <div>
          <p className="kicker">Cartridges</p>
          <h2 className="title">Restock your favorites</h2>
          <p className="lede">Each supported color family uses three cartridges. Come back here when you need to replenish a shade you already use.</p>
          <Link className="btn btn-gold" href="/refills">
            Restock now
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ShopProof() {
  return (
    <section className="section" id="reviews">
      <div className="frame">
        <p className="kicker">This shop</p>
        <h2 className="title">Reviews</h2>
        <p className="lede">Reviews appear here after a verified purchase from this shop. Ratings from other stores are not shown.</p>
        <div className="proof-grid">
          <div>
            <p className="index">—</p>
            <p>No shop reviews yet</p>
          </div>
          <div className="qa">
            <h3>Questions</h3>
            {faqItems.slice(0, 4).map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
            <Link href="/faq">All questions</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalBuy({ offer }: { offer?: { id: string; slug: string; name: string; price: number | null; sku?: string; image?: string } | null }) {
  const item = offer
    ? { id: offer.id, slug: offer.slug, name: offer.name, price: offer.price, sku: offer.sku, image: offer.image }
    : undefined;
  return (
    <section className="section">
      <div className="frame buy-panel final-buy">
        <p className="kicker">Rouge Sur Mesure</p>
        <h2 className="title">Ready when you are.</h2>
        <Price amount={offer ? offer.price : undefined} />
        <div className="actions">
          <AddToCartButton full item={item} />
          <BuyNowButton full item={item} />
        </div>
      </div>
    </section>
  );
}
