import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { getCustomer } from "@/lib/auth";
import { createReturnRequest } from "@/lib/fulfillment";

export const dynamic = "force-dynamic";

const schema = z.object({
  reason: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).optional(),
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(10) })).min(1).max(20),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const user = await getCustomer();
  if (!user) return fail("UNAUTHORIZED", "Sign in to request a return.", 401);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "Check the return details.");
  const { id } = await context.params;
  const result = await createReturnRequest({ orderId: id, userId: user.id, reason: parsed.data.reason, description: parsed.data.description || "", items: parsed.data.items });
  if (!result.ok) return fail("RETURN_FAILED", result.message, 400);
  return ok({ id: result.id });
}
