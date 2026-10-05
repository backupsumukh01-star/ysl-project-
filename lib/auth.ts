import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { createOtpCode, hashOtp, hashPassword, otpSalt, randomToken, sha256, verifyOtp, verifyPassword } from "@/lib/crypto";
import { logInfo } from "@/lib/logger";

const CUSTOMER_COOKIE = "rsm_session";
const ADMIN_COOKIE = "rsm_admin";
const RECEIPT_COOKIE = "rsm_receipt";
const SESSION_DAYS = 30;

function cookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export function otpConfig() {
  const minutes = Number(process.env.OTP_TTL_MINUTES || 10);
  const resend = Number(process.env.OTP_RESEND_SECONDS || 60);
  const attempts = Number(process.env.OTP_MAX_ATTEMPTS || 5);
  return {
    ttlMs: (Number.isFinite(minutes) && minutes > 0 ? minutes : 10) * 60 * 1000,
    resendSeconds: Number.isFinite(resend) && resend > 0 ? resend : 60,
    maxAttempts: Number.isFinite(attempts) && attempts > 0 ? attempts : 5,
  };
}

export async function createCustomerSession(userId: string) {
  const prisma = db();
  if (!prisma) throw new Error("DATABASE_URL is not configured");
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { tokenHash: sha256(token), userId, expiresAt } });
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, token, { ...cookieBase(), maxAge: SESSION_DAYS * 24 * 60 * 60 });
  logInfo("session_created", { kind: "customer" });
}

export async function createAdminSession(adminId: string) {
  const prisma = db();
  if (!prisma) throw new Error("DATABASE_URL is not configured");
  const token = randomToken();
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
  await prisma.adminSession.create({ data: { tokenHash: sha256(token), adminId, expiresAt } });
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, { ...cookieBase(), maxAge: 12 * 60 * 60 });
  logInfo("session_created", { kind: "admin" });
}

export async function getCustomer() {
  const prisma = db();
  if (!prisma) return null;
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  return session.user;
}

export async function getAdmin() {
  const prisma = db();
  if (!prisma) return null;
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: sha256(token) },
    include: { admin: true },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  return session.admin;
}

export async function logoutCustomer() {
  const prisma = db();
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  if (prisma && token) {
    await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
  }
  jar.delete(CUSTOMER_COOKIE);
}

export async function logoutAdmin() {
  const prisma = db();
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (prisma && token) {
    await prisma.adminSession.deleteMany({ where: { tokenHash: sha256(token) } });
  }
  jar.delete(ADMIN_COOKIE);
}

export async function revokeCustomerSessions(userId: string) {
  const prisma = db();
  if (!prisma) return;
  await prisma.session.deleteMany({ where: { userId } });
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
}

export async function setReceiptCookie(orderId: string) {
  const jar = await cookies();
  jar.set(RECEIPT_COOKIE, orderId, { ...cookieBase(), maxAge: 60 * 60 * 24 * 7 });
}

export async function receiptOrderId() {
  const jar = await cookies();
  return jar.get(RECEIPT_COOKIE)?.value || "";
}

export async function issueOtp(email: string) {
  const prisma = db();
  if (!prisma) throw new Error("DATABASE_URL is not configured");
  const config = otpConfig();
  const loginCodes = { email, NOT: { salt: { startsWith: "reset:" } } };
  const latest = await prisma.otpCode.findFirst({ where: loginCodes, orderBy: { createdAt: "desc" } });
  if (latest && Date.now() - latest.createdAt.getTime() < config.resendSeconds * 1000) {
    return { ok: false as const, code: "OTP_COOLDOWN", waitSeconds: config.resendSeconds };
  }
  const code = createOtpCode();
  const salt = otpSalt();
  await prisma.otpCode.updateMany({ where: { ...loginCodes, usedAt: null }, data: { usedAt: new Date() } });
  const row = await prisma.otpCode.create({
    data: {
      email,
      salt,
      codeHash: hashOtp(code, salt),
      expiresAt: new Date(Date.now() + config.ttlMs),
    },
  });
  return { ok: true as const, code, otpId: row.id };
}

export async function consumeOtp(email: string, code: string) {
  const prisma = db();
  if (!prisma) return { ok: false as const, reason: "unavailable" };
  const config = otpConfig();
  const row = await prisma.otpCode.findFirst({
    where: { email, usedAt: null, NOT: { salt: { startsWith: "reset:" } } },
    orderBy: { createdAt: "desc" },
  });
  if (!row) return { ok: false as const, reason: "missing" };
  if (row.expiresAt.getTime() < Date.now() || row.attempts >= config.maxAttempts) {
    await prisma.otpCode.update({ where: { id: row.id }, data: { usedAt: new Date() } });
    return { ok: false as const, reason: "expired" };
  }
  if (!verifyOtp(code, row.salt, row.codeHash)) {
    const attempts = row.attempts + 1;
    await prisma.otpCode.update({
      where: { id: row.id },
      data: { attempts, usedAt: attempts >= config.maxAttempts ? new Date() : null },
    });
    return { ok: false as const, reason: "invalid" };
  }
  await prisma.otpCode.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  return { ok: true as const };
}

export async function verifyAdminPassword(email: string, password: string) {
  const prisma = db();
  if (!prisma) return null;
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || !verifyPassword(password, admin.passwordHash)) return null;
  return admin;
}

export { hashPassword };
