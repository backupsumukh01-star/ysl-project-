"use client";

import { useEffect } from "react";
import Link from "next/link";
import { experienceSteps } from "@/lib/content";
import { product } from "@/lib/product";
import { Media } from "@/components/media";
import { track } from "@/lib/analytics";
import { trackCustom } from "@/lib/analytics/meta";
import "../quiet.css";

const images = [product.images.showcase, product.images.swatches, product.images.app];

export default function ExperiencePage() {
  useEffect(() => {
    trackCustom("HowItWorksViewed");
    const root = document.querySelector(".experience-page");
    if (!root) return;
    const steps = [...root.querySelectorAll(".experience-step")];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      steps.forEach((step) => step.classList.add("is-in"));
      return;
    }
    root.classList.add("is-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.28 },
    );
    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);

  return (
    <main id="main" className="page quiet-page experience-page">
      <p className="kicker">How it works</p>
      <h1>Device, trio, and app.</h1>
      <div className="steps">
        {experienceSteps.map((step, index) => (
          <article className={index % 2 ? "experience-step is-flip" : "experience-step"} key={step.index}>
            <Media {...images[index]} fit="contain" sizes="(max-width: 899px) 70vw, 420px" />
            <div className="experience-copy">
              <p className="index">{step.index}</p>
              <h2>{step.title}</h2>
              <p>{step.copy}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="actions">
        <Link className="btn btn-gold" href="/shop" onClick={() => track("click_shop")}>
          Shop all products
        </Link>
      </div>
    </main>
  );
}
