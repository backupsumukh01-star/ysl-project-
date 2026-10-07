import { fail, ok } from "@/lib/http";
import { getCustomer } from "@/lib/auth";
import { db } from "@/lib/db";
import { publicOrder } from "@/lib/commerce";
import { paymentWasCaptured } from "@/lib/order-paid";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCustomer();
  if (!user) return fail("UNAUTHORIZED", "Sign in to see orders.", 401);
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Orders are not available.", 503);
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });
  return ok({ orders: orders.map(publicOrder).filter((order) => paymentWasCaptured(order.paymentStatus)) });
}
