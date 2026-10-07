"use client";

import { FormEvent, useState } from "react";
import { ApiError, api } from "@/lib/api-client";
import { paymentWasCaptured } from "@/lib/order-paid";
import "../quiet.css";
import "../account/account.css";

type Tracking = {
  number: string;
  status: string;
  paymentStatus: string;
  courier: string;
  trackingNumber: string;
  trackingUrl: string;
  shipmentId: string;
  deliveryEstimate: string;
  shippingMethod: string;
  steps: { status: string; reached: boolean }[];
};

export default function TrackOrderPage() {
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setMessage("");
    try {
      const result = await api<{ tracking: Tracking }>("/api/track", {
        method: "POST",
        body: JSON.stringify({ number: String(data.get("number") || ""), email: String(data.get("email") || "") }),
      });
      setTracking(result.tracking);
    } catch (error) {
      setTracking(null);
      setMessage(error instanceof ApiError ? error.message : "That order could not be found.");
    }
  }

  return (
    <main id="main" className="page quiet-page track-page">
      <p className="kicker">Orders</p>
      <h1>Track an order</h1>
      <p>Use the order number and the email from checkout. Another customer’s order is not shown.</p>
      <form className="stack-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Order number</span>
          <input name="number" required />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" required />
        </label>
        <button className="btn btn-gold" type="submit">Look up</button>
      </form>
      {message ? <p className="form-note is-err">{message}</p> : null}
      {tracking && !paymentWasCaptured(tracking.paymentStatus) ? (
        <article className="track-result">
          <p>Order {tracking.number}</p>
          <p>This order is not confirmed. Payment has not been completed.</p>
        </article>
      ) : null}
      {tracking && paymentWasCaptured(tracking.paymentStatus) ? (
        <article className="track-result">
          <p>Order {tracking.number}</p>
          <p>Status: {tracking.status}</p>
          <p>Payment: {tracking.paymentStatus}</p>
          <p>{tracking.courier || "Courier not added"} {tracking.trackingNumber}</p>
          {tracking.trackingUrl ? <p><a href={tracking.trackingUrl}>Open tracking</a></p> : null}
          <p>{tracking.deliveryEstimate || "No delivery estimate has been published."}</p>
          <ol className="order-steps">
            {tracking.steps.map((step) => (
              <li key={step.status} data-state={step.reached ? "done" : "waiting"}>{step.status}</li>
            ))}
          </ol>
        </article>
      ) : null}
    </main>
  );
}
