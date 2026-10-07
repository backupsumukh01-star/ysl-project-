import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { abandonUnpaidOrder } from "@/lib/commerce";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({ orderId: z.string().min(1) });

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  if (!rateLimit(`abandon:${clientIp(request)}`, 30, 10 * 60 * 1000)) {
    return fail("RATE_LIMITED", "Too many checkout attempts. Wait and try again.", 429);
  }
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "That order could not be closed.", 400);
  const result = await abandonUnpaidOrder(parsed.data.orderId);
  if (!result.ok) return fail("DATABASE_UNAVAILABLE", "Orders are not available.", 503);
  return ok({ abandoned: result.abandoned });
}
