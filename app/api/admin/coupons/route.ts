import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  id: z.string().optional(),
  code: z.string().trim().min(2).max(40),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().int().min(0),
  minSubtotal: z.number().int().min(0).optional(),
  maxDiscount: z.number().int().min(0).nullable().optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  perUserLimit: z.number().int().min(1).optional(),
  active: z.boolean().optional(),
  productIds: z.string().optional(),
});

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return ok({ coupons: [] });
  const coupons = await prisma.coupon.findMany({ orderBy: { code: "asc" } });
  return ok({ coupons });
}

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Coupons are not available.", 503);
  const body = schema.safeParse(await readJson(request));
  if (!body.success) return fail("VALIDATION", "Check the coupon.");
  const data = {
    code: body.data.code.toUpperCase(),
    type: body.data.type,
    value: body.data.value,
    minSubtotal: body.data.minSubtotal ?? 0,
    maxDiscount: body.data.maxDiscount ?? null,
    usageLimit: body.data.usageLimit ?? null,
    perUserLimit: body.data.perUserLimit ?? 1,
    active: body.data.active ?? true,
    productIds: body.data.productIds || "",
  };
  const coupon = body.data.id
    ? await prisma.coupon.update({ where: { id: body.data.id }, data })
    : await prisma.coupon.create({ data });
  return ok({ id: coupon.id });
}
