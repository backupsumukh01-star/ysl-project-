/** All 12 cartridges, grouped the way they are chosen. Existing refill names stay. The other shade names are the ones already used on the trio pages. */
export const cartridgeChoices = [
  { family: "Orange", code: "O1", shade: "Coral" },
  { family: "Orange", code: "O2", shade: "Medium Orange" },
  { family: "Orange", code: "O3", shade: "Deep Orange" },
  { family: "Pink", code: "P1", shade: "Rosy Pink" },
  { family: "Pink", code: "P2", shade: "Vivid Pink" },
  { family: "Pink", code: "P3", shade: "Plum" },
  { family: "Red", code: "R1", shade: "Scarlet" },
  { family: "Red", code: "R2", shade: "Cherry" },
  { family: "Red", code: "R3", shade: "Deep Red" },
  { family: "Nude", code: "N1", shade: "Warm Beige" },
  { family: "Nude", code: "N2", shade: "Medium Nude" },
  { family: "Nude", code: "N3", shade: "Deep Nude" },
] as const;

export const cartridgeFamilies = ["Orange", "Pink", "Red", "Nude"] as const;

export const soldCartridgeOrder = cartridgeChoices.map((choice) => choice.code);

export function cartridgeShade(value?: string) {
  const code = cartridgeCode(value);
  return cartridgeChoices.find((choice) => choice.code === code)?.shade || "";
}

export function cartridgeFamily(value?: string) {
  const code = cartridgeCode(value);
  return cartridgeChoices.find((choice) => choice.code === code)?.family || "";
}

export function cartridgeLabel(value?: string) {
  const code = cartridgeCode(value);
  const shade = cartridgeShade(code);
  return code && shade ? `${code} — ${shade}` : code;
}

/** Individual cartridge photographs. Files are named with the cartridge code. */
export const cartridgePhotos: Record<string, string> = {
  O1: "/images/cartridges/O1.png",
  O2: "/images/cartridges/O2.png",
  O3: "/images/cartridges/O3.png",
  P1: "/images/cartridges/P1.png",
  P2: "/images/cartridges/P2.png",
  P3: "/images/cartridges/P3.png",
  R1: "/images/cartridges/R1.png",
  R2: "/images/cartridges/R2.png",
  R3: "/images/cartridges/R3.png",
  N1: "/images/cartridges/N1.png",
  N2: "/images/cartridges/N2.png",
  N3: "/images/cartridges/N3.png",
};

/** Liquid colour sampled from the centre of each cartridge photograph. */
export const cartridgeColors: Record<string, string> = {
  O1: "#fe967b",
  O2: "#ee6341",
  O3: "#b5634c",
  P1: "#e91f69",
  P2: "#ea8193",
  P3: "#691f30",
  R1: "#d62727",
  R2: "#b74431",
  R3: "#68222b",
  N1: "#c17469",
  N2: "#c8736f",
  N3: "#90494e",
};

export function cartridgeCode(value?: string) {
  const match = (value || "").toUpperCase().match(/\b([ONPR][123])\b/);
  return match?.[1] || "";
}

export function cartridgePhotoSrc(value?: string) {
  return cartridgePhotos[cartridgeCode(value)] || "";
}

export function cartridgeColor(value?: string) {
  return cartridgeColors[cartridgeCode(value)] || "#8d6b56";
}
