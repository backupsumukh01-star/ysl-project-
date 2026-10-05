import { fail, guardOrigin, ok } from "@/lib/http";
import { getCustomer } from "@/lib/auth";
import { requestCancellation } from "@/lib/fulfillment";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const user = await getCustomer();
  if (!user) return fail("UNAUTHORIZED", "Sign in to cancel an order.", 401);
  const { id } = await context.params;
  const result = await requestCancellation(id, user.id);
  if (!result.ok) return fail(result.code || "CANCEL_FAILED", result.message, result.code === "SHIPPED" ? 409 : 400);
  return ok({ message: result.message });
}
