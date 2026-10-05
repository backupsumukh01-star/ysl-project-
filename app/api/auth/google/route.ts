import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { createCustomerSession } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  credential: z.string().min(20).max(8000),
});

type GoogleUser = { id: string; email: string; passwordHash: string; googleSub: string | null };

function googleClientId() {
  return process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
}

function decodePart(part: string) {
  const padded = part.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (part.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

let certCache: { expires: number; keys: Map<string, CryptoKey> } | null = null;

async function googleKey(kid: string) {
  if (!certCache || certCache.expires < Date.now()) {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/certs");
    if (!response.ok) return null;
    const body = (await response.json()) as { keys?: (JsonWebKey & { kid?: string })[] };
    const keys = new Map<string, CryptoKey>();
    for (const jwk of body.keys || []) {
      if (!jwk.kid) continue;
      const key = await crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"],
      );
      keys.set(jwk.kid, key);
    }
    certCache = { expires: Date.now() + 60 * 60 * 1000, keys };
  }
  return certCache.keys.get(kid) || null;
}

async function verifyGoogleCredential(token: string, clientId: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  let header: { alg?: string; kid?: string };
  let payload: { iss?: string; aud?: string; exp?: number; email?: string; email_verified?: boolean | string; sub?: string; name?: string };
  try {
    header = JSON.parse(decodePart(encodedHeader).toString("utf8"));
    payload = JSON.parse(decodePart(encodedPayload).toString("utf8"));
  } catch {
    return null;
  }
  if (header.alg !== "RS256" || !header.kid) return null;
  const key = await googleKey(header.kid);
  if (!key) return null;
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    decodePart(encodedSignature),
    Buffer.from(`${encodedHeader}.${encodedPayload}`),
  );
  if (!valid) return null;
  const issuer = payload.iss === "accounts.google.com" || payload.iss === "https://accounts.google.com";
  const verified = payload.email_verified === true || payload.email_verified === "true";
  const email = String(payload.email || "").trim().toLowerCase();
  if (!issuer || payload.aud !== clientId || !verified || !payload.sub || !email.includes("@")) return null;
  if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
  return { sub: payload.sub, email, name: String(payload.name || "").trim().slice(0, 200) };
}

export async function GET() {
  return ok({ clientId: googleClientId() });
}

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const clientId = googleClientId();
  if (!clientId) return fail("GOOGLE_NOT_CONFIGURED", "Google sign-in is not set up on this store yet.", 503);
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Accounts are not available yet.", 503);
  if (!rateLimit(`google:${clientIp(request)}`, 20, 15 * 60 * 1000)) {
    return fail("RATE_LIMITED", "Too many attempts. Wait and try again.", 429);
  }
  const parsed = bodySchema.safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "Google did not return an account.");
  const identity = await verifyGoogleCredential(parsed.data.credential, clientId);
  if (!identity) return fail("INVALID_GOOGLE", "Google could not confirm this account.", 401);

  const bySub = await prisma.$queryRaw<GoogleUser[]>`
    SELECT "id", "email", "passwordHash", "googleSub" FROM "User" WHERE "googleSub" = ${identity.sub} LIMIT 1
  `;
  const byEmail = await prisma.$queryRaw<GoogleUser[]>`
    SELECT "id", "email", "passwordHash", "googleSub" FROM "User" WHERE "email" = ${identity.email} LIMIT 1
  `;
  const matchedSub = bySub[0];
  const matchedEmail = byEmail[0];
  if (matchedSub && matchedEmail && matchedSub.id !== matchedEmail.id) {
    return fail("GOOGLE_CONFLICT", "This Google account does not match the email on file.", 409);
  }
  if (matchedEmail?.googleSub && matchedEmail.googleSub !== identity.sub) {
    return fail("GOOGLE_CONFLICT", "This email is already linked to a different Google account.", 409);
  }

  const existing = matchedSub || matchedEmail;
  const user = existing
    ? existing
    : await prisma.user.create({ data: { email: identity.email, name: identity.name, emailVerified: true } });
  const current = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true } });
  await prisma.user.update({
    where: { id: user.id },
    data: {
      googleSub: identity.sub,
      emailVerified: true,
      ...(current?.name ? {} : { name: identity.name }),
    },
  });
  await createCustomerSession(user.id);
  return ok({ email: existing ? existing.email : identity.email, created: !existing });
}
