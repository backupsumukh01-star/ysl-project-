import { fromMinor } from "@/lib/fx";
import { orderReceiptEmail, type OrderMailAddress } from "@/lib/email/templates";
import { formatMoney } from "@/lib/product";

type NoticeOrder = {
  number: string;
  createdAt: Date;
  name: string;
  currency: string;
  subtotalMinor: number;
  shippingMinor: number;
  taxMinor: number;
  discountMinor: number;
  totalMinor: number;
  paymentStatus: string;
  addressJson: string;
  courier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items: { name: string; variantName?: string; quantity: number; unitMinor: number }[];
};

export function receiptFromOrder(order: NoticeOrder, input: { title: string; note: string; includeTracking?: boolean }) {
  let address: OrderMailAddress | null = null;
  try {
    const parsed = JSON.parse(order.addressJson) as OrderMailAddress;
    if (parsed && typeof parsed === "object") address = parsed;
  } catch {
    address = null;
  }
  const money = (minor: number) => formatMoney(fromMinor(minor, order.currency), order.currency);
  return orderReceiptEmail({
    title: input.title,
    note: input.note,
    number: order.number,
    date: order.createdAt.toISOString().slice(0, 10),
    customerName: order.name,
    lines: order.items.map((item) => ({
      name: item.variantName ? `${item.name} — ${item.variantName}` : item.name,
      quantity: item.quantity,
      unit: money(item.unitMinor),
    })),
    subtotal: money(order.subtotalMinor),
    shipping: money(order.shippingMinor),
    tax: money(order.taxMinor),
    discount: money(order.discountMinor),
    total: money(order.totalMinor),
    currency: order.currency,
    paymentStatus: order.paymentStatus,
    address,
    tracking: input.includeTracking
      ? { courier: order.courier || "", number: order.trackingNumber || "", url: order.trackingUrl || "" }
      : undefined,
  });
}
