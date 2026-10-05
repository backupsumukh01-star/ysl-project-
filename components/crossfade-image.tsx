"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function CrossfadeImage({
  src,
  alt,
  sizes,
  fit = "contain",
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  fit?: "contain" | "cover";
  priority?: boolean;
}) {
  const [current, setCurrent] = useState(src);
  const [previous, setPrevious] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (src === current) return;
    setPrevious(current);
    setCurrent(src);
    setVisible(false);
    const frame = requestAnimationFrame(() => setVisible(true));
    const timer = window.setTimeout(() => setPrevious(null), 240);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [src, current]);

  const style = { objectFit: fit, objectPosition: "center center" as const };
  return (
    <span className="crossfade">
      {previous ? <Image src={previous} alt="" fill sizes={sizes} style={style} /> : null}
      <Image className={visible ? "is-shown" : undefined} src={current} alt={alt} fill sizes={sizes} priority={priority && !previous} style={style} />
    </span>
  );
}
