"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { shadeNotes } from "@/lib/product";
import { Price } from "@/components/commerce";
import { publishedCompareMajor, publishedMajor } from "@/lib/pricing";
import { trioDots, trioLook, type TrioFamilyName } from "@/lib/trio-images";

const order = ["Red", "Pink", "Orange", "Nude", "Warm Red", "Warm Nude", "Cool Nude"] as const;

export function LiveColors({ images }: { images: Partial<Record<TrioFamilyName, string>> }) {
  const [mood, setMood] = useState<(typeof order)[number]>("Red");
  const note = shadeNotes.find((entry) => entry.name === mood);
  const src = images[mood];
  const price = publishedMajor("CARTRIDGE_TRIO");

  return (
    <section className="mk-live" id="colors" aria-labelledby="colors-title">
      <div className="mk-live__shot">
        {src ? (
          <Image key={src} src={src} alt={`${mood} cartridge trio`} fill sizes="160px" style={{ objectFit: "contain", objectPosition: "center center" }} />
        ) : null}
      </div>
      <div className="mk-live__copy">
        <p className="mk-kicker">Seven trios</p>
        <div className="mk-live__title">
          <h2 id="colors-title">{mood}</h2>
          <div className="mk-price"><Price amount={price} compareAt={publishedCompareMajor("CARTRIDGE_TRIO")} /></div>
        </div>
        <p className="mk-live__shades">{trioLook[mood]}</p>
      </div>
      <div className="mk-live__bar">
        <div className="mk-live__picks" role="listbox" aria-label="Color families">
          {order.map((name) => (
            <button key={name} type="button" role="option" aria-selected={mood === name} aria-label={name} className={mood === name ? "is-on" : undefined} onClick={() => setMood(name)}>
              <span className="mk-live__chip" aria-hidden="true">
                {trioDots[name].map((color) => (
                  <i key={color} style={{ background: color }} />
                ))}
              </span>
            </button>
          ))}
        </div>
        {note ? (
          <Link className="mk-live__view" href={note.href}>
            Explore {mood} →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
