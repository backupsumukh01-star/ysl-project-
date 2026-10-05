import { product } from "@/lib/product";

export type DemoVideo = {
  id: string;
  title: string;
  description: string;
  src: string;
  poster: string;
  posterAlt: string;
};

/**
 * Drop matching files in public/videos/ and they will play.
 * Leave src pointed at the intended file. If the file is missing,
 * the card stays on its poster.
 */
export const demoVideos: DemoVideo[] = [
  {
    id: "intro",
    title: "01 Device",
    description: "A first look at the custom lip color creator.",
    src: "/videos/rouge-sur-mesure-intro.mp4",
    poster: product.images.hero.src,
    posterAlt: product.images.hero.alt,
  },
  {
    id: "how-it-works",
    title: "02 Cartridge setup",
    description: "The device is used with one supported cartridge trio.",
    src: "/videos/how-it-works.mp4",
    poster: product.images.showcase.src,
    posterAlt: product.images.showcase.alt,
  },
  {
    id: "color",
    title: "03 App",
    description: "Shade creation happens in the official companion app.",
    src: "/videos/color-experience.mp4",
    poster: product.images.swatches.src,
    posterAlt: product.images.swatches.alt,
  },
  {
    id: "result",
    title: "04 Shade creation",
    description: "Palette, match, stylist, and Get The Look are named in the official app.",
    src: "/videos/beauty-result.mp4",
    poster: product.images.lip.src,
    posterAlt: product.images.lip.alt,
  },
  {
    id: "unboxing",
    title: "05 Application",
    description: "Mix the dispensed formula with the included retractable lip brush.",
    src: "/videos/unboxing.mp4",
    poster: product.images.packaging.src,
    posterAlt: product.images.packaging.alt,
  },
];
