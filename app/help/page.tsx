import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import "../quiet.css";

export const metadata: Metadata = { title: "Help", alternates: { canonical: "/help" } };

const groups = [
  {
    label: "Product",
    sections: [
      ["How it works", "The published steps are get your device, select your cartridge trio, and download the app.", "/experience"],
      ["Cartridge compatibility", "Compatibility is shown only when a product relationship or compatibility note has been saved. Specifications are not invented.", "/shop?type=refill"],
      ["App", "Download the companion app, then pair the device and create a shade.", "/app"],
      ["User manual", "Setup, cartridge loading, the companion app, and how to apply.", "/manual"],
      ["Product care", "Care instructions are shown on a product only when they have been published.", "/faq"],
    ],
  },
  {
    label: "Orders",
    sections: [
      ["Ordering", "Add a product to the bag, then checkout. The amount is calculated on the server.", "/shop"],
      ["Payment", "Payment opens in Razorpay when it is configured. A declined or closed payment does not mark an order paid.", "/checkout"],
      ["Shipping", siteConfig.shippingMessage, "/shipping"],
      ["Tracking", "Look up an order with its number and the checkout email, or open it from your account.", "/track-order"],
      ["Returns", siteConfig.returnsMessage, "/returns"],
      ["Refunds", "A refund is recorded with the payment provider. It is not marked complete until that provider confirms it.", "/returns"],
    ],
  },
  {
    label: "Account",
    sections: [
      ["Account", "Sign in with Google, with an email and password, or with a one-time email code. Orders, addresses, and support stay on the account.", "/account"],
      ["Support", supportCopy(), "/contact"],
    ],
  },
];

function supportCopy() {
  const parts = [
    siteConfig.supportEmail ? `Write to ${siteConfig.supportEmail}.` : "Use the contact form. Replies are sent to the email you enter.",
    siteConfig.supportPhone ? `Call ${siteConfig.supportPhone}${siteConfig.supportHours ? `, ${siteConfig.supportHours}` : ""}.` : "",
    siteConfig.supportAddress ? siteConfig.supportAddress + "." : "",
  ].filter(Boolean);
  return parts.join(" ");
}

export default function HelpPage() {
  return (
    <main id="main" className="page quiet-page help-page">
      <h1>Help</h1>
      {groups.map((group) => (
        <section key={group.label} aria-labelledby={group.label.replace(/\s+/g, "-").toLowerCase()}>
          <h2 id={group.label.replace(/\s+/g, "-").toLowerCase()}>{group.label}</h2>
          {group.sections.map(([title, copy, href]) => (
            <article key={title}>
              <h3><Link href={href}>{title}</Link></h3>
              <p>{copy}</p>
            </article>
          ))}
        </section>
      ))}
    </main>
  );
}
