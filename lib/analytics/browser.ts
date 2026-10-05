"use client";

import { attributionFromTouch, type Attribution, type Touch } from "@/lib/analytics/attribution";
import { CONSENT_COOKIE, serializeConsent, type ConsentChoice } from "@/lib/analytics/consent";

const FIRST = "rsm_first_touch";
const LAST = "rsm_last_touch";
const SID = "rsm_sid";

function readJson(key: string): Touch | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Touch) : null;
  } catch {
    return null;
  }
}

function cookie(name: string) {
  const match = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

export function captureVisit() {
  const params = new URLSearchParams(window.location.search);
  const touch: Touch = {
    source: (params.get("utm_source") || "").slice(0, 120),
    medium: (params.get("utm_medium") || "").slice(0, 120),
    campaign: (params.get("utm_campaign") || "").slice(0, 120),
    term: (params.get("utm_term") || "").slice(0, 120),
    content: (params.get("utm_content") || "").slice(0, 200),
    fbclid: (params.get("fbclid") || "").slice(0, 200),
    landingPage: `${window.location.pathname}${window.location.search}`.slice(0, 300),
    referrer: document.referrer.slice(0, 300),
  };
  const hasCampaign = Boolean(touch.source || touch.medium || touch.campaign || touch.fbclid);
  if (!localStorage.getItem(FIRST) && (hasCampaign || touch.referrer)) {
    localStorage.setItem(FIRST, JSON.stringify(touch));
  }
  if (hasCampaign) localStorage.setItem(LAST, JSON.stringify(touch));
  if (touch.fbclid) {
    const fbc = `fb.1.${Date.now()}.${touch.fbclid}`;
    document.cookie = `rsm_fbc=${encodeURIComponent(fbc)}; path=/; max-age=7776000; samesite=lax`;
  }
  if (!cookie(SID)) {
    document.cookie = `${SID}=${crypto.randomUUID()}; path=/; max-age=15552000; samesite=lax`;
  }
}

export function readAttribution(): Attribution {
  const first = readJson(FIRST);
  const last = readJson(LAST);
  return attributionFromTouch(first, last, cookie("_fbp"), cookie("rsm_fbc"));
}

export function writeConsent(choice: ConsentChoice) {
  document.cookie = `${CONSENT_COOKIE}=${serializeConsent(choice)}; path=/; max-age=15552000; samesite=lax`;
  window.dispatchEvent(new Event("rsm-consent"));
}

export function openConsent() {
  window.dispatchEvent(new Event("rsm-consent-open"));
}
