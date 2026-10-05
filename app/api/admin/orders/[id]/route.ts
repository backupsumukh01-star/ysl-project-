import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { publicOrder, requestRefund, setFulfillmentStatus } from "@/lib/commerce";
import { receiptFromOrder } from "@/lib/email/order-notice";
import { sendEmail } from "@/lib/email/service";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Orders are not available.", 503);
  const { id } = await context.params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true, payments: true } });
  if (!order) return fail("NOT_FOUND", "Order not found.", 404);
  return ok({ order: { ...publicOrder(order), internalNote: order.internalNote } });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Orders are not available.", 503);
  const { id } = await context.params;
  const body = z
    .object({
      status: z.string().optional(),
      internalNote: z.string().max(2000).optional(),
      courier: z.string().max(80).optional(),
      trackingNumber: z.string().max(80).optional(),
      trackingUrl: z.string().max(300).optional(),
      shipmentId: z.string().max(80).optional(),
      shippingMethod: z.string().max(80).optional(),
      deliveryEstimate: z.string().max(160).optional(),
      action: z.enum(["resend", "refund"]).optional(),
    })
    .safeParse(await readJson(request));
  if (!body.success) return fail("VALIDATION", "That update was not accepted.");
  if (body.data.action === "refund") {
    const result = await requestRefund(id);
    if (!result.ok) return fail("REFUND_FAILED", result.message);
    return ok(result);
  }
  const shipment = {
    courier: body.data.courier,
    trackingNumber: body.data.trackingNumber,
    trackingUrl: body.data.trackingUrl,
    shipmentId: body.data.shipmentId,
    shippingMethod: body.data.shippingMethod,
    deliveryEstimate: body.data.deliveryEstimate,
  };
  const shipmentUpdate = Object.fromEntries(Object.entries(shipment).filter(([, value]) => value != null));
  if (Object.keys(shipmentUpdate).length) {
    await prisma.order.update({ where: { id }, data: shipmentUpdate });
  }
  if (body.data.status) {
    const result = await setFulfillmentStatus(id, body.data.status, body.data.internalNote);
    if (!result.ok) return fail("STATUS_FAILED", result.message);
  } else if (body.data.internalNote != null) {
    await prisma.order.update({ where: { id }, data: { internalNote: body.data.internalNote } });
  }
  if (body.data.action === "resend") {
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return fail("NOT_FOUND", "Order not found.", 404);
    await sendEmail({
      to: order.email,
      type: "order_confirmation",
      dedupeKey: `order_confirmation_resend:${order.id}:${Date.now()}`,
      ...receiptFromOrder(order, { title: "Order confirmed", note: "This is a copy of your order confirmation." }),
    });
  }
  return ok({ updated: true });
}
