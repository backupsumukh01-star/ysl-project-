export const families = [
  { slug: "red", name: "Red", summary: "Scarlet, cherry, and deep burgundy tones.", sortOrder: 1 },
  { slug: "warm-red", name: "Warm Red", summary: "Brick reds and orange-leaning reds.", sortOrder: 2 },
  { slug: "nude", name: "Nude", summary: "A wide range of nude tones.", sortOrder: 3 },
  { slug: "warm-nude", name: "Warm Nude", summary: "Warmer beiges, pale corals, peach, and caramel.", sortOrder: 4 },
  { slug: "cool-nude", name: "Cool Nude", summary: "Pink-leaning beiges and rosewood tones.", sortOrder: 5 },
  { slug: "orange", name: "Orange", summary: "Pale coral, bright tangerine, and browner orange.", sortOrder: 6 },
  { slug: "pink", name: "Pink", summary: "Rosy pinks and vivid plums.", sortOrder: 7 },
];

export const cartridges = [
  { code: "R1", family: "red", name: "Scarlet", soldIndividually: true },
  { code: "R2", family: "red", name: "Cherry", soldIndividually: true },
  { code: "R3", family: "red", name: "Deep Red", soldIndividually: true },
  { code: "O1", family: "orange", name: "Coral", soldIndividually: true },
  { code: "O2", family: "orange", name: "Medium Orange", soldIndividually: true },
  { code: "O3", family: "orange", name: "Deep Orange", soldIndividually: true },
  { code: "P1", family: "pink", name: "Rosy Pink", soldIndividually: true },
  { code: "P2", family: "pink", name: "Vivid Pink", soldIndividually: true },
  { code: "P3", family: "pink", name: "Plum", soldIndividually: true },
  { code: "N1", family: "nude", name: "Warm Beige", soldIndividually: true },
  { code: "N2", family: "nude", name: "Medium Nude", soldIndividually: true },
  { code: "N3", family: "nude", name: "Deep Nude", soldIndividually: true },
];

export const trios = [
  { slug: "cartridge-trio-red", name: "Red", codes: "R1,R2,R3", family: "red" },
  { slug: "cartridge-trio-orange", name: "Orange", codes: "O1,O2,O3", family: "orange" },
  { slug: "cartridge-trio-pink", name: "Pink", codes: "P1,P2,P3", family: "pink" },
  { slug: "cartridge-trio-nude", name: "Nude", codes: "N1,N2,N3", family: "nude" },
  { slug: "cartridge-trio-warm-red", name: "Warm Red", codes: "O1,R1,R2", family: "warm-red" },
  { slug: "cartridge-trio-cool-nude", name: "Cool Nude", codes: "N1,P1,N3", family: "cool-nude" },
  { slug: "cartridge-trio-warm-nude", name: "Warm Nude", codes: "N1,O1,N3", family: "warm-nude" },
];

