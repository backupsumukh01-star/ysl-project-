export type Touch = {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  fbclid: string;
  landingPage: string;
  referrer: string;
};

export type Attribution = {
  firstTouchSource: string;
  firstTouchMedium: string;
  firstTouchCampaign: string;
  lastTouchSource: string;
  lastTouchMedium: string;
  lastTouchCampaign: string;
  term: string;
  content: string;
  fbclid: string;
  fbc: string;
  fbp: string;
  landingPage: string;
  referrer: string;
};

export const emptyAttribution: Attribution = {
  firstTouchSource: "",
  firstTouchMedium: "",
  firstTouchCampaign: "",
  lastTouchSource: "",
  lastTouchMedium: "",
  lastTouchCampaign: "",
  term: "",
  content: "",
  fbclid: "",
  fbc: "",
  fbp: "",
  landingPage: "",
  referrer: "",
};

export function attributionFromTouch(first: Touch | null, last: Touch | null, fbp = "", fbc = ""): Attribution {
  return {
    firstTouchSource: first?.source || "",
    firstTouchMedium: first?.medium || "",
    firstTouchCampaign: first?.campaign || "",
    lastTouchSource: last?.source || "",
    lastTouchMedium: last?.medium || "",
    lastTouchCampaign: last?.campaign || "",
    term: last?.term || "",
    content: last?.content || "",
    fbclid: last?.fbclid || "",
    fbc,
    fbp,
    landingPage: first?.landingPage || last?.landingPage || "",
    referrer: first?.referrer || "",
  };
}
