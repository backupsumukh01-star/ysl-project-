import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { getCustomer } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(30).optional(),
  line1: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(80),
  region: z.string().trim().min(1).max(80),
  postcode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(80),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const user = await getCustomer();
  if (!user) return fail("UNAUTHORIZED", "Sign in to view addresses.", 401);
  const prisma = db();
  if (!prisma) return ok({ addresses: [] });
  const addresses = await prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } });
  return ok({ addresses });
}

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const user = await getCustomer();
  if (!user) return fail("UNAUTHORIZED", "Sign in to save an address.", 401);
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Addresses are not available.", 503);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "Check the address.");
  if (parsed.data.isDefault) await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  const address = await prisma.address.create({ data: { ...parsed.data, phone: parsed.data.phone || "", userId: user.id } });
  return ok({ address });
}
