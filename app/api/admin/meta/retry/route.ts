import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { retryPurchaseEvent } from "@/lib/analytics/purchase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const body = (await readJson(request)) as { id?: string } | null;
  if (!body?.id) return fail("VALIDATION", "Choose an event to retry.");
  const result = await retryPurchaseEvent(body.id);
  if (!result.ok) return fail("RETRY_FAILED", result.message, 400);
  return ok({ status: result.status, eventId: result.eventId });
}
