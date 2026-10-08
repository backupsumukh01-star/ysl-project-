"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ApiError, api } from "@/lib/api-client";
import { claimClosedMessage, replacementClaimOpen } from "@/lib/claim-window";

type Item = { productId: string; name: string; quantity: number };
type ClaimOrder = { status: string; paymentStatus: string; createdAt: string; items: Item[] };

export default function ReturnPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<ClaimOrder | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<{ order: ClaimOrder }>(`/api/orders/${params.id}`)
      .then((result) => setOrder(result.order))
      .catch((error) => setMessage(error instanceof ApiError ? error.message : "That order was not found."));
  }, [params.id]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const items = order?.items || [];
    const selected = items.filter((item) => data.get(`item-${item.productId}`));
    try {
      await api(`/api/orders/${params.id}/return`, {
        method: "POST",
        body: JSON.stringify({
          reason: String(data.get("reason") || ""),
          description: String(data.get("description") || ""),
          items: selected.map((item) => ({ productId: item.productId, quantity: Number(data.get(`qty-${item.productId}`) || 1) })),
        }),
      });
      setMessage("Request recorded. A replacement or refund is not made until it is reviewed.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "The return was not saved.");
    }
  }

  return (
    <>
      <h1>Request a replacement or refund</h1>
      <p className="lede">{claimClosedMessage} This form records the request. A replacement or refund is not made until it is reviewed.</p>
      {order && !replacementClaimOpen(order) ? <p className="notice">{claimClosedMessage}</p> : null}
      {order && replacementClaimOpen(order) ? <form className="stack-form" onSubmit={onSubmit}>
        {order.items.map((item) => (
          <label key={item.productId}>
            <input type="checkbox" name={`item-${item.productId}`} /> {item.name}
            <input name={`qty-${item.productId}`} type="number" min={1} max={item.quantity} defaultValue={1} />
          </label>
        ))}
        <label className="field">
          <span>Reason</span>
          <input name="reason" required />
        </label>
        <label className="field">
          <span>Details</span>
          <textarea name="description" />
        </label>
        <button className="btn btn-gold" type="submit">Submit request</button>
      </form> : null}
      {message ? <p className="notice">{message}</p> : null}
    </>
  );
}
