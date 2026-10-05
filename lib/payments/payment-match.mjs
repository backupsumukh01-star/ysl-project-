export function paymentMatchesOrder(payment, expected) {
  if (payment.id !== expected.razorpayPaymentId) return false;
  if (payment.order_id !== expected.razorpayOrderId) return false;
  if (payment.status !== "captured") return false;
  if (payment.amount !== expected.amountMinor) return false;
  return (payment.currency || "").toUpperCase() === expected.currency.toUpperCase();
}
