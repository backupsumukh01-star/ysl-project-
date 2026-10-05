import { fail, guardOrigin, ok } from "@/lib/http";
import { getCustomer } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const user = await getCustomer();
  if (!user) return fail("UNAUTHORIZED", "Sign in to edit addresses.", 401);
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Addresses are not available.", 503);
  const { id } = await context.params;
  const address = await prisma.address.findFirst({ where: { id, userId: user.id } });
  if (!address) return fail("NOT_FOUND", "That address was not found.", 404);
  await prisma.address.delete({ where: { id: address.id } });
  return ok({ deleted: true });
}
