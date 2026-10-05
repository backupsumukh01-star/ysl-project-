import type { CSSProperties } from "react";
import Image from "next/image";

type MediaProps = {
  src: string;
  alt: string;
  position?: string;
  ratio?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  fit?: "cover" | "contain";
  shot?: { width: number; height: number };
};

export function Media({
  src,
  alt,
  position = "center center",
  ratio = "ratio-portrait",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className = "",
  fit = "cover",
  shot,
}: MediaProps) {
  return (
    <div className={`media ${ratio} ${className}`} style={shot ? ({ "--shot": `${shot.width} / ${shot.height}` } as CSSProperties) : undefined}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} style={{ objectFit: fit, objectPosition: position }} />
    </div>
  );
}
