import { publishedPrices } from "@/lib/pricing";
import { deviceOffering, shadeNotes } from "@/lib/product";
import { faqItems, experienceSteps, shadeMethods } from "@/lib/content";

export const referencePrices = publishedPrices;

export type FamilyGroup = "ALL" | "NEUTRAL" | "RED" | "PINK";

export const familyGroups: { id: FamilyGroup; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "NEUTRAL", label: "Neutral & mauve" },
  { id: "RED", label: "Red & coral" },
  { id: "PINK", label: "Pinks & plum" },
];

const groupOf: Record<string, FamilyGroup> = {
  Nude: "NEUTRAL",
  "Cool Nude": "NEUTRAL",
  "Warm Nude": "NEUTRAL",
  Red: "RED",
  Orange: "RED",
  "Warm Red": "RED",
  Pink: "PINK",
};

export const colorFamilies = shadeNotes.map((family) => ({
  ...family,
  group: groupOf[family.name] || "ALL",
  href: family.href.replace("/product/", "/reference/product/"),
  swatch:
    family.name === "Red"
      ? "#8d2b32"
      : family.name === "Nude"
        ? "#c4a48a"
        : family.name === "Orange"
          ? "#d4653a"
          : family.name === "Pink"
            ? "#c45b8a"
            : family.name === "Warm Red"
              ? "#a33b2b"
              : family.name === "Warm Nude"
                ? "#c9846a"
                : "#b76e86",
}));

export const referenceFaqs = faqItems;
export const referenceSteps = experienceSteps;
export const referenceMethods = shadeMethods;

export const referenceFacts = [
  {
    title: "Description",
    body: deviceOffering.includedText,
  },
  {
    title: "Keywords",
    body: "Custom lip color creator. PERSO. Liquid velvet. Removable cartridges. Shade palette, shade match, YSL shade stylist, and Get The Look.",
  },
  {
    title: "Type",
    body: "A device that dispenses a custom liquid lipstick. Color is made only inside one of the seven supported cartridge trios.",
  },
  {
    title: "What it is",
    body: "A personalized lip color creator. The device, a supported trio, and the official app are separate parts of the same experience.",
  },
  {
    title: "What it does",
    body: "It dispenses a custom shade from the cartridges you insert. Published pages describe a creamy velvet liquid lipstick with a liquid velvet finish.",
  },
  {
    title: "Benefits",
    body: "You choose a shade in the official app, then carry that color with the device. Cartridges are removable inside a supported trio.",
  },
  {
    title: "App compatibility",
    body: "iOS 13 or later on iPhone 6S or newer. Android 8.0 or later. Bluetooth 4.2.",
  },
  {
    title: "How to apply",
    body: "Turn the device on, remove the caps, and slide the base until the three cartridges click into place. The app recognizes them and starts priming. After the formula is dispensed, mix it with the included retractable lip brush.",
  },
  {
    title: "Ingredients",
    body: "Ingredient lists are published by cartridge code. This reference does not add an ingredient list of its own.",
  },
];
