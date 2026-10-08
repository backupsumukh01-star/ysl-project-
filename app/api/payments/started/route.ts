import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendPaymentStarted } from "@/lib/analytics/purchase";

export const dynamic = "force-dynamic";

const schema = z.object({ orderId: z.string().min(1).max(80) });

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  if (!rateLimit(`payment-started:${clientIp(request)}`, 30, 10 * 60 * 1000)) {
    return fail("RATE_LIMITED", "Too many checkout attempts. Wait and try again.", 429);
  }
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "That payment could not be recorded.", 400);
  await sendPaymentStarted(parsed.data.orderId, request);
  return ok({ recorded: true });
}
