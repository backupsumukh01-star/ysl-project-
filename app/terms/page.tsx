import type { Metadata } from "next";
import { PageBack } from "@/components/page-back";
import { getSettings } from "@/lib/settings";
import "../quiet.css";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms" } };

export default async function TermsPage() {
  const settings = await getSettings();
  return (
    <main id="main" className="page prose quiet-page">
      <PageBack href="/shop">All products</PageBack>
      <p className="kicker">Legal</p>
      <h1>Terms</h1>
      <p>
        These terms describe how this shop currently takes an order. This shop is sold by {settings.sellerName}. A street
        address and governing law have not been published.
      </p>
      <h2>An order</h2>
      <p>
        Prices, shipping, and tax are calculated on the server from the catalog and the published settings. The amount
        shown in your browser is not the amount that is charged. Checkout opens only when a shipping price has been
        published and card payment is configured.
      </p>
      <p>
        Submitting checkout creates an unpaid order and opens Razorpay for that server total. The order is marked paid
        only after the server verifies the payment with Razorpay. Closing the payment window, or a failed payment, does
        not mark the order paid and does not send a paid-order confirmation.
      </p>
      <h2>What is included</h2>
      <p>
        The device order records the three cartridge families chosen before it is added to the bag. A bundle records the
        cartridge trio selected on that product. A refill records the cartridge option selected. Stock is limited only
        for a product that has inventory tracking turned on.
      </p>
      <h2>Trademarks</h2>
      <p>Yves Saint Laurent and related trademarks are the property of their respective owner. This site does not state that it is an official store.</p>
    </main>
  );
}
