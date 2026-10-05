"use server";

import { validateCheckout, type StoredOrder } from "@/lib/orders";

export type CheckoutResult =
  | { ok: false; errors: ReturnType<typeof validateCheckout> }
  | { ok: true; order: StoredOrder };

export async function placeOrder(): Promise<CheckoutResult> {
  return { ok: false, errors: { email: "Use the checkout page. This action does not collect payment." } };
}
