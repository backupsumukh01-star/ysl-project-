import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { emailField } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/crypto";
import { passwordResetEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/service";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

const schema = z.object({ email: emailField });

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Accounts are not available yet.", 503);
  if (!rateLimit(`reset:${clientIp(request)}`, 8, 60 * 60 * 1000)) {
    return fail("RATE_LIMITED", "Too many reset requests. Wait and try again.", 429);
  }
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail("INVALID_EMAIL", "Enter a valid email.");
  const email = parsed.data.email;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (user) {
    const token = randomToken();
    await prisma.otpCode.updateMany({
      where: { email, usedAt: null, salt: { startsWith: "reset:" } },
      data: { usedAt: new Date() },
    });
    const row = await prisma.otpCode.create({
      data: {
        email,
        salt: `reset:${randomToken()}`,
        codeHash: sha256(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    const link = `${siteConfig.siteUrl.replace(/\/$/, "")}/account/reset?token=${token}`;
    await sendEmail({
      to: email,
      type: "password_reset",
      dedupeKey: `password_reset:${row.id}`,
      ...passwordResetEmail(link),
    });
  }
  return ok({ sent: true });
}
