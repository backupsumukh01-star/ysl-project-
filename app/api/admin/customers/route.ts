import { ok } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return ok({ customers: [] });
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, email: true, name: true, phone: true, createdAt: true, _count: { select: { orders: true } } },
  });
  return ok({
    customers: customers.map((customer) => ({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      orders: customer._count.orders,
      createdAt: customer.createdAt.toISOString(),
    })),
  });
}
