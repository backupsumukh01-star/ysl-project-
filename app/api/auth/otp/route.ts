import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { emailField } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { issueOtp } from "@/lib/auth";
import { otpEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/service";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  if (!db()) return fail("DATABASE_UNAVAILABLE", "Accounts are not available yet.", 503);
  const body = (await readJson(request)) as { email?: string } | null;
  const email = emailField.safeParse(body?.email || "");
  if (!email.success) return fail("INVALID_EMAIL", "Enter a valid email.");
  const ip = clientIp(request);
  if (!rateLimit(`otp:${email.data}`, 5, 60 * 60 * 1000) || !rateLimit(`otp-ip:${ip}`, 20, 60 * 60 * 1000)) {
    return fail("RATE_LIMITED", "Too many codes were requested. Wait and try again.", 429);
  }
  const issued = await issueOtp(email.data);
  if (!issued.ok) return fail(issued.code, "Wait a moment before requesting another code.", 429);
  await sendEmail({
    to: email.data,
    type: "otp",
    dedupeKey: `otp:${issued.otpId}`,
    ...otpEmail(issued.code),
  });
  return ok({ sent: true });
}
