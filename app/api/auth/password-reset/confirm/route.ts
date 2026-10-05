import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { createCustomerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword, sha256 } from "@/lib/crypto";

export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().trim().min(32).max(200),
  password: z.string().min(8, "Use at least 8 characters.").max(200),
});

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Accounts are not available yet.", 503);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) {
    const passwordIssue = parsed.error.issues.find((issue) => issue.path[0] === "password");
    return fail("VALIDATION", passwordIssue?.message || "This reset link is not valid.");
  }
  const row = await prisma.otpCode.findFirst({
    where: {
      codeHash: sha256(parsed.data.token),
      usedAt: null,
      salt: { startsWith: "reset:" },
    },
  });
  if (!row || row.expiresAt.getTime() < Date.now()) {
    if (row) await prisma.otpCode.update({ where: { id: row.id }, data: { usedAt: new Date() } });
    return fail("INVALID_TOKEN", "This reset link has expired. Request a new one.", 400);
  }
  const user = await prisma.user.findUnique({ where: { email: row.email }, select: { id: true, email: true } });
  if (!user) {
    await prisma.otpCode.update({ where: { id: row.id }, data: { usedAt: new Date() } });
    return fail("INVALID_TOKEN", "This reset link has expired. Request a new one.", 400);
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(parsed.data.password), emailVerified: true },
  });
  await prisma.otpCode.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  await createCustomerSession(user.id);
  return ok({ email: user.email });
}
