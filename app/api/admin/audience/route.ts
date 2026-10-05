import { fail, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { audienceReport } from "@/lib/analytics/audience";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const report = await audienceReport();
  if (!report) return fail("DATABASE_UNAVAILABLE", "The database is not configured.", 503);
  return ok(report);
}
