"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ApiError, api } from "@/lib/api-client";
import { siteConfig } from "@/lib/config";

type Item = { productId: string; name: string; quantity: number };

export default function ReturnPage() {
  const params = useParams<{ id: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<{ order: { items: Item[] } }>(`/api/orders/${params.id}`)
      .then((result) => setItems(result.order.items))
      .catch((error) => setMessage(error instanceof ApiError ? error.message : "That order was not found."));
  }, [params.id]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
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
      setMessage("Return requested. It is not a refund until it is reviewed.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "The return was not saved.");
    }
  }

  return (
    <>
      <h1>Request a return</h1>
      <p className="lede">{siteConfig.returnsMessage} This form records the request. A refund is not issued until it is reviewed.</p>
      <form className="stack-form" onSubmit={onSubmit}>
        {items.map((item) => (
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
      </form>
      {message ? <p className="notice">{message}</p> : null}
    </>
  );
}
