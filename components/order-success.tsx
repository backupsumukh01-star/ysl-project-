"use client";

import "../app/quiet.css";
import "../app/account/account.css";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api-client";
import { orderStatusLabel, paymentLabel } from "@/components/account-ui";
import { formatMoney } from "@/lib/product";
import { trackPurchase } from "@/lib/analytics/meta";

type OrderView = {
  id: string;
  number: string;
  name: string;
  paymentStatus: string;
  status: string;
  total: number | null;
  currency: string;
  items: { name: string; quantity: number }[];
  address: { line1: string; line2?: string; city: string; region: string; postcode: string; country: string } | null;
};

export function OrderSuccess({ id }: { id: string }) {
  const [order, setOrder] = useState<OrderView | null>(null);
  const [message, setMessage] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    api<{ order: OrderView }>(`/api/orders/${id}`)
      .then((result) => {
        setOrder(result.order);
        setStatus("ready");
      })
      .catch((error) => {
        setMessage(error instanceof ApiError ? error.message : "This confirmation could not be loaded.");
        setStatus("missing");
      });
    api<{ user: { email: string } | null }>("/api/auth/session")
      .then((result) => setSignedIn(Boolean(result.user)))
      .catch(() => setSignedIn(false));
  }, [id]);

  useEffect(() => {
    if (order?.paymentStatus !== "PAID") return;
    const storageKey = `rsm_purchase_${id}`;
    const sentKey = `rsm_purchase_sent_${id}`;
    const raw = sessionStorage.getItem(storageKey);
    if (!raw || sessionStorage.getItem(sentKey)) return;
    try {
      const purchase = JSON.parse(raw) as { eventId: string; currency?: string; value?: number; contentIds?: string[]; contents?: { id: string; quantity: number; item_price?: number }[]; numItems?: number; orderId?: string };
      if (!purchase.eventId) return;
      sessionStorage.setItem(sentKey, "1");
      trackPurchase(purchase);
    } catch {
      /* A bad local payload must not affect the confirmation. */
    }
  }, [id, order?.paymentStatus]);

  if (status === "loading") {
    return (
      <main id="main" className="page quiet-page">
        <p className="kicker">Order</p>
        <h1>Order</h1>
        <p>Loading your confirmation.</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main id="main" className="page quiet-page">
        <p className="kicker">404</p>
        <h1>This page is not in the collection.</h1>
        <p className="lede">{message || "The address may have changed. The shop is still here."}</p>
        <Link className="btn btn-gold" href="/shop">
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main id="main" className="page quiet-page order-confirm">
      <p className="kicker">{order.paymentStatus === "PAID" ? "Order confirmed" : "Order received"}</p>
      <h1>Thank you, {order.name}.</h1>
      <p className="lede">Order {order.number}. Payment: {paymentLabel(order.paymentStatus)}. Next step: {orderStatusLabel(order.status)}.</p>
      <ul className="order-lines">
        {order.items.map((item) => (
          <li key={item.name}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>
      <p className="order-amount">{formatMoney(order.total, order.currency)}</p>
      {order.address ? (
        <p>
          {order.address.line1}
          {order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.region} {order.address.postcode}
        </p>
      ) : null}
      <div className="actions">
        <Link className="btn btn-gold" href={`/account/orders/${order.id}`}>
          View order
        </Link>
        <Link className="btn btn-ghost" href="/shop">
          Continue shopping
        </Link>
        <Link className="btn btn-ghost" href={`/contact?order=${order.number}`}>
          Contact support
        </Link>
      </div>
      {!signedIn ? <p>This confirmation stays on this device. Create an account with the same email to see later orders.</p> : null}
      <p>
        <Link href={`/invoice/${order.id}`}>Download invoice</Link>
      </p>
    </main>
  );
}
