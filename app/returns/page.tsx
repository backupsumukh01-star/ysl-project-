import type { Metadata } from "next";
import { PageBack } from "@/components/page-back";
import { getSettings } from "@/lib/settings";
import "../quiet.css";

export const metadata: Metadata = { title: "Returns", alternates: { canonical: "/returns" } };

export default async function ReturnsPage() {
  const settings = await getSettings();

  return (
    <main id="main" className="page prose quiet-page">
      <PageBack href="/shop">All products</PageBack>
      <p className="kicker">Customer care</p>
      <h1>Returns</h1>
      <p>{settings.returnsMessage}</p>
      <p>Sold by {settings.sellerName}. Start a return or replacement from your order, or write from the contact page.</p>
    </main>
  );
}
