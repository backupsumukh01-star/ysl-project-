import type { Metadata } from "next";
import Link from "next/link";
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
      <p>Sold by {settings.sellerName}. These are the only replacement and refund rules. The full agreement is on the <Link href="/terms">terms page</Link>.</p>
      <p>You can apply for a replacement or a refund only after the order has shipped, or 20 days after the order was placed.</p>

      <h2>No cancellation</h2>
      <p>After an order is placed, you cannot cancel it, and you cannot cancel one product from it.</p>

      <h2>A faulty product</h2>
      <p>
        If a product is faulty, apply for a replacement from your order, or write from the <Link href="/contact">contact page</Link> with
        the order number and what is wrong. The first remedy is a replacement, not a refund.
      </p>

      <h2>A second replacement</h2>
      <p>If the replacement is also faulty, or is otherwise not right, you can ask for a refund of that product.</p>

      <h2>Not shipped within 20 days</h2>
      <p>
        You can apply for a refund because an order has not shipped only after 20 days from the order date, and only if
        it still has not shipped. Before those 20 days, that refund is not available. After the order has shipped, this
        reason no longer applies.
      </p>

      <h2>Refund timing</h2>
      <p>
        A request is not itself a refund. After a refund is approved, it takes 7 to 15 days to reach the original
        payment method.
      </p>
    </main>
  );
}
