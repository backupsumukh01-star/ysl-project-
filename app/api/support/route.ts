import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { getCustomer } from "@/lib/auth";
import { db } from "@/lib/db";
import { emailField } from "@/lib/validators";
import { ticketNumber } from "@/lib/crypto";
import { supportAdminEmail, supportCustomerEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/service";
import { publishedEmail } from "@/lib/config";
import { getSettings } from "@/lib/settings";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { logInfo } from "@/lib/logger";
import { sendContact } from "@/lib/analytics/purchase";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: emailField,
  phone: z.string().trim().max(30).optional(),
  orderRef: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(8).max(4000),
});

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  if (!rateLimit(`support:${clientIp(request)}`, 8, 60 * 60 * 1000)) {
    return fail("RATE_LIMITED", "Too many messages. Wait and try again.", 429);
  }
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Support is not available yet.", 503);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "Check the form and try again.");
  const user = await getCustomer();
  const ticket = await prisma.supportTicket.create({
    data: {
      number: ticketNumber(),
      userId: user?.id || null,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || "",
      orderRef: parsed.data.orderRef || "",
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
  });
  const settings = await getSettings();
  await sendEmail({
    to: ticket.email,
    type: "support_acknowledgement",
    dedupeKey: `support:${ticket.id}`,
    ...supportCustomerEmail({ number: ticket.number, subject: ticket.subject, message: ticket.message.slice(0, 400) }),
  });
  const supportInbox = publishedEmail(settings.supportEmail);
  if (supportInbox) {
    await sendEmail({
      to: supportInbox,
      type: "support_admin",
      dedupeKey: `support-admin:${ticket.id}`,
      ...supportAdminEmail({ number: ticket.number, subject: ticket.subject, email: ticket.email }),
    });
  }
  logInfo("support_ticket", { ticket: ticket.number });
  await sendContact({ id: ticket.id, email: ticket.email, userId: ticket.userId }, request);
  return ok({ number: ticket.number, id: ticket.id });
}

export async function GET() {
  const user = await getCustomer();
  if (!user) return fail("UNAUTHORIZED", "Sign in to see support requests.", 401);
  const prisma = db();
  if (!prisma) return ok({ tickets: [] });
  const tickets = await prisma.supportTicket.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return ok({
    tickets: tickets.map((ticket) => ({
      id: ticket.id,
      number: ticket.number,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
    })),
  });
}
