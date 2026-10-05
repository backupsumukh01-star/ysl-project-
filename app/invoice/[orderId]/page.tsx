import { notFound } from "next/navigation";
import { loadOwnedOrder } from "@/lib/order-access";
import { publicOrder } from "@/lib/commerce";
import { formatMoney } from "@/lib/product";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await loadOwnedOrder(orderId);
  if (!order) notFound();
  const view = publicOrder(order);
  return (
    <main id="main" className="page invoice">
      <p className="kicker">Invoice</p>
      <h1>{view.number}</h1>
      <p>{new Date(view.createdAt).toLocaleString()}</p>
      <p>
        {view.name} · {view.email}
      </p>
      {view.address ? (
        <p>
          {view.address.line1}
          {view.address.line2 ? `, ${view.address.line2}` : ""}, {view.address.city}, {view.address.region} {view.address.postcode}, {view.address.country}
        </p>
      ) : null}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>SKU</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {view.items.map((item) => (
            <tr key={`${item.productId}-${item.sku}`}>
              <td>
                {item.name} {item.variantName}
              </td>
              <td>{item.sku}</td>
              <td>{item.quantity}</td>
              <td>{formatMoney(item.unit, view.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Subtotal {formatMoney(view.subtotal, view.currency)}</p>
      <p>Discount {formatMoney(view.discount, view.currency)}</p>
      <p>Tax {formatMoney(view.tax, view.currency)}</p>
      <p>Shipping {formatMoney(view.shipping, view.currency)}</p>
      <p>Total {formatMoney(view.total, view.currency)}</p>
      <p>Payment {view.paymentStatus}</p>
      {view.razorpayPaymentId ? <p>Reference {view.razorpayPaymentId}</p> : null}
      <p className="muted">This page is ready to print. A PDF file is not generated.</p>
      <Link href={`/account/orders/${view.id}`}>Back to the order</Link>
    </main>
  );
}
