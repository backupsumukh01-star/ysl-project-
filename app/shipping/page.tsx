import type { Metadata } from "next";
import { PageBack } from "@/components/page-back";
import { Money } from "@/components/market";
import { getSettings } from "@/lib/settings";
import "../quiet.css";

export const metadata: Metadata = { title: "Shipping", alternates: { canonical: "/shipping" } };

export default async function ShippingPage() {
  const settings = await getSettings();
  const published = settings.shippingEnabled && settings.shippingFlatMinor != null;
  const amount = published ? settings.shippingFlatMinor! / 100 : null;

  return (
    <main id="main" className="page prose quiet-page">
      <PageBack href="/shop">All products</PageBack>
      <p className="kicker">Customer care</p>
      <h1>Shipping</h1>
      <p>{settings.shippingMessage}</p>
      {amount == null ? (
        <p>A shipping price has not been published. Checkout stays closed until that price is set, and no delivery date is promised.</p>
      ) : amount === 0 ? null : (
        <p>Shipping is <Money usd={amount} />.</p>
      )}
      {settings.freeShippingThresholdMinor != null && published ? (
        <p>Orders at or above <Money usd={settings.freeShippingThresholdMinor / 100} /> have no shipping charge.</p>
      ) : null}
      {settings.shippingEstimate ? <p>{settings.shippingEstimate}</p> : null}
    </main>
  );
}
