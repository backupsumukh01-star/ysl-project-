import Image from "next/image";
import { cartridgeColor, cartridgePhotoSrc } from "@/lib/cartridge-photos";
import { trioPreviewSrc } from "@/lib/trio-images";

export function refillSwatch(name?: string) {
  return cartridgeColor(name);
}

export function RefillMark({ color = "#8d6b56", compact = false }: { color?: string; compact?: boolean }) {
  return (
    <span className={compact ? "refill-mark refill-mark--line" : "refill-mark"}>
      <i style={{ background: color }} aria-hidden="true" />
    </span>
  );
}

export function CartLineImage({ slug, image, size, label = "" }: { slug: string; image: string; size: number; label?: string }) {
  const cartridgeSrc = cartridgePhotoSrc(label) || cartridgePhotoSrc(image);
  const refillSrc = slug === "cartridge-refill" ? cartridgeSrc || (image.endsWith("/swatches.png") ? "" : image) : "";
  if (slug === "cartridge-refill" && !refillSrc) return <RefillMark compact />;
  if (refillSrc) {
    return (
      <Image
        src={refillSrc}
        alt=""
        width={size}
        height={size}
        sizes={`${size}px`}
        style={{ width: "100%", height: "auto", objectFit: "contain", objectPosition: "center" }}
      />
    );
  }
  const src = trioPreviewSrc(slug, image) || image || "/images/showcase.png";
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      sizes={`${size}px`}
      style={{ width: "100%", height: "auto", objectFit: "contain", objectPosition: "center" }}
    />
  );
}
