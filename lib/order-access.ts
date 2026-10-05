import { getCustomer, receiptOrderId } from "@/lib/auth";
import { db } from "@/lib/db";

export async function loadOwnedOrder(id: string) {
  const prisma = db();
  if (!prisma) return null;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true, payments: true } });
  if (!order) return null;
  const user = await getCustomer();
  const receipt = await receiptOrderId();
  if (user && order.userId === user.id) return order;
  if (receipt && receipt === order.id) return order;
  return null;
}
