import { fail, guardOrigin, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/config";
import { sendEmail } from "@/lib/email/service";
import { orderEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  if (!siteConfig.features.abandonedCart) return ok({ swept: 0, emailed: 0 });
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Carts are not available.", 503);
  const hours = Number(process.env.ABANDONED_CART_HOURS || 4);
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const carts = await prisma.cart.findMany({
    where: { status: { in: ["ACTIVE", "CHECKOUT"] }, updatedAt: { lt: cutoff }, items: { some: {} }, abandonedAt: null },
    include: { user: true, items: true },
  });
  let emailed = 0;
  for (const cart of carts) {
    await prisma.cart.update({ where: { id: cart.id }, data: { status: "ABANDONED", abandonedAt: new Date() } });
    if (cart.user?.email && cart.recoverySentAt == null && cart.user.marketingEmail) {
      await sendEmail({
        to: cart.user.email,
        type: "abandoned_cart",
        dedupeKey: `abandoned_cart:${cart.id}`,
        ...orderEmail({ title: "Your bag is still waiting", number: "", total: "", note: "Items are still in your bag. This note is sent only because marketing email is allowed on the account." }),
      });
      await prisma.cart.update({ where: { id: cart.id }, data: { recoverySentAt: new Date() } });
      emailed += 1;
    }
  }
  return ok({ swept: carts.length, emailed });
}
