import fs from "fs";
import path from "path";
import { HomePage } from "@/components/home";
import { appDownloadLinks } from "@/lib/app-links";
import { approvedReviews, getProductBySlug } from "@/lib/catalog";
import { product } from "@/lib/product";
import { availableTrioImages } from "@/lib/trio-images.server";

function modelImages() {
  const sourceDir = path.join(process.cwd(), "img", "model");
  const destDir = path.join(process.cwd(), "public", "images", "model");
  if (fs.existsSync(sourceDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    for (const name of fs.readdirSync(sourceDir)) {
      if (!/\.(png|jpe?g|webp|avif)$/i.test(name)) continue;
      const from = path.join(sourceDir, name);
      const to = path.join(destDir, name);
      if (!fs.existsSync(to) || fs.statSync(from).mtimeMs > fs.statSync(to).mtimeMs) {
        fs.copyFileSync(from, to);
      }
    }
  }
  if (!fs.existsSync(destDir)) return [];
  return fs
    .readdirSync(destDir)
    .filter((name) => /\.(png|jpe?g|webp|avif)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, "en"))
    .map((name) => `/images/model/${name}`);
}

export const dynamic = "force-dynamic";

export default async function Page() {
  const device = await getProductBySlug("rouge-sur-mesure");
  const reviews = device ? await approvedReviews(device.id) : [];
  const appLinks = await appDownloadLinks();
  return (
    <HomePage
      reviews={reviews}
      trioImages={availableTrioImages()}
      modelImages={modelImages()}
      appLinks={appLinks}
      offer={
        device
          ? {
              id: device.id,
              slug: device.slug,
              name: device.name,
              price: device.price,
              compareAt: device.compareAt,
              sku: device.sku,
              image: product.images.showcase.src,
            }
          : null
      }
    />
  );
}
