import { siteConfig, returnsPolicy } from "@/lib/config";
import { deviceOffering } from "@/lib/product";

export type FaqItem = {
  question: string;
  answer: string;
  href?: string;
  hrefLabel?: string;
};

export const faqItems: FaqItem[] = [
  {
    question: "What is Rouge Sur Mesure?",
    answer: "A custom lip color creator. Use the device with one supported cartridge trio and the official companion app.",
  },
  {
    question: "Are cartridges included?",
    answer: `${deviceOffering.includedText} ${deviceOffering.separateNote} The bundle is a separate product.`,
  },
  {
    question: "What comes with the device?",
    answer: `${deviceOffering.items.join(". ")}. ${deviceOffering.separateNote}`,
  },
  {
    question: "How many cartridges are included?",
    answer: deviceOffering.summary + ". You choose any 3 of the seven trios before the device is added to your bag.",
  },
  {
    question: "Is the app required?",
    answer: "Shade creation uses the official companion app. This website does not run the app's tools. Download steps and store links are on the App page.",
    href: "/app",
    hrefLabel: "Open the app guide",
  },
  {
    question: "Can I buy cartridges separately?",
    answer: "Yes. Additional cartridge trios are separate products. Color is still made only inside one supported trio at a time.",
  },
  {
    question: "Can I buy refills?",
    answer: "Yes. A refill restocks one cartridge. It does not create a new combination. All 12 are sold individually: Orange O1 O2 O3, Pink P1 P2 P3, Red R1 R2 R3, and Nude N1 N2 N3.",
  },
  {
    question: "Which combinations work?",
    answer: "Seven trios only: Red R1 R2 R3, Orange O1 O2 O3, Pink P1 P2 P3, Nude N1 N2 N3, Warm Red O1 R1 R2, Cool Nude N1 P1 N3, and Warm Nude N1 O1 N3.",
  },
  {
    question: "How do I insert cartridges?",
    answer: "The device instructions say to turn it on, remove the caps, and slide the base until the three cartridges click into their chambers. The app then recognizes them and starts priming. The trio instructions say to slide the bottom open, remove the caps, insert the cartridges, and that the app recognizes them and calibrates. Both are published.",
  },
  {
    question: "How many shades can it make?",
    answer: "Official pages do not use one number. The device description says thousands of custom shades. The refill description says 1,300 new shades with each family. The trio page lists 1,300+ colors as a keyword. This shop does not merge those figures.",
  },
  {
    question: "Which phones support the app?",
    answer: "The official device and bundle pages say iOS 13 or later on iPhone 6S or newer, and Android 8.0 or later, with Bluetooth 4.2.",
  },
  {
    question: "How do I restock?",
    answer: "The app can warn when formula is low. This shop sells all 12 cartridges individually: Orange O1 O2 O3, Pink P1 P2 P3, Red R1 R2 R3, and Nude N1 N2 N3. A spent cartridge is released by pressing the black button near the opening under the device. A refill restocks an existing trio. It does not create a new combination.",
  },
  {
    question: "How is shipping handled?",
    answer: siteConfig.shippingMessage,
  },
  {
    question: "What is the return policy?",
    answer: returnsPolicy,
  },
  {
    question: "Who sells this shop?",
    answer: `This shop is sold by ${siteConfig.sellerName}. Yves Saint Laurent Beauté identifies the product. This site does not state that it is an official store.`,
  },
  {
    question: "Is there a separate shipping charge?",
    answer: siteConfig.shippingMessage,
  },
  {
    question: "How do I return or replace a product?",
    answer: `${returnsPolicy} Start a request from your order, or write from the contact page.`,
    href: "/returns",
    hrefLabel: "Read the returns page",
  },
  {
    question: "Where is the user manual?",
    answer: "Setup, cartridge loading, the companion app, and application steps are on the user manual page.",
    href: "/manual",
    hrefLabel: "Open the user manual",
  },
  {
    question: "How do I download the companion app?",
    answer: "Shade creation uses the official companion app on a supported iPhone or Android phone. Download steps and store links are on the App page. This website does not run the app's tools.",
    href: "/app",
    hrefLabel: "Open the app guide",
  },
  {
    question: "Does adding a product to my bag charge me?",
    answer: "No. Adding a product to your bag does not charge you. Payment is completed at checkout when payment is available.",
  },
];

export const experienceSteps = [
  { index: "01", title: "Get your device", copy: "The latest lip technology powered by PERSO to dress your lips your way. Includes 3 complimentary cartridge sets — 9 cartridges total." },
  { index: "02", title: "Select your cartridge trio", copy: "Select a cartridge trio to dress your lips with a creamy velvet formula across red, nude, pink, or orange families." },
  { index: "03", title: "Download the app", copy: "Design and share your custom shades with our exclusive app features on iOS and Android." },
];

export const shadeMethods = [
  { index: "01", title: "Shade palette", copy: "Choose a custom color from the palette in the official app. The same pages also show a shade wheel." },
  { index: "02", title: "Shade match", copy: "The app can take a real-life color through the camera and print it with the device." },
  { index: "03", title: "YSL shade stylist", copy: "The app can scan an outfit and suggest complementary or clashing lip colors. No method behind that suggestion was published." },
  { index: "04", title: "Get The Look", copy: "Named as a fourth method. No further steps were published." },
];

export const whyPoints = [
  {
    title: "Personalized color",
    copy: "A beauty experience centered around your color preferences.",
  },
  {
    title: "Iconic design",
    copy: "A sculptural black-and-gold object designed for your vanity.",
  },
  {
    title: "Connected experience",
    copy: "Create your shades with the official companion app.",
  },
  {
    title: "Beauty-first",
    copy: "Created around the final lip look, not just the technology.",
  },
];
