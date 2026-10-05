import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from "crypto";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function randomToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const previous = Buffer.from(hash, "hex");
  if (previous.length !== next.length) return false;
  return timingSafeEqual(previous, next);
}

export function createOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashOtp(code: string, salt: string): string {
  return scryptSync(code, salt, 32).toString("hex");
}

export function verifyOtp(code: string, salt: string, hash: string): boolean {
  const next = scryptSync(code, salt, 32);
  const previous = Buffer.from(hash, "hex");
  if (previous.length !== next.length) return false;
  return timingSafeEqual(previous, next);
}

export function otpSalt(): string {
  return randomBytes(16).toString("hex");
}

export function minorToMajor(minor: number | null | undefined): number | null {
  if (minor == null) return null;
  return minor / 100;
}

export function majorToMinor(major: number): number {
  return Math.round(major * 100);
}

export function orderNumber(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) suffix += alphabet[randomInt(0, alphabet.length)];
  return `RSM-${suffix}`;
}

export function ticketNumber(): string {
  return `SUP-${randomInt(100000, 999999)}`;
}
