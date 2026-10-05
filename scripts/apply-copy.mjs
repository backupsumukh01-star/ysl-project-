import { PrismaClient } from "@prisma/client";
import { faqs } from "../prisma/catalog-facts.mjs";

const prisma = new PrismaClient();
await prisma.product.update({
  where: { slug: "rouge-sur-mesure" },
  data: {
    description:
      "Rouge Sur Mesure is a custom lip color creator. The device, a supported cartridge trio, and the official companion app are used together. This purchase includes 3 complimentary cartridge sets — 9 cartridges total — and a retractable lip brush. Additional cartridge trios and refills are available separately.",
    shortDescription: "Custom lip color creator. Includes 3 complimentary cartridge sets — 9 cartridges total.",
    included:
      "Rouge Sur Mesure device. 3 complimentary cartridge sets. 9 cartridges total. Retractable lip brush. The names of those three sets are not listed until they are configured. Additional cartridge trios and refills are available separately.",
    seoDescription:
      "The Rouge Sur Mesure device includes 3 complimentary cartridge sets — 9 cartridges total — and a retractable lip brush. Additional trios and refills are separate products.",
  },
});
await prisma.product.update({
  where: { slug: "rouge-sur-mesure-bundle" },
  data: {
    description:
      "The bundle is the Rouge Sur Mesure lip color creator plus one cartridge trio of your choice. The official listing also labels the set as 4 products.",
  },
});
console.log("copy updated");
await prisma.productFaq.deleteMany({ where: { scope: "global" } });
await prisma.productFaq.createMany({ data: faqs.map((faq, index) => ({ ...faq, scope: "global", sortOrder: index })) });
console.log("faqs updated", faqs.length);
await prisma.$disconnect();
