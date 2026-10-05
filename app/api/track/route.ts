import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { emailField } from "@/lib/validators";
import { lookupTracking } from "@/lib/fulfillment";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  number: z.string().trim().min(4).max(40),
  email: emailField,
});

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  if (!rateLimit(`track:${clientIp(request)}`, 20, 10 * 60 * 1000)) return fail("RATE_LIMITED", "Too many lookups. Wait and try again.", 429);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "Enter the order number and the email used at checkout.");
  const tracking = await lookupTracking(parsed.data);
  if (!tracking) return fail("NOT_FOUND", "No order matched those details.", 404);
  return ok({ tracking });
}
