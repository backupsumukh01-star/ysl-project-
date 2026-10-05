import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { emailField } from "@/lib/validators";
import { createCustomerSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  mode: z.enum(["register", "login"]),
  email: emailField,
  password: z.string().min(8, "Use at least 8 characters.").max(200),
});

type PasswordUser = { id: string; email: string; passwordHash: string };

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Accounts are not available yet.", 503);
  if (!rateLimit(`password:${clientIp(request)}`, 20, 15 * 60 * 1000)) {
    return fail("RATE_LIMITED", "Too many attempts. Wait and try again.", 429);
  }
  const parsed = bodySchema.safeParse(await readJson(request));
  if (!parsed.success) {
    const passwordIssue = parsed.error.issues.find((issue) => issue.path[0] === "password");
    return fail("VALIDATION", passwordIssue?.message || "Enter your email and password.");
  }
  const { mode, email, password } = parsed.data;
  const found = await prisma.$queryRaw<PasswordUser[]>`
    SELECT "id", "email", "passwordHash" FROM "User" WHERE "email" = ${email} LIMIT 1
  `;
  const existing = found[0];

  if (mode === "login") {
    if (existing && !existing.passwordHash) {
      return fail("NO_PASSWORD", "This email has no password. Continue with Google, or use the email code on the account page.", 401);
    }
    if (!existing || !verifyPassword(password, existing.passwordHash)) {
      return fail("INVALID_LOGIN", "That email and password do not match.", 401);
    }
    await createCustomerSession(existing.id);
    return ok({ email: existing.email, created: false });
  }

  if (existing) {
    return fail("ACCOUNT_EXISTS", "An account with this email already exists. Sign in instead.");
  }
  const passwordHash = hashPassword(password);
  const user = await prisma.user.create({ data: { email, emailVerified: true, passwordHash } });
  await createCustomerSession(user.id);
  return ok({ email: user.email, created: true });
}
