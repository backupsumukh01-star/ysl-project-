import { db } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";
import { publishedEmail } from "@/lib/config";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  type: string;
  dedupeKey?: string;
  text?: string;
};

type SendResult = { delivered: boolean; provider: string; providerId: string; error: string };

function providerName() {
  return (process.env.EMAIL_PROVIDER || "").trim().toLowerCase();
}

export function emailConfigured() {
  const provider = providerName();
  if (!provider || provider === "log") return false;
  if (provider === "smtp") {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.EMAIL_FROM);
  }
  if (provider === "resend") return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
  return false;
}

async function deliver(message: EmailMessage): Promise<SendResult> {
  if (!emailConfigured()) {
    return { delivered: false, provider: "log", providerId: "", error: "EMAIL NOT CONFIGURED" };
  }
  const provider = providerName();
  try {
    if (provider === "resend") {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress(),
          to: [message.to],
          subject: message.subject,
          html: message.html,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!response.ok) {
        return { delivered: false, provider, providerId: "", error: payload.message || "Email provider rejected the message." };
      }
      return { delivered: true, provider, providerId: payload.id || "", error: "" };
    }
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === "465",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
    const info = await transport.sendMail({
      from: fromAddress(),
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    return { delivered: true, provider, providerId: info.messageId || "", error: "" };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Email send failed";
    return { delivered: false, provider, providerId: "", error: reason };
  }
}

function fromAddress() {
  const name = process.env.EMAIL_FROM_NAME || "Rouge Sur Mesure";
  const email = publishedEmail(process.env.EMAIL_FROM);
  return email ? `${name} <${email}>` : name;
}

export function ownerRecipient() {
  const owner = (process.env.STORE_OWNER_EMAIL || "").trim();
  if (!isDeliverableAddress(owner)) return "";
  return owner;
}

function isDeliverableAddress(value: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
  const host = value.split("@")[1]?.toLowerCase() || "";
  return host !== "example.com" && host !== "example.org" && host !== "example.net";
}

export async function sendOwnerEmail(message: Omit<EmailMessage, "to">) {
  const to = ownerRecipient();
  if (!to) {
    const prisma = db();
    logError("email_result", { type: message.type, status: "NOT_CONFIGURED" });
    if (message.dedupeKey && prisma) {
      const existing = await prisma.emailLog.findFirst({ where: { dedupeKey: message.dedupeKey, status: "NOT_CONFIGURED" } });
      if (existing) return { skipped: true, id: existing.id, status: "NOT_CONFIGURED", error: "STORE OWNER EMAIL NOT CONFIGURED" };
    }
    const row = prisma
      ? await prisma.emailLog.create({
          data: {
            type: message.type,
            recipient: "",
            subject: message.subject,
            body: process.env.NODE_ENV !== "production" ? message.html : "",
            status: "NOT_CONFIGURED",
            provider: "log",
            error: "STORE OWNER EMAIL NOT CONFIGURED",
            dedupeKey: message.dedupeKey || "",
          },
        })
      : null;
    return { skipped: false, id: row?.id || "", status: "NOT_CONFIGURED", error: "STORE OWNER EMAIL NOT CONFIGURED" };
  }
  return sendEmail({ ...message, to });
}

export async function sendEmail(message: EmailMessage) {
  const prisma = db();
  try {
    if (message.dedupeKey && prisma) {
      const existing = await prisma.emailLog.findFirst({
        where: { dedupeKey: message.dedupeKey, status: "SENT" },
      });
      if (existing) return { skipped: true, id: existing.id };
      if (!emailConfigured()) {
        const logged = await prisma.emailLog.findFirst({
          where: { dedupeKey: message.dedupeKey, status: "NOT_CONFIGURED" },
        });
        if (logged) return { skipped: true, id: logged.id, status: "NOT_CONFIGURED", error: "EMAIL NOT CONFIGURED" };
      }
    }
    const result = await deliver(message);
    const revealBody = process.env.NODE_ENV !== "production" && !result.delivered;
    const status = result.delivered ? "SENT" : result.error === "EMAIL NOT CONFIGURED" ? "NOT_CONFIGURED" : "FAILED";
    const row = prisma
      ? await prisma.emailLog.create({
          data: {
            type: message.type,
            recipient: message.to,
            subject: message.subject,
            body: revealBody ? message.html : "",
            status,
            provider: result.provider,
            providerId: result.providerId,
            error: result.error,
            dedupeKey: message.dedupeKey || "",
          },
        })
      : null;
    if (status === "NOT_CONFIGURED") logError("email_result", { type: message.type, status, provider: result.provider });
    else logInfo("email_result", { type: message.type, status, provider: result.provider });
    return { skipped: false, id: row?.id || "", status, error: result.error };
  } catch (error) {
    logError("email_result", { type: message.type, status: "FAILED" });
    return { skipped: false, id: "", status: "FAILED", error: error instanceof Error ? error.message : "Email failed" };
  }
}

export async function retryEmail(id: string) {
  const prisma = db();
  if (!prisma) return { ok: false, error: "Database is not configured" };
  const row = await prisma.emailLog.findUnique({ where: { id } });
  if (!row) return { ok: false, error: "Email log was not found" };
  if (!row.body) return { ok: false, error: "This log has no message body to resend. Configure the provider and send a new message." };
  const result = await sendEmail({
    to: row.recipient,
    subject: row.subject,
    html: row.body,
    type: row.type,
    dedupeKey: "",
  });
  return { ok: result.status === "SENT" || result.status === "LOGGED", error: result.error || "" };
}
