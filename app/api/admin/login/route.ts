import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { createAdminSession, verifyAdminPassword } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { emailField } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  if (!rateLimit(`admin-login:${clientIp(request)}`, 8, 15 * 60 * 1000)) {
    return fail("RATE_LIMITED", "Too many sign-in attempts.", 429);
  }
  const body = z.object({ email: emailField, password: z.string().min(8).max(200) }).safeParse(await readJson(request));
  if (!body.success) return fail("VALIDATION", "Enter the admin email and password.");
  const admin = await verifyAdminPassword(body.data.email, body.data.password);
  if (!admin) return fail("UNAUTHORIZED", "Those admin details were not accepted.", 401);
  await createAdminSession(admin.id);
  return ok({ email: admin.email });
}
