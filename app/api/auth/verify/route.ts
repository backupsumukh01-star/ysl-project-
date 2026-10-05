import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { emailField } from "@/lib/validators";
import { consumeOtp, createCustomerSession } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { welcomeEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/service";
import { sendRegistration } from "@/lib/analytics/purchase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Accounts are not available yet.", 503);
  const body = (await readJson(request)) as { email?: string; code?: string } | null;
  const email = emailField.safeParse(body?.email || "");
  const code = String(body?.code || "").replace(/\D/g, "");
  if (!email.success || code.length !== 6) return fail("INVALID_CODE", "Enter the 6-digit code.");
  if (!rateLimit(`verify:${email.data}`, 10, 15 * 60 * 1000) || !rateLimit(`verify-ip:${clientIp(request)}`, 30, 15 * 60 * 1000)) {
    return fail("RATE_LIMITED", "Too many attempts. Wait and try again.", 429);
  }
  const result = await consumeOtp(email.data, code);
  if (!result.ok) return fail("INVALID_CODE", "That code is not valid.", 401);
  const existing = await prisma.user.findUnique({ where: { email: email.data } });
  const user = existing
    ? await prisma.user.update({ where: { id: existing.id }, data: { emailVerified: true } })
    : await prisma.user.create({ data: { email: email.data, emailVerified: true } });
  if (!existing) {
    await sendEmail({ to: user.email, type: "welcome", dedupeKey: `welcome:${user.id}`, ...welcomeEmail(user.name) });
    await sendRegistration({ id: user.id, email: user.email }, request);
  }
  await createCustomerSession(user.id);
  return ok({ email: user.email, name: user.name, created: !existing, userId: user.id });
}
