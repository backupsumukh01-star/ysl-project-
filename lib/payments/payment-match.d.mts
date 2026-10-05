export type CapturedPayment = {
  id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  order_id?: string;
};

export function paymentMatchesOrder(
  payment: CapturedPayment,
  expected: { amountMinor: number; currency: string; razorpayOrderId: string; razorpayPaymentId: string },
): boolean;