export const ingredients = {
  N1: "DIMETHICONE • BIS-DIGLYCERYL POLYACYLADIPATE-2 • DIISOSTEARYL MALATE • HYDROGENATED POLYISOBUTENE • DIMETHICONE/VINYL DIMETHICONE CROSSPOLYMER • PHENYL TRIMETHICONE • TALC • HDI/TRIMETHYLOL HEXYLLACTONE CROSSPOLYMER • DIMETHICONE CROSSPOLYMER • VINYL DIMETHICONE/METHICONE SILSESQUIOXANE CROSSPOLYMER • ISOSTEARYL ISOSTEARATE • MICA • POLYETHYLENE • CI 77891 / TITANIUM DIOXIDE • NYLON-12 • PENTYLENE GLYCOL • POLYMETHYLSILSESQUIOXANE • CI 77492 / IRON OXIDES • CI 77491 / IRON OXIDES • HYDROXYACETOPHENONE • CAPRYLYL GLYCOL • ETHYLHEXYLGLYCERIN • SILICA • CI 77499 / IRON OXIDES • PENTAERYTHRITYL TETRA-DI-T-BUTYL HYDROXYHYDROCINNAMATE • CI 15850 / RED 7 • ALUMINUM HYDROXIDE • ALUMINA • CI 15985 / YELLOW 6 LAKE • BENZYL ALCOHOL • TOCOPHEROL • ANISE ALCOHOL • PARFUM / FRAGRANCE",
  N2: "DIMETHICONE • BIS-DIGLYCERYL POLYACYLADIPATE-2 • DIISOSTEARYL MALATE • HYDROGENATED POLYISOBUTENE • DIMETHICONE/VINYL DIMETHICONE CROSSPOLYMER • PHENYL TRIMETHICONE • TALC • HDI/TRIMETHYLOL HEXYLLACTONE CROSSPOLYMER • CI 77891 / TITANIUM DIOXIDE • DIMETHICONE CROSSPOLYMER • VINYL DIMETHICONE/METHICONE SILSESQUIOXANE CROSSPOLYMER • ISOSTEARYL ISOSTEARATE • MICA • POLYETHYLENE • CI 77491, CI 77492, CI 77499 / IRON OXIDES • NYLON-12 • PENTYLENE GLYCOL • POLYMETHYLSILSESQUIOXANE • CAPRYLYL GLYCOL • ETHYLHEXYLGLYCERIN • CI 15850 / RED 7 • SILICA • ALUMINUM HYDROXIDE • PENTAERYTHRITYL TETRA-DI-T-BUTYL HYDROXYHYDROCINNAMATE • BENZYL ALCOHOL • TOCOPHEROL • ANISE ALCOHOL • PARFUM / FRAGRANCE",
  N3: "DIMETHICONE • BIS-DIGLYCERYL POLYACYLADIPATE-2 • DIISOSTEARYL MALATE • HYDROGENATED POLYISOBUTENE • DIMETHICONE/VINYL DIMETHICONE CROSSPOLYMER • PHENYL TRIMETHICONE • TALC • HDI/TRIMETHYLOL HEXYLLACTONE CROSSPOLYMER • DIMETHICONE CROSSPOLYMER • VINYL DIMETHICONE/METHICONE SILSESQUIOXANE CROSSPOLYMER • ISOSTEARYL ISOSTEARATE • CI 77491 / IRON OXIDES • MICA • POLYETHYLENE • CI 77891 / TITANIUM DIOXIDE • NYLON-12 • PENTYLENE GLYCOL • POLYMETHYLSILSESQUIOXANE • CI 77499 / IRON OXIDES • HYDROXYACETOPHENONE • CAPRYLYL GLYCOL • ETHYLHEXYLGLYCERIN • CI 45410 / RED 28 LAKE • CI 77492 / IRON OXIDES • SILICA • PENTAERYTHRITYL TETRA-DI-T-BUTYL HYDROXYHYDROCINNAMATE • ALUMINUM HYDROXIDE • BENZYL ALCOHOL • TOCOPHEROL • ANISE ALCOHOL • PARFUM / FRAGRANCE",
  O1: "DIMETHICONE • BIS-DIGLYCERYL POLYACYLADIPATE-2 • DIISOSTEARYL MALATE • HYDROGENATED POLYISOBUTENE • DIMETHICONE/VINYL DIMETHICONE CROSSPOLYMER • PHENYL TRIMETHICONE • TALC • HDI/TRIMETHYLOL HEXYLLACTONE CROSSPOLYMER • DIMETHICONE CROSSPOLYMER • VINYL DIMETHICONE/METHICONE SILSESQUIOXANE CROSSPOLYMER • ISOSTEARYL ISOSTEARATE • CI 77891 / TITANIUM DIOXIDE • MICA • POLYETHYLENE • NYLON-12 • ALUMINA • PENTYLENE GLYCOL • POLYMETHYLSILSESQUIOXANE • HYDROXYACETOPHENONE • CAPRYLYL GLYCOL • ETHYLHEXYLGLYCERIN • CI 45410 / RED 28 LAKE • CI 19140 / YELLOW 5 LAKE • SILICA • CI 15985 / YELLOW 6 LAKE • ALUMINUM HYDROXIDE • PENTAERYTHRITYL TETRA-DI-T-BUTYL HYDROXYHYDROCINNAMATE • BENZYL ALCOHOL • TOCOPHEROL • ANISE ALCOHOL • PARFUM / FRAGRANCE",
  O2: "DIMETHICONE • BIS-DIGLYCERYL POLYACYLADIPATE-2 • DIISOSTEARYL MALATE • HYDROGENATED POLYISOBUTENE • DIMETHICONE/VINYL DIMETHICONE CROSSPOLYMER • PHENYL TRIMETHICONE • TALC • HDI/TRIMETHYLOL HEXYLLACTONE CROSSPOLYMER • DIMETHICONE CROSSPOLYMER • VINYL DIMETHICONE/METHICONE SILSESQUIOXANE CROSSPOLYMER • ISOSTEARYL ISOSTEARATE • MICA • POLYETHYLENE • ALUMINA • NYLON-12 • CI 45410 / RED 28 LAKE • CI 15985 / YELLOW 6 LAKE • PENTYLENE GLYCOL • POLYMETHYLSILSESQUIOXANE • CI 77492 / IRON OXIDES • CI 77891 / TITANIUM DIOXIDE • HYDROXYACETOPHENONE • CAPRYLYL GLYCOL • ETHYLHEXYLGLYCERIN • CI 15850 / RED 7 • SILICA • CI 77499 / IRON OXIDES • PENTAERYTHRITYL TETRA-DI-T-BUTYL HYDROXYHYDROCINNAMATE • ALUMINUM HYDROXIDE • BENZYL ALCOHOL • TOCOPHEROL • ANISE ALCOHOL • PARFUM / FRAGRANCE",
  O3: "DIMETHICONE • BIS-DIGLYCERYL POLYACYLADIPATE-2 • DIISOSTEARYL MALATE • HYDROGENATED POLYISOBUTENE • DIMETHICONE/VINYL DIMETHICONE CROSSPOLYMER • PHENYL TRIMETHICONE • TALC • HDI/TRIMETHYLOL HEXYLLACTONE CROSSPOLYMER • CI 77491 / IRON OXIDES • DIMETHICONE CROSSPOLYMER • VINYL DIMETHICONE/METHICONE SILSESQUIOXANE CROSSPOLYMER • ISOSTEARYL ISOSTEARATE • MICA • POLYETHYLENE • NYLON-12 • PENTYLENE GLYCOL • POLYMETHYLSILSESQUIOXANE • ALUMINA • CI 77891 / TITANIUM DIOXIDE • CI 15985 / YELLOW 6 LAKE • HYDROXYACETOPHENONE • CAPRYLYL GLYCOL • ETHYLHEXYLGLYCERIN • CI 15850 / RED 7 • SILICA • PENTAERYTHRITYL TETRA-DI-T-BUTYL HYDROXYHYDROCINNAMATE • ALUMINUM HYDROXIDE • BENZYL ALCOHOL • TOCOPHEROL • ANISE ALCOHOL • PARFUM / FRAGRANCE",
  P1: "DIMETHICONE • BIS-DIGLYCERYL POLYACYLADIPATE-2 • DIISOSTEARYL MALATE • HYDROGENATED POLYISOBUTENE • DIMETHICONE/VINYL DIMETHICONE CROSSPOLYMER • PHENYL TRIMETHICONE • TALC • HDI/TRIMETHYLOL HEXYLLACTONE CROSSPOLYMER • MICA • DIMETHICONE CROSSPOLYMER • VINYL DIMETHICONE/METHICONE SILSESQUIOXANE CROSSPOLYMER • ISOSTEARYL ISOSTEARATE • CI 77891 / TITANIUM DIOXIDE • POLYETHYLENE • NYLON-12 • PENTYLENE GLYCOL • POLYMETHYLSILSESQUIOXANE • HYDROXYACETOPHENONE • CAPRYLYL GLYCOL • ETHYLHEXYLGLYCERIN • CI 77492 / IRON OXIDES • CI 15850 / RED 7 • CI 77491 / IRON OXIDES • SILICA • CI 45410 / RED 28 LAKE • PENTAERYTHRITYL TETRA-DI-T-BUTYL HYDROXYHYDROCINNAMATE • ALUMINUM HYDROXIDE • BENZYL ALCOHOL • TOCOPHEROL • ANISE ALCOHOL • PARFUM / FRAGRANCE",
  P2: "DIMETHICONE • BIS-DIGLYCERYL POLYACYLADIPATE-2 • DIISOSTEARYL MALATE • HYDROGENATED POLYISOBUTENE • DIMETHICONE/VINYL DIMETHICONE CROSSPOLYMER • PHENYL TRIMETHICONE • TALC • HDI/TRIMETHYLOL HEXYLLACTONE CROSSPOLYMER • DIMETHICONE CROSSPOLYMER • VINYL DIMETHICONE/METHICONE SILSESQUIOXANE CROSSPOLYMER • ISOSTEARYL ISOSTEARATE • CI 77891 / TITANIUM DIOXIDE • MICA • POLYETHYLENE • SYNTHETIC FLUORPHLOGOPITE • NYLON-12 • PENTYLENE GLYCOL • POLYMETHYLSILSESQUIOXANE • CI 45410 / RED 28 LAKE • HYDROXYACETOPHENONE • CAPRYLYL GLYCOL • ETHYLHEXYLGLYCERIN • CI 15850 / RED 7 LAKE • BARIUM SULFATE • COLOPHONIUM / ROSIN / COLOPHANE • SILICA • PENTAERYTHRITYL TETRA-DI-T-BUTYL HYDROXYHYDROCINNAMATE • ALUMINA • TIN OXIDE • CI 15985 / YELLOW 6 LAKE • ALUMINUM HYDROXIDE • BENZYL ALCOHOL • TOCOPHEROL • ANISE ALCOHOL • PARFUM / FRAGRANCE",
  P3: "DIMETHICONE • BIS-DIGLYCERYL POLYACYLADIPATE-2 • DIISOSTEARYL MALATE • HYDROGENATED POLYISOBUTENE • DIMETHICONE/VINYL DIMETHICONE CROSSPOLYMER • PHENYL TRIMETHICONE • TALC • HDI/TRIMETHYLOL HEXYLLACTONE CROSSPOLYMER • DIMETHICONE CROSSPOLYMER • VINYL DIMETHICONE/METHICONE SILSESQUIOXANE CROSSPOLYMER • ISOSTEARYL ISOSTEARATE • CI 45410 / RED 28 LAKE • MICA • POLYETHYLENE • CI 17200 / RED 33 LAKE • NYLON-12 • PENTYLENE GLYCOL • POLYMETHYLSILSESQUIOXANE • CAPRYLYL GLYCOL • ETHYLHEXYLGLYCERIN • SILICA • ALUMINA • PENTAERYTHRITYL TETRA-DI-T-BUTYL HYDROXYHYDROCINNAMATE • CI 15985 / YELLOW 6 LAKE • BENZYL ALCOHOL • TOCOPHEROL • ANISE ALCOHOL • PARFUM / FRAGRANCE",
  R1: "DIMETHICONE • BIS-DIGLYCERYL POLYACYLADIPATE-2 • DIISOSTEARYL MALATE • HYDROGENATED POLYISOBUTENE • DIMETHICONE/VINYL DIMETHICONE CROSSPOLYMER • PHENYL TRIMETHICONE • TALC • HDI/TRIMETHYLOL HEXYLLACTONE CROSSPOLYMER • DIMETHICONE CROSSPOLYMER • VINYL DIMETHICONE/METHICONE SILSESQUIOXANE CROSSPOLYMER • ISOSTEARYL ISOSTEARATE • CI 45410 / RED 28 LAKE • MICA • POLYETHYLENE • ALUMINA • NYLON-12 • CI 15985 / YELLOW 6 LAKE • PENTYLENE GLYCOL • POLYMETHYLSILSESQUIOXANE • CAPRYLYL GLYCOL • ETHYLHEXYLGLYCERIN • CI 15850 / RED 7 • SILICA • PENTAERYTHRITYL TETRA-DI-T-BUTYL HYDROXYHYDROCINNAMATE • BENZYL ALCOHOL • TOCOPHEROL • ANISE ALCOHOL • PARFUM / FRAGRANCE",
  R2: "DIMETHICONE • BIS-DIGLYCERYL POLYACYLADIPATE-2 • DIISOSTEARYL MALATE • HYDROGENATED POLYISOBUTENE • DIMETHICONE/VINYL DIMETHICONE CROSSPOLYMER • PHENYL TRIMETHICONE • TALC • HDI/TRIMETHYLOL HEXYLLACTONE CROSSPOLYMER • CI 77491, CI 77492, CI 77499 / IRON OXIDES • DIMETHICONE CROSSPOLYMER • VINYL DIMETHICONE/METHICONE SILSESQUIOXANE CROSSPOLYMER • ISOSTEARYL ISOSTEARATE • MICA • POLYETHYLENE • NYLON-12 • PENTYLENE GLYCOL • POLYMETHYLSILSESQUIOXANE • CI 15850 / RED 7 • CAPRYLYL GLYCOL • ETHYLHEXYLGLYCERIN • SILICA • PENTAERYTHRITYL TETRA-DI-T-BUTYL HYDROXYHYDROCINNAMATE • BENZYL ALCOHOL • TOCOPHEROL • ANISE ALCOHOL • PARFUM / FRAGRANCE",
  R3: "DIMETHICONE • BIS-DIGLYCERYL POLYACYLADIPATE-2 • DIISOSTEARYL MALATE • HYDROGENATED POLYISOBUTENE • DIMETHICONE/VINYL DIMETHICONE CROSSPOLYMER • PHENYL TRIMETHICONE • TALC • HDI/TRIMETHYLOL HEXYLLACTONE CROSSPOLYMER • DIMETHICONE CROSSPOLYMER • VINYL DIMETHICONE/METHICONE SILSESQUIOXANE CROSSPOLYMER • ISOSTEARYL ISOSTEARATE • CI 15850 / RED 7 • MICA • POLYETHYLENE • CI 45410 / RED 28 LAKE • NYLON-12 • PENTYLENE GLYCOL • POLYMETHYLSILSESQUIOXANE • CAPRYLYL GLYCOL • ETHYLHEXYLGLYCERIN • CI 77499 / IRON OXIDES • CI 77891 / TITANIUM DIOXIDE • SILICA • PENTAERYTHRITYL TETRA-DI-T-BUTYL HYDROXYHYDROCINNAMATE • BENZYL ALCOHOL • ALUMINUM HYDROXIDE • TOCOPHEROL • ANISE ALCOHOL • PARFUM / FRAGRANCE",
};

