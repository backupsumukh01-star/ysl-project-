"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatMoney, product } from "@/lib/product";
import type { StoredOrder } from "@/lib/orders";

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rsm-order");
      setOrder(raw ? (JSON.parse(raw) as StoredOrder) : null);
    } catch {
      setOrder(null);
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main id="main" className="page">
        <h1>Reading the request saved on this device.</h1>
      </main>
    );
  }

  if (!order) {
    return (
      <main id="main" className="page">
        <h1>No order is stored on this device.</h1>
        <Link className="btn btn-gold" href="/shop">
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main id="main" className="page">
      <p className="kicker">Request saved</p>
      <h1>Your order is confirmed.</h1>
      <p className="lede">
        This is a local request. Payment status: not collected. No card was charged and stock was not reserved.
      </p>
      <div className="buy-panel" id="order" style={{ maxWidth: 560 }}>
        <p>Order number</p>
        <h2>{order.id}</h2>
        <p>
          {product.name} × {order.quantity}
        </p>
        <p>Total {formatMoney(order.amount, order.currency)}</p>
        <p>Shipping {order.shipping == null ? "to be confirmed" : formatMoney(order.shipping, order.currency)}</p>
        <p>
          {order.contact.name}
          <br />
          {order.shippingAddress.address}
          <br />
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postcode}
          <br />
          {order.shippingAddress.country}
        </p>
      </div>
      <div className="actions">
        <Link className="btn btn-gold" href="/shop">
          Continue shopping
        </Link>
        <a className="btn btn-ghost" href="#order">
          View order
        </a>
      </div>
    </main>
  );
}
