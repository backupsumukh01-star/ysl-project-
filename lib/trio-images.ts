/** Expected cartridge-trio photographs. Drop the file into public/images to use it. */
export const trioImageFiles = {
  Red: "red-trio.png",
  Pink: "pink-trio.png",
  Orange: "orange-trio.png",
  Nude: "nude-trio.png",
  "Warm Red": "warm-red-trio.png",
  "Warm Nude": "warm-nude-trio.png",
  "Cool Nude": "cool-nude-trio.png",
} as const;

export type TrioFamilyName = keyof typeof trioImageFiles;

/** Left-to-right cartridge colours sampled from each trio photograph. */
export const trioDots: Record<TrioFamilyName, [string, string, string]> = {
  Red: ["#dd281d", "#b33423", "#67010a"],
  Pink: ["#d57180", "#b32347", "#5f2834"],
  Orange: ["#f46347", "#cf2905", "#8b2515"],
  Nude: ["#a85140", "#ac3f43", "#673035"],
  "Warm Red": ["#ed6f55", "#bf1e19", "#921904"],
  "Warm Nude": ["#b85443", "#fc7760", "#6e343b"],
  "Cool Nude": ["#a65046", "#d16d86", "#6d2131"],
};

/** Editorial captions for the three cartridges in each approved photograph. */
export const trioLook: Record<TrioFamilyName, string> = {
  Red: "Scarlet · Cherry · Deep Red",
  Pink: "Rosy Pink · Vivid Pink · Plum",
  Orange: "Coral · Red-Orange · Browner Orange",
  Nude: "Warm Beige · Dusty Rose · Deep Nude",
  "Warm Red": "Coral-Orange · Red · Brick",
  "Warm Nude": "Coral · Pale Peach · Deep Nude",
  "Cool Nude": "Nude · Pink · Rosewood",
};

/** Exactly three known families, duplicates allowed. Anything else is rejected. */
export function deviceFamilySelection(value: string | undefined): string | null {
  const parts = (value || "")
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length !== 3) return null;
  const allowed = new Set<string>(Object.keys(trioImageFiles));
  if (!parts.every((part) => allowed.has(part))) return null;
  return parts.join(" · ");
}

export function trioPhotoSrc(family: TrioFamilyName): string {
  return `/images/${trioImageFiles[family]}`;
}

export function trioFamilyFromSlug(slug: string): TrioFamilyName | undefined {
  return (Object.keys(trioImageFiles) as TrioFamilyName[]).find(
    (name) => slug === `cartridge-trio-${name.toLowerCase().replaceAll(" ", "-")}`,
  );
}

export function trioPreviewSrc(slug: string, fallback?: string): string | undefined {
  const family = trioFamilyFromSlug(slug);
  return family ? trioPhotoSrc(family) : fallback;
}
