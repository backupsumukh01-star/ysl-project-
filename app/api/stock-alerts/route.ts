import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { emailField } from "@/lib/validators";
import { db } from "@/lib/db";
import { getCustomer } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  if (!siteConfig.features.backInStock) return fail("DISABLED", "Stock alerts are not enabled.", 404);
  if (!rateLimit(`stock:${clientIp(request)}`, 10, 60 * 60 * 1000)) return fail("RATE_LIMITED", "Too many requests. Wait and try again.", 429);
  const parsed = z.object({ email: emailField, productId: z.string().min(1), variantId: z.string().optional() }).safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "Enter an email for this product.");
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Alerts are not available.", 503);
  const product = await prisma.product.findFirst({ where: { id: parsed.data.productId, active: true } });
  if (!product) return fail("NOT_FOUND", "That product was not found.", 404);
  const user = await getCustomer();
  await prisma.stockAlert.upsert({
    where: { email_productId_variantId: { email: parsed.data.email, productId: product.id, variantId: parsed.data.variantId || "" } },
    update: {},
    create: { email: parsed.data.email, productId: product.id, variantId: parsed.data.variantId || "", userId: user?.id || null },
  });
  return ok({ saved: true });
}
