import { createHash } from "crypto";
import { canSendMarketingEvent, type ConsentChoice } from "@/lib/analytics/consent";
import { db } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";

type UserData = { email?: string; phone?: string; externalId?: string; ip?: string; userAgent?: string; fbp?: string; fbc?: string };

type ServerEvent = {
  eventName: string;
  eventId: string;
  orderId?: string | null;
  userId?: string | null;
  userData?: UserData;
  customData?: Record<string, unknown>;
  sourceUrl?: string;
  consent: ConsentChoice;
};

function metaEnv() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
  const token = process.env.META_ACCESS_TOKEN || "";
  const datasetId = process.env.META_DATASET_ID || pixelId;
  const version = process.env.META_API_VERSION || "v21.0";
  const testEventCode = process.env.META_TEST_EVENT_CODE || "";
  return { token, datasetId, version, testEventCode, configured: Boolean(token && datasetId) };
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hashEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return normalized ? sha256(normalized) : "";
}

function hashPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  return sha256(normalized);
}

function payloadHash(event: ServerEvent) {
  const value = event.customData?.value ?? "";
  const currency = event.customData?.currency ?? "";
  return sha256(`${event.eventName}|${event.eventId}|${value}|${currency}`);
}

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Meta request failed";
  return message.replace(/access_token=[^&\s]+/gi, "access_token=redacted").slice(0, 300);
}

export async function sendMetaServerEvent(event: ServerEvent) {
  const prisma = db();
  if (!prisma) return { status: "SKIPPED" as const };
  const existing = await prisma.metaEvent.findUnique({ where: { eventId: event.eventId } });
  if (existing && (existing.status === "SENT" || existing.status === "PENDING" || existing.status === "DEDUPED")) {
    return { status: "DEDUPED" as const, eventId: event.eventId };
  }
  if (!canSendMarketingEvent(event.consent)) {
    await prisma.metaEvent.upsert({
      where: { eventId: event.eventId },
      create: { eventId: event.eventId, eventName: event.eventName, orderId: event.orderId, userId: event.userId, status: "SKIPPED", payloadHash: payloadHash(event), errorMessage: "Advertising consent was not granted." },
      update: { status: "SKIPPED", errorMessage: "Advertising consent was not granted." },
    });
    return { status: "SKIPPED" as const };
  }
  const env = metaEnv();
  if (!env.configured) {
    await prisma.metaEvent.upsert({
      where: { eventId: event.eventId },
      create: { eventId: event.eventId, eventName: event.eventName, orderId: event.orderId, userId: event.userId, status: "SKIPPED", payloadHash: payloadHash(event), errorMessage: "credentials not configured" },
      update: { status: "SKIPPED", errorMessage: "credentials not configured" },
    });
    logInfo("meta_event", { event: event.eventName, eventId: event.eventId, status: "SKIPPED" });
    return { status: "SKIPPED" as const };
  }
  return deliver(event, env);
}

async function deliver(event: ServerEvent, env: ReturnType<typeof metaEnv>) {
  const prisma = db();
  if (!prisma) return { status: "SKIPPED" as const };
  const row = await prisma.metaEvent.upsert({
    where: { eventId: event.eventId },
    create: { eventId: event.eventId, eventName: event.eventName, orderId: event.orderId, userId: event.userId, status: "PENDING", payloadHash: payloadHash(event), attempts: 1, lastAttemptAt: new Date() },
    update: { status: "PENDING", attempts: { increment: 1 }, lastAttemptAt: new Date(), errorMessage: "" },
  });
  const userData: Record<string, string> = {};
  if (event.userData?.email) userData.em = hashEmail(event.userData.email);
  if (event.userData?.phone) userData.ph = hashPhone(event.userData.phone);
  if (event.userData?.externalId) userData.external_id = sha256(event.userData.externalId);
  if (event.userData?.ip) userData.client_ip_address = event.userData.ip;
  if (event.userData?.userAgent) userData.client_user_agent = event.userData.userAgent.slice(0, 300);
  if (event.userData?.fbp) userData.fbp = event.userData.fbp;
  if (event.userData?.fbc) userData.fbc = event.userData.fbc;
  const body: Record<string, unknown> = {
    data: [{
      event_name: event.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: event.eventId,
      action_source: "website",
      event_source_url: event.sourceUrl || process.env.NEXT_PUBLIC_SITE_URL || "",
      user_data: userData,
      custom_data: event.customData || {},
    }],
  };
  if (env.testEventCode) body.test_event_code = env.testEventCode;
  try {
    if (process.env.META_SIMULATE_FAILURE === "1") throw new Error("Simulated Meta failure");
    const response = await fetch(`https://graph.facebook.com/${env.version}/${env.datasetId}/events?access_token=${encodeURIComponent(env.token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = safeError(new Error(await response.text()));
      await prisma.metaEvent.update({ where: { id: row.id }, data: { status: "FAILED", errorMessage: text } });
      logError("meta_event", { event: event.eventName, eventId: event.eventId, status: "FAILED" });
      scheduleRetry(event);
      return { status: "FAILED" as const };
    }
    await prisma.metaEvent.update({ where: { id: row.id }, data: { status: "SENT", sentAt: new Date(), errorMessage: "" } });
    logInfo("meta_event", { event: event.eventName, eventId: event.eventId, status: "SENT" });
    return { status: "SENT" as const };
  } catch (error) {
    await prisma.metaEvent.update({ where: { id: row.id }, data: { status: "FAILED", errorMessage: safeError(error) } });
    logError("meta_event", { event: event.eventName, eventId: event.eventId, status: "FAILED" });
    scheduleRetry(event);
    return { status: "FAILED" as const };
  }
}

const retryTimers = new Map<string, ReturnType<typeof setTimeout>>();

function scheduleRetry(event: ServerEvent) {
  const prisma = db();
  if (!prisma || retryTimers.has(event.eventId)) return;
  void prisma.metaEvent.findUnique({ where: { eventId: event.eventId } }).then((row) => {
    if (!row || row.status === "SENT" || row.attempts >= 3) {
      if (row && row.attempts >= 3 && row.status !== "SENT") {
        void prisma.metaEvent.update({ where: { id: row.id }, data: { errorMessage: `${row.errorMessage} | permanently failed`.slice(0, 300) } });
      }
      return;
    }
    const delay = 1000 * 4 ** (row.attempts - 1);
    const timer = setTimeout(() => {
      retryTimers.delete(event.eventId);
      void sendMetaServerEvent(event);
    }, delay);
    retryTimers.set(event.eventId, timer);
  });
}

