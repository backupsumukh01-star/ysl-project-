import Image from "next/image";

export function RefPhoto({
  src,
  alt,
  priority = false,
  fit = "contain",
  ratio = "1 / 1",
  sizes = "(max-width: 768px) 100vw, 50vw",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  fit?: "contain" | "cover";
  ratio?: string;
  sizes?: string;
}) {
  return (
    <span className="ref-photo" style={{ aspectRatio: ratio }}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        unoptimized={src.endsWith(".svg")}
        style={{ objectFit: fit }}
      />
    </span>
  );
}
