import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { receiptFromOrder } from "@/lib/email/order-notice";
import { sendEmail, sendOwnerEmail } from "@/lib/email/service";

export const dynamic = "force-dynamic";

const statuses = ["REQUESTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "PICKUP_SCHEDULED", "RECEIVED", "REFUND_PENDING", "REFUNDED", "CLOSED"];

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Returns are not available.", 503);
  const returns = await prisma.returnRequest.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { order: true } });
  return ok({
    returns: returns.map((item) => ({
      id: item.id,
      orderId: item.order.number,
      status: item.status,
      reason: item.reason,
    })),
  });
}

export async function PATCH(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const parsed = z.object({ id: z.string(), status: z.string() }).safeParse(await readJson(request));
  if (!parsed.success || !statuses.includes(parsed.data.status)) return fail("VALIDATION", "That return update was not accepted.");
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Returns are not available.", 503);
  const updated = await prisma.returnRequest.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
    include: { order: { include: { items: true } } },
  });
  const decision = parsed.data.status === "APPROVED" ? "approved" : parsed.data.status === "REJECTED" ? "rejected" : "";
  if (decision) {
    const notice = receiptFromOrder(updated.order, {
      title: `Return ${decision}`,
      note: `The return request was marked ${decision}. This message does not publish a return policy, and it does not confirm a refund.`,
    });
    await sendEmail({
      to: updated.order.email,
      type: `return_${decision}`,
      dedupeKey: `return_${decision}:${updated.id}`,
      ...notice,
    });
    await sendOwnerEmail({ type: `admin_return_${decision}`, dedupeKey: `admin_return_${decision}:${updated.id}`, ...notice });
  }
  return ok({ updated: true });
}
