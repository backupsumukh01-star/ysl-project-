export type ConsentChoice = {
  necessary: true;
  analytics: boolean;
  advertising: boolean;
};

export const CONSENT_COOKIE = "rsm_consent";

export const defaultConsent: ConsentChoice = { necessary: true, analytics: false, advertising: false };

export function parseConsent(raw: string | undefined | null): ConsentChoice {
  if (!raw) return defaultConsent;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentChoice>;
    return {
      necessary: true,
      analytics: parsed.analytics === true,
      advertising: parsed.advertising === true,
    };
  } catch {
    return defaultConsent;
  }
}

export function serializeConsent(choice: ConsentChoice) {
  return encodeURIComponent(JSON.stringify({ necessary: true, analytics: choice.analytics, advertising: choice.advertising }));
}

export function consentFromRequest(request: Request): ConsentChoice {
  const header = request.headers.get("cookie") || "";
  const match = header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${CONSENT_COOKIE}=`));
  return parseConsent(match ? match.slice(CONSENT_COOKIE.length + 1) : "");
}

export function canSendMarketingEvent(consent: ConsentChoice) {
  return consent.advertising === true && process.env.META_ENABLED !== "false";
}

export function canRecordAnalytics(consent: ConsentChoice) {
  return consent.analytics === true || consent.advertising === true;
}
