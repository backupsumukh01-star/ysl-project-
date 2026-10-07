import { notFound } from "next/navigation";
import Link from "next/link";
import { loadOwnedOrder } from "@/lib/order-access";
import { paymentWasCaptured } from "@/lib/order-paid";
import { publicOrder } from "@/lib/commerce";
import { formatMoney, shippingChargeLabel } from "@/lib/product";
import { siteConfig } from "@/lib/config";
import { InvoiceDownload } from "@/components/invoice-download";
import "../invoice.css";

export const dynamic = "force-dynamic";

const PAYMENT_LABELS: Record<string, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  PENDING_PAYMENT: "Awaiting payment",
  UNPAID: "Unpaid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partially refunded",
};

function paymentLabel(status: string) {
  return PAYMENT_LABELS[status] || status;
}

function invoiceDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export async function generateMetadata({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await loadOwnedOrder(orderId);
  const number = order?.number || "Invoice";
  return { title: `Invoice ${number}` };
}

export default async function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await loadOwnedOrder(orderId);
  if (!order || !paymentWasCaptured(order.paymentStatus)) notFound();
  const view = publicOrder(order);
  const address = view.address;

  return (
    <main id="main" className="page invoice-page">
      <div className="invoice-toolbar">
        <InvoiceDownload number={view.number} />
        <Link href={`/account/orders/${view.id}`}>Back to the order</Link>
      </div>
      <article className="invoice-sheet">
        <header className="invoice-sheet__head">
          <div>
            <p className="invoice-brand">Rouge Sur Mesure</p>
            <p className="invoice-kicker">Sold by {siteConfig.sellerName}</p>
          </div>
          <div>
            <p className="invoice-kicker">Invoice</p>
            <h1>{view.number}</h1>
            <p className="invoice-date">{invoiceDate(view.createdAt)}</p>
          </div>
        </header>

        <div className="invoice-parties">
          <section>
            <h2>Billed to</h2>
            <p>{view.name}</p>
            {address ? (
              <address className="invoice-address">
                {address.line1}
                {address.line2 ? <><br />{address.line2}</> : null}
                <br />
                {address.city}
                {address.region ? `, ${address.region}` : ""} {address.postcode}
                <br />
                {address.country}
              </address>
            ) : null}
            <p className="muted">
              {view.email}
              {view.phone ? ` · ${view.phone}` : ""}
            </p>
          </section>
          <dl className="invoice-meta">
            <div>
              <dt>Payment</dt>
              <dd>{paymentLabel(view.paymentStatus)}</dd>
            </div>
            {view.razorpayPaymentId ? (
              <div>
                <dt>Reference</dt>
                <dd>{view.razorpayPaymentId}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item</th>
              <th className="num">Qty</th>
              <th className="num">Price</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {view.items.map((item) => (
              <tr key={`${item.productId}-${item.variantId}`}>
                <td>
                  <span className="invoice-item">
                    <span>{item.name}</span>
                    <small>
                      {item.variantName}
                      {item.sku ? ` · ${item.sku}` : ""}
                    </small>
                  </span>
                </td>
                <td className="num">{item.quantity}</td>
                <td className="num">{formatMoney(item.unit, view.currency)}</td>
                <td className="num">{formatMoney(item.unit == null ? null : item.unit * item.quantity, view.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="invoice-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatMoney(view.subtotal, view.currency)}</dd>
          </div>
          {(view.discount ?? 0) > 0 ? (
            <div>
              <dt>Discount{view.couponCode ? ` · ${view.couponCode}` : ""}</dt>
              <dd>{formatMoney(view.discount, view.currency)}</dd>
            </div>
          ) : null}
          <div>
            <dt>Shipping</dt>
            <dd>{shippingChargeLabel(view.shipping, view.currency)}</dd>
          </div>
          <div>
            <dt>Tax</dt>
            <dd>{formatMoney(view.tax, view.currency)}</dd>
          </div>
          <div className="invoice-grand">
            <dt>Total</dt>
            <dd>{formatMoney(view.total, view.currency)}</dd>
          </div>
        </dl>

        <p className="invoice-note">
          Sold by {siteConfig.sellerName}. {siteConfig.shippingMessage} {siteConfig.returnsMessage}
        </p>
      </article>
    </main>
  );
}
