"use client";

import { paymentInfoEventId, purchaseEventId, registrationEventId, contactEventId } from "@/lib/analytics/ids";
import { CONSENT_COOKIE, parseConsent } from "@/lib/analytics/consent";

type Content = { id: string; quantity: number; item_price?: number };

export type CommercePayload = {
  contentIds?: string[];
  contentType?: string;
  contentName?: string;
  contents?: Content[];
  value?: number;
  currency?: string;
  quantity?: number;
  numItems?: number;
  searchString?: string;
  eventId?: string;
  orderId?: string;
};

type Fbq = (command: "track" | "trackCustom" | "init", event: string, params?: Record<string, unknown>, options?: { eventID?: string }) => void;

const STANDARD = new Set([
  "PageView",
  "ViewContent",
  "Search",
  "AddToCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
  "Lead",
  "CompleteRegistration",
  "Contact",
]);

function consent() {
  if (typeof document === "undefined") return parseConsent("");
  const match = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${CONSENT_COOKIE}=`));
  return parseConsent(match ? match.slice(CONSENT_COOKIE.length + 1) : "");
}

export function advertisingAllowed() {
  return consent().advertising;
}

export function analyticsAllowed() {
  const choice = consent();
  return choice.analytics || choice.advertising;
}

function fbq(): Fbq | null {
  if (!advertisingAllowed() || !process.env.NEXT_PUBLIC_META_PIXEL_ID) return null;
  const fn = (window as Window & { fbq?: Fbq }).fbq;
  return typeof fn === "function" ? fn : null;
}

function paramsOf(payload: CommercePayload) {
  const params: Record<string, unknown> = {};
  if (payload.contentIds?.length) params.content_ids = payload.contentIds;
  if (payload.contentType) params.content_type = payload.contentType;
  if (payload.contentName) params.content_name = payload.contentName;
  if (payload.contents?.length) params.contents = payload.contents;
  if (payload.value !== undefined) params.value = payload.value;
  if (payload.currency) params.currency = payload.currency;
  if (payload.quantity !== undefined) params.quantity = payload.quantity;
  if (payload.numItems !== undefined) params.num_items = payload.numItems;
  if (payload.searchString) params.search_string = payload.searchString.slice(0, 100);
  if (payload.orderId) params.order_id = payload.orderId;
  return params;
}

function mirror(event: string, payload: CommercePayload) {
  if (!analyticsAllowed() && !advertisingAllowed()) return;
  const body = JSON.stringify({ event, payload, url: window.location.href });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/events", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/analytics/events", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => undefined);
  } catch {
    /* Analytics must not break the page. */
  }
}

function emit(event: string, payload: CommercePayload, options?: { custom?: boolean }) {
  const eventId = payload.eventId || `${event}_${crypto.randomUUID()}`;
  const next = { ...payload, eventId };
  const tracker = fbq();
  if (tracker && advertisingAllowed()) {
    try {
      tracker(options?.custom || !STANDARD.has(event) ? "trackCustom" : "track", event, paramsOf(next), { eventID: eventId });
    } catch {
      /* Pixel failure must not affect commerce. */
    }
  }
  mirror(event, next);
}

let lastPageKey = "";
let visit = 0;
let visitPath = "";
let lastViewKey = "";

function currentVisit(path: string) {
  if (visitPath !== path) {
    visitPath = path;
    visit += 1;
  }
  return visit;
}

export function trackPageViewOnce(key: string) {
  if (!advertisingAllowed() && !analyticsAllowed()) return;
  currentVisit(key.split("?")[0] || key);
  if (lastPageKey === key) return;
  lastPageKey = key;
  emit("PageView", {});
}

export function trackViewContent(payload: CommercePayload) {
  const path = typeof window === "undefined" ? "" : window.location.pathname;
  const key = `${currentVisit(path)}:${payload.contentIds?.[0] || ""}:${payload.contentName || ""}`;
  if (lastViewKey === key) return;
  lastViewKey = key;
  emit("ViewContent", { ...payload, contentType: payload.contentType || "product" });
}

export function trackSearch(searchString: string) {
  const query = searchString.trim().slice(0, 100);
  if (query.length < 2) return;
  emit("Search", { searchString: query });
}

export function trackAddToCart(payload: CommercePayload) {
  emit("AddToCart", { ...payload, contentType: "product" });
}

export function trackRemoveFromCart(payload: CommercePayload) {
  emit("RemoveFromCart", { ...payload, contentType: "product" }, { custom: true });
}

export function trackInitiateCheckout(payload: CommercePayload) {
  emit("InitiateCheckout", { ...payload, contentType: "product" });
}

export function trackAddPaymentInfo(orderId: string, payload: CommercePayload) {
  emit("AddPaymentInfo", { ...payload, eventId: paymentInfoEventId(orderId), orderId, contentType: "product" });
}

export function trackPurchase(payload: CommercePayload & { eventId: string }) {
  emit("Purchase", { ...payload, contentType: "product" });
}

export function trackLead(payload: CommercePayload = {}) {
  emit("Lead", payload);
}

export function trackCompleteRegistration(userId: string) {
  emit("CompleteRegistration", { eventId: registrationEventId(userId) });
}

export function trackContact(ticketId: string) {
  emit("Contact", { eventId: contactEventId(ticketId) });
}

export function trackCustom(event: "HowItWorksViewed" | "DemoVideoPlayed" | "ColorExperienceViewed") {
  emit(event, {}, { custom: true });
}

export function trackInternal(event: "PaymentFailed" | "PaymentCancelled") {
  mirror(event, { eventId: `${event}_${crypto.randomUUID()}` });
}

export function knownPurchaseId(orderId: string) {
  return purchaseEventId(orderId);
}
