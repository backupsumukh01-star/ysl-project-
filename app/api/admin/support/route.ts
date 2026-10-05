import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return ok({ tickets: [] });
  const tickets = await prisma.supportTicket.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return ok({ tickets });
}

export async function PATCH(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Support is not available.", 503);
  const body = z.object({
    id: z.string(),
    status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"]),
  }).safeParse(await readJson(request));
  if (!body.success) return fail("VALIDATION", "That status was not accepted.");
  await prisma.supportTicket.update({ where: { id: body.data.id }, data: { status: body.data.status } });
  return ok({ updated: true });
}
