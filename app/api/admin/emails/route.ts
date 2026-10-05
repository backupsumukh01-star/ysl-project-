import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { retryEmail } from "@/lib/email/service";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return ok({ emails: [] });
  const emails = await prisma.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 80 });
  return ok({
    emails: emails.map((email) => ({
      id: email.id,
      type: email.type,
      recipient: email.recipient,
      subject: email.subject,
      status: email.status,
      provider: email.provider,
      error: email.error,
      createdAt: email.createdAt.toISOString(),
      body: process.env.NODE_ENV === "production" ? "" : email.body,
    })),
  });
}

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const body = z.object({ id: z.string() }).safeParse(await readJson(request));
  if (!body.success) return fail("VALIDATION", "Choose an email to retry.");
  const result = await retryEmail(body.data.id);
  if (!result.ok) return fail("EMAIL_RETRY_FAILED", result.error || "The email could not be retried.");
  return ok({ retried: true });
}
