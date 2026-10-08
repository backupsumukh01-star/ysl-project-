import { paymentWasCaptured } from "@/lib/order-paid";

const SHIPPED = new Set([
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED_DELIVERY",
  "RETURN_TO_ORIGIN",
  "RETURN_REQUESTED",
  "RETURNED",
]);

const CLOSED = new Set(["CANCELLED", "REFUNDED"]);

export const CLAIM_WAIT_DAYS = 20;
const CLAIM_WAIT_MS = CLAIM_WAIT_DAYS * 24 * 60 * 60 * 1000;

export const claimClosedMessage =
  "A replacement or refund can be requested after the order has shipped, or 20 days after the order was placed.";

export function replacementClaimOpen(input: { status: string; paymentStatus: string; createdAt: string | Date }) {
  if (!paymentWasCaptured(input.paymentStatus) || input.paymentStatus === "REFUNDED") return false;
  if (CLOSED.has(input.status)) return false;
  if (SHIPPED.has(input.status)) return true;
  const created = input.createdAt instanceof Date ? input.createdAt : new Date(input.createdAt);
  if (Number.isNaN(created.getTime())) return false;
  return Date.now() - created.getTime() >= CLAIM_WAIT_MS;
}
