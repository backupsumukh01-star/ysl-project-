import { guardOrigin, ok, fail, readJson } from "@/lib/http";
import { getCustomer, revokeCustomerSessions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/service";
import { orderEmail } from "@/lib/email/templates";
import { publishedEmail } from "@/lib/config";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCustomer();
  if (!user) return fail("UNAUTHORIZED", "Sign in to view security.", 401);
  const prisma = db();
  if (!prisma) return ok({ sessions: 0 });
  const sessions = await prisma.session.count({ where: { userId: user.id, expiresAt: { gt: new Date() } } });
  return ok({ sessions });
}

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const user = await getCustomer();
  if (!user) return fail("UNAUTHORIZED", "Sign in to update security.", 401);
  const body = (await readJson(request)) as { action?: string } | null;
  if (body?.action === "delete") {
    const prisma = db();
    if (!prisma) return fail("DATABASE_UNAVAILABLE", "The account could not be updated.", 503);
    await prisma.user.update({ where: { id: user.id }, data: { deletionRequestedAt: new Date(), marketingEmail: false } });
    const settings = await getSettings();
    await sendEmail({
      to: user.email,
      type: "account_deletion",
      dedupeKey: `account_deletion:${user.id}`,
      ...orderEmail({ title: "Deletion requested", number: "", total: "", note: "Your deletion request was recorded. It is not completed until it is reviewed." }),
    });
    const supportInbox = publishedEmail(settings.supportEmail);
    if (supportInbox) {
      await sendEmail({
        to: supportInbox,
        type: "admin_account_deletion",
        dedupeKey: `admin_account_deletion:${user.id}`,
        ...orderEmail({ title: "Account deletion requested", number: user.email, total: "", note: "A customer asked for account deletion. Review before removing records." }),
      });
    }
    return ok({ requested: true });
  }
  await revokeCustomerSessions(user.id);
  return ok({ revoked: true });
}
