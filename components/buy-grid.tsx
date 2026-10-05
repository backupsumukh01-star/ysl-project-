import { listProducts, type CatalogProduct } from "@/lib/catalog";
import { PrimaryShelf, type ShelfCard, type ShelfSwatch } from "@/components/primary-shelf";
import { trioDots, trioLook, trioPreviewSrc, type TrioFamilyName } from "@/lib/trio-images";
import { availableTrioImages } from "@/lib/trio-images.server";
import { cartridgeCode, cartridgeColor, cartridgeFamily, cartridgeLabel, cartridgePhotoSrc, cartridgeShade, soldCartridgeOrder } from "@/lib/cartridge-photos";

const families = ["Red", "Pink", "Orange", "Nude", "Warm Red", "Warm Nude", "Cool Nude"] as const;

const trioOrder = [
  "cartridge-trio-red",
  "cartridge-trio-pink",
  "cartridge-trio-orange",
  "cartridge-trio-nude",
  "cartridge-trio-warm-red",
  "cartridge-trio-warm-nude",
  "cartridge-trio-cool-nude",
];

function familyFromName(name: string): TrioFamilyName | undefined {
  return families.find((family) => name === family || name.startsWith(`${family} `) || name.startsWith(`${family}—`) || name.startsWith(`${family} -`));
}

function cartOf(product: CatalogProduct, extra?: Partial<ShelfSwatch["cart"]> & { image?: string }): ShelfSwatch["cart"] {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    sku: extra?.sku || product.sku,
    variantId: extra?.variantId,
    variantName: extra?.variantName,
    image: extra?.image,
  };
}

export async function BuyGrid({ title }: { title?: string }) {
  const products = await listProducts();
  const photos = availableTrioImages();
  const byType = (type: string) => products.find((product) => product.type === type && product.price != null);
  const device = byType("DEVICE");
  const refill = byType("REFILL");
  const trios = products
    .filter((product) => product.type === "CARTRIDGE_TRIO" && product.price != null)
    .sort((a, b) => trioOrder.indexOf(a.slug) - trioOrder.indexOf(b.slug));

  const cards: ShelfCard[] = [];

  if (device) {
    const image = device.images.find((item) => item.src && !item.src.endsWith("/swatches.png"))?.src || "";
    cards.push({
      key: "device",
      title: "Device",
      price: device.price,
      start: 0,
      lead: true,
      cta: { href: "/product/rouge-sur-mesure#trios", label: "Choose 3 trios" },
      swatches: [{
        id: device.id,
        label: "3 sets · 9 cartridges · brush",
        colors: [],
        href: `/product/${device.slug}`,
        image,
        cart: cartOf(device, { image }),
      }],
    });
  }

  if (trios.length) {
    const swatches: ShelfSwatch[] = trios.flatMap((product) => {
      const family = familyFromName(product.name.replace(/^Cartridge Trio — /, ""));
      if (!family) return [];
      return [{
        id: product.id,
        name: family,
        label: trioLook[family],
        colors: [...trioDots[family]],
        href: `/product/${product.slug}`,
        image: trioPreviewSrc(product.slug, photos[family]) || "",
        cart: cartOf(product, { image: photos[family] }),
      }];
    });
    const start = Math.max(0, swatches.findIndex((swatch) => swatch.href.endsWith("/cartridge-trio-red")));
    if (swatches.length) cards.push({ key: "trio", title: "Cartridge trio", group: "Color options", price: trios[0].price, start, swatches });
  }

  if (refill) {
    const swatches: ShelfSwatch[] = refill.variants.flatMap((variant) => {
      const code = cartridgeCode(variant.name) || cartridgeCode(variant.sku);
      if (!code) return [];
      const image = cartridgePhotoSrc(code);
      const name = cartridgeLabel(code) || variant.name;
      return [{
        id: variant.id,
        label: name,
        code,
        shade: cartridgeShade(code),
        family: cartridgeFamily(code),
        colors: [cartridgeColor(code)],
        href: `/product/${refill.slug}?cartridge=${code}`,
        image,
        cart: cartOf(refill, { sku: variant.sku, variantId: variant.id, variantName: name, image }),
      }];
    }).sort((a, b) => soldCartridgeOrder.indexOf(a.code as (typeof soldCartridgeOrder)[number]) - soldCartridgeOrder.indexOf(b.code as (typeof soldCartridgeOrder)[number]));
    const start = Math.max(0, swatches.findIndex((swatch) => swatch.label.startsWith("R3")));
    if (swatches.length) cards.push({ key: "refill", title: "Cartridge refill", group: "Single refill", price: refill.price, start, swatches });
  }

  return (
    <section className="buy-grid-wrap" aria-label={title ?? "All products"}>
      {title ? <h2 className="buy-grid__title">{title}</h2> : null}
      <PrimaryShelf cards={cards} />
    </section>
  );
}
