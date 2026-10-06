"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { LiveColors } from "@/components/live-colors";
import { AppDownload } from "@/components/app-download";
import type { AppDownloadLinks } from "@/lib/app-links";
import type { CartInput } from "@/components/cart-provider";
import { Price } from "@/components/commerce";
import { publishedPrices } from "@/lib/pricing";
import { deviceOffering, product } from "@/lib/product";
import type { TrioFamilyName } from "@/lib/trio-images";

const shot = { objectFit: "contain" as const, objectPosition: "center center" };

function LaunchPrice() {
  return (
    <div className="mk-launch">
      <Price amount={publishedPrices.device} compareAt={publishedPrices.deviceCompareAt} />
    </div>
  );
}

function ApplyVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let started = false;

    let restarting = false;
    const nearEnd = () =>
      Number.isFinite(video.duration) &&
      video.duration > 0 &&
      video.currentTime >= video.duration - 0.35;
    const replay = () => {
      if (motion.matches || restarting) return;
      restarting = true;
      let settled = false;
      let timer = 0;
      const finish = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        video.removeEventListener("seeked", finish);
        const pending = video.play();
        if (pending) pending.then(() => { restarting = false; }, () => { restarting = false; });
        else restarting = false;
      };
      if (video.currentTime < 0.05) {
        finish();
        return;
      }
      video.addEventListener("seeked", finish);
      timer = window.setTimeout(finish, 700);
      try {
        video.currentTime = 0;
      } catch {
        finish();
      }
    };
    const onEnded = () => replay();
    const onPause = () => {
      if (motion.matches || restarting) return;
      if (nearEnd()) replay();
    };
    const onSeeked = () => {
      if (motion.matches || restarting || !video.paused) return;
      if (nearEnd()) replay();
    };
    const onTime = () => {
      if (motion.matches || restarting || video.seeking) return;
      if (nearEnd()) replay();
    };

    const start = () => {
      if (started) return;
      started = true;
      const reduce = motion.matches;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.preload = "auto";
      if (reduce) {
        video.loop = false;
        video.removeAttribute("loop");
      } else {
        video.loop = true;
        video.setAttribute("loop", "");
      }
      video.src = src;
      if (reduce) {
        video.addEventListener(
          "loadeddata",
          () => {
            video.pause();
            if (video.currentTime === 0) video.currentTime = 0.001;
          },
          { once: true },
        );
        return;
      }
      video.loop = true;
      video.setAttribute("loop", "");
      video.addEventListener("ended", onEnded);
      video.addEventListener("pause", onPause);
      video.addEventListener("seeked", onSeeked);
      video.addEventListener("timeupdate", onTime);
      video.autoplay = true;
      const pending = video.play();
      if (pending) pending.catch(() => undefined);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        start();
        observer.disconnect();
      },
      { rootMargin: "240px" },
    );
    observer.observe(video);
    const onMotion = () => {
      if (!started) return;
      if (motion.matches) {
        video.loop = false;
        video.removeAttribute("loop");
        video.removeEventListener("ended", onEnded);
        video.removeEventListener("pause", onPause);
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("timeupdate", onTime);
        video.pause();
      }
    };
    motion.addEventListener("change", onMotion);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", onMotion);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("timeupdate", onTime);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className="mk-film__video"
      muted
      playsInline
      aria-label="How to use Rouge Sur Mesure"
      onError={(event) => {
        event.currentTarget.hidden = true;
      }}
    />
  );
}

export type HomeReview = {
  id: string;
  rating: number;
  title: string;
  comment: string;
  name: string;
};