export const refillVariants = [
  { code: "O1", name: "O1 — Coral" },
  { code: "O2", name: "O2 — Medium Orange" },
  { code: "O3", name: "O3 — Deep Orange" },
  { code: "P1", name: "P1 — Rosy Pink" },
  { code: "P2", name: "P2 — Vivid Pink" },
  { code: "P3", name: "P3 — Plum" },
  { code: "R1", name: "R1 — Scarlet" },
  { code: "R2", name: "R2 — Cherry" },
  { code: "R3", name: "R3 — Deep Red" },
  { code: "N1", name: "N1 — Warm Beige" },
  { code: "N2", name: "N2 — Medium Nude" },
  { code: "N3", name: "N3 — Deep Nude" },
];

export const appRequirement = {
  ios: "iOS 13 or later on iPhone 6S or newer.",
  android: "Android 8.0 or later.",
  bluetooth: "Bluetooth 4.2.",
  methods:
    "Device, bundle, and refill descriptions name four app methods: shade palette, shade match, YSL shade stylist, and Get The Look. The same pages also show a shade wheel. Get The Look is only named. No steps for it were published. This website does not run any of those tools.",
  note: "App store links stay empty until a real URL is saved in admin. Shade counts differ by official page: the device description says thousands of custom shades, the refill description says 1,300 new shades with each family, and the trio page lists 1,300+ colors as a keyword. Those figures are not combined here.",
};

