import { ok } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { minorToMajor } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return ok({ orders: [] });
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const status = url.searchParams.get("status") || "";
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const where = {
    ...(status ? { status } : {}),
  };
  const orders = await prisma.order.findMany({
    where,
    include: { items: true, payments: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * 20,
    take: 20,
  });
  const filtered = q
    ? orders.filter((order) => `${order.number} ${order.email} ${order.name}`.toLowerCase().includes(q))
    : orders;
  return ok({
    page,
    orders: filtered.map((order) => ({
      id: order.id,
      number: order.number,
      email: order.email,
      name: order.name,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: minorToMajor(order.totalMinor),
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
      razorpayPaymentId: order.payments[0]?.razorpayPaymentId || "",
    })),
  });
}