function ShadeReel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const [shift, setShift] = useState(0);
  const [holding, setHolding] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const hold = useRef(false);
  const drag = useRef({ x: 0, shift: 0 });
  const resumeAt = useRef(0);

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (hold.current || Date.now() < resumeAt.current) return;
      setIndex((current) => (current + 1) % images.length);
    }, 3400);
    return () => window.clearInterval(timer);
  }, [images]);

  function slotWidth() {
    const card = stageRef.current?.querySelector(".mk-reel__card");
    return Math.max(140, (card?.getBoundingClientRect().width || 280) * 0.7);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (images.length < 2 || event.button !== 0) return;
    hold.current = true;
    drag.current = { x: event.clientX, shift: 0 };
    setHolding(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!hold.current) return;
    const next = (drag.current.x - event.clientX) / slotWidth();
    drag.current.shift = next;
    setShift(next);
  }

  function finish(event: ReactPointerEvent<HTMLDivElement>) {
    if (!hold.current) return;
    hold.current = false;
    const moved = drag.current.shift;
    setHolding(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    window.requestAnimationFrame(() => {
      setShift(0);
      if (Math.abs(moved) > 0.16) {
        const step = moved > 0 ? 1 : -1;
        setIndex((current) => (current + step + images.length) % images.length);
      }
      resumeAt.current = Date.now() + 2800;
    });
  }

  return (
    <div
      className={holding ? "mk-reel is-holding" : "mk-reel"}
      aria-roledescription="carousel"
      aria-label="Finished lip shades"
    >
      <div
        className="mk-reel__stage"
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        {images.map((src, imageIndex) => {
          let delta = imageIndex - index;
          if (delta > images.length / 2) delta -= images.length;
          if (delta < -images.length / 2) delta += images.length;
          const place = delta - shift;
          const distance = Math.abs(place);
          const opacity = distance <= 1 ? 1 : 0;
          const scale = distance < 0.35 ? 1 : 0.88;
          return (
            <div
              key={src}
              className="mk-reel__card"
              style={{
                transform: `translateX(calc(-50% + ${place * 70}%)) scale(${scale})`,
                opacity,
                zIndex: 12 - Math.round(distance),
                visibility: distance > 1.05 ? "hidden" : "visible",
              }}
              aria-hidden={distance > 0.5}
            >
              <Image
                src={src}
                alt={distance < 0.5 ? "A finished lip shade." : ""}
                fill
                draggable={false}
                sizes="(max-width: 899px) 70vw, 44vw"
                style={shot}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HomePage({
  trioImages = {},
  modelImages = [],
  appLinks,
}: {
  reviews?: HomeReview[];
  trioImages?: Partial<Record<TrioFamilyName, string>>;
  offer?: CartInput | null;
  modelImages?: string[];
  appLinks: AppDownloadLinks;
}) {
  return (
    <main id="main" className="mk">
      <section className="mk-intro" aria-labelledby="what-title">
        <div className="mk-intro__shot mk-intro__shot--hero">
          <picture>
            <source media="(max-width: 767px)" srcSet="/images/hero-phone.png" />
            <img src="/images/hero-wide.png" alt="The device beside three cartridges on a marble surface." />
          </picture>
        </div>
        <div className="mk-intro__copy">
          <p className="mk-kicker">YSL Beauté</p>
          <h1 id="what-title">Rouge Sur Mesure</h1>
          <p className="mk-lead">Create personalized lip color with YSL beauty technology.</p>
          <LaunchPrice />
          <div className="mk-hero__actions">
            <Link className="btn btn-gold" href="/product/rouge-sur-mesure">Discover Rouge Sur Mesure →</Link>
          </div>
        </div>
      </section>

      <section className="mk-still" aria-label="Your color. Your signature.">
        <p className="mk-mark">01 / Rouge Sur Mesure</p>
        <ShadeReel images={modelImages.length ? modelImages : [product.images.lip.src]} />
        <p>Your color. Your signature.</p>
        <p className="mk-rule"><span>Color collection</span></p>
      </section>

      <LiveColors images={trioImages} />

      <section className="mk-block" id="how-it-works" aria-labelledby="how-title">
        <div className="mk-block__head">
          <p className="mk-kicker">How to use</p>
          <h2 id="how-title">How it works.</h2>
          <p>Your color, created by technology. Choose your cartridge trio, create your personalized shade, and apply it with the precision brush.</p>
        </div>
        <figure className="mk-film">
          <ApplyVideo src="/videos/how-it-works.mp4" />
        </figure>
      </section>

      <section className="mk-block" id="in-the-box" aria-labelledby="box-title">
        <div className="mk-box">
          <div className="mk-box__lead">
            <p className="mk-kicker">What comes in the box</p>
            <h2 id="box-title">The device purchase.</h2>
            <LaunchPrice />
          </div>
          <div className="mk-intro__shot mk-intro__shot--set">
            <Image src="/images/device-purchase.jpg" alt="The Rouge Sur Mesure device in its open presentation box, with the retractable lip brush, cable, accessory case, and nine cartridges." fill sizes="(max-width: 899px) 92vw, 520px" style={shot} />
          </div>
          <div className="mk-box__details">
            <ul className="mk-box__list">
              {deviceOffering.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mk-note">{deviceOffering.separateNote}</p>
            <div className="mk-hero__actions">
              <Link className="btn btn-gold" href="/product/rouge-sur-mesure">View the device</Link>
            </div>
          </div>
        </div>
      </section>
      <AppDownload links={appLinks} />
    </main>
  );
}
