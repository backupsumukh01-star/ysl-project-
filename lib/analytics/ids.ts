/** Meta content_ids and the catalog feed use the Prisma product id. SKU stays a separate field. A slug is resolved to that id on the server. */

export function purchaseEventId(orderId: string) {
  return `purchase_${orderId}`;
}

export function registrationEventId(userId: string) {
  return `registration_${userId}`;
}

export function contactEventId(ticketId: string) {
  return `contact_${ticketId}`;
}

export function paymentInfoEventId(orderId: string) {
  return `add_payment_info_${orderId}`;
}

export function paymentStartedEventId(orderId: string) {
  return `payment_started_${orderId}`;
}
