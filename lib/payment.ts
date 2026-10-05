export type PaymentStatus = "not_configured" | "failed" | "succeeded";

export type PaymentResult = {
  status: PaymentStatus;
  reference?: string;
  message?: string;
};

export type PaymentDraft = {
  orderId: string;
  amount: number | null;
  currency: string;
};

export interface PaymentProvider {
  createPayment(draft: PaymentDraft): Promise<PaymentResult>;
  verifyPayment(reference: string): Promise<PaymentResult>;
  handleWebhook(body: string): Promise<PaymentResult>;
}

class UnconfiguredPaymentProvider implements PaymentProvider {
  async createPayment(): Promise<PaymentResult> {
    return {
      status: "not_configured",
      message: "No payment provider is configured. Nothing was charged.",
    };
  }

  async verifyPayment(): Promise<PaymentResult> {
    return {
      status: "not_configured",
      message: "No payment provider is configured.",
    };
  }

  async handleWebhook(): Promise<PaymentResult> {
    return {
      status: "not_configured",
      message: "Payment webhooks are not configured. Nothing was recorded.",
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  return new UnconfiguredPaymentProvider();
}
