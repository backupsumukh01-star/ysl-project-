import type { Metadata } from "next";
import { PageBack } from "@/components/page-back";
import "../quiet.css";

export const metadata: Metadata = { title: "Risk disclosure", alternates: { canonical: "/risk-disclosure" } };

export default function RiskPage() {
  return (
    <main id="main" className="page prose quiet-page">
      <PageBack href="/shop">All products</PageBack>
      <p className="kicker">Legal</p>
      <h1>Risk disclosure</h1>
      <p>This notice describes the limits of what this shop states. It is not legal advice and it does not describe a regulated financial product.</p>
      <p>
        Color results in photographs are illustrative. A published ingredient list is shown by cartridge code where this
        shop has that list. Suitability, allergens beyond that list, and a delivery date are not promised.
      </p>
      <p>
        A completed sale is an order whose payment Razorpay has captured and this server has verified. Until that
        verification, the order stays unpaid. Cancellation, replacement, and refund rules are on the terms page.
      </p>
    </main>
  );
}
