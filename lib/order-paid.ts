const CAPTURED = new Set(["PAID", "REFUND_PENDING", "PARTIALLY_REFUNDED", "REFUNDED"]);

export function paymentWasCaptured(status: string) {
  return CAPTURED.has(status);
}