export const faqs = [
  {
    question: "What is Rouge Sur Mesure?",
    answer:
      "It is a custom lip color creator. The device, a supported cartridge trio, and the official companion app are used together. This purchase includes 3 complimentary cartridge sets — 9 cartridges total — and a retractable lip brush. Additional cartridge trios and refills are available separately.",
  },
  {
    question: "Are cartridges included with the device?",
    answer:
      "Yes. This purchase includes the Rouge Sur Mesure device, 3 complimentary cartridge sets — 9 cartridges total — and a retractable lip brush. The names of those three sets are not listed until they are configured. This does not include every cartridge family. Additional cartridge trios, refills, and the bundle are separate products.",
  },
  {
    question: "What comes with the device?",
    answer:
      "The Rouge Sur Mesure device, 3 complimentary cartridge sets, 9 cartridges total, and a retractable lip brush. The names of those three sets are not listed until they are configured. Additional cartridge trios and refills are available separately.",
  },
  {
    question: "How many cartridges are included?",
    answer: "Includes 3 complimentary cartridge sets — 9 cartridges total. The three included families are not named until they are configured.",
  },
  {
    question: "How do cartridges work?",
    answer:
      "Color is made only inside one supported trio at a time. The device instructions say to turn it on, remove the caps, and slide the base until the three cartridges click into their chambers. The app then recognizes them and starts priming.",
  },
  {
    question: "Is the app required?",
    answer: "Shade creation uses the official companion app. This website does not run the app's tools. The App Store and Google Play links are on the user manual and on the device page.",
  },
  {
    question: "Can I buy cartridges separately?",
    answer: "Yes. Additional cartridge trios are separate products. Color is still made only inside one supported trio at a time.",
  },
  {
    question: "Can I buy refills?",
    answer:
      "Yes. A refill restocks a cartridge you already use. It does not create a new combination. Sold individually: O2, O3, R3, N2, and N3.",
  },
  {
    question: "Which cartridge combinations are supported?",
    answer:
      "Only seven trios: Red R1 R2 R3, Orange O1 O2 O3, Pink P1 P2 P3, Nude N1 N2 N3, Warm Red O1 R1 R2, Cool Nude N1 P1 N3, and Warm Nude N1 O1 N3. The official pages say cartridges cannot be blended outside these trios.",
  },
  {
    question: "Can I buy any three cartridges and combine them?",
    answer:
      "No. Individual refills are for restocking an existing setup. The official refill page says a single cartridge should not be purchased unless you are refilling an existing shade.",
  },
  {
    question: "Which phones does the official app support?",
    answer: "The device and bundle pages say iOS 13 or later on iPhone 6S or newer, and Android 8.0 or later, with Bluetooth 4.2.",
  },
  {
    question: "How is a shade created?",
    answer:
      "In the official app, published methods are a shade palette, shade match from the camera, and a shade stylist that scans an outfit for complementary or clashing lip colors. Get The Look is named with no further steps. A shade wheel is also described on the same pages. This website does not run those tools.",
  },
  {
    question: "How many shades can it make?",
    answer:
      "Official pages do not use one number. The device description says thousands of custom shades. The refill description says 1,300 new shades with each family. The trio page lists 1,300+ colors as a keyword. This shop does not merge those figures.",
  },
  {
    question: "How do I apply it?",
    answer:
      "After the shade is dispensed, the official instructions say to mix the formula with the included retractable lip brush, line the lips with the brush tip, then glide the brush across the lips.",
  },
  {
    question: "How do I replace a cartridge?",
    answer:
      "The official refill instructions say the app can notify you when formula is low, and that a single cartridge is released by pressing the black button near the opening underneath the device.",
  },
  {
    question: "Who sells this shop?",
    answer:
      "This shop is sold by Rouge Beauty. Yves Saint Laurent Beauté identifies the product. This site does not state that it is an official store.",
  },
  {
    question: "Is there a separate shipping charge?",
    answer: "Shipping is included in the product price. There is no separate shipping charge.",
  },
  {
    question: "How do I return or replace a product?",
    answer:
      "You can return or replace a product within 10 days of delivery. Start a return or replacement from your order, or write from the contact page.",
  },
  {
    question: "Where is the user manual?",
    answer: "Setup, cartridge loading, the companion app, and application steps are on the user manual page.",
  },
  {
    question: "How do I download the companion app?",
    answer:
      "Shade creation uses the official companion app on a supported iPhone or Android phone. The store badges are on the user manual and on the device page. This website does not run the app's tools.",
  },
  {
    question: "Does adding a product to my bag charge me?",
    answer: "No. Adding a product to your bag does not charge you. Payment is completed at checkout when payment is available.",
  },
];
