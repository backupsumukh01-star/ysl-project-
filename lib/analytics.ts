export type AnalyticsEvent =
  | "page_view"
  | "view_product"
  | "add_to_cart"
  | "remove_from_cart"
  | "begin_checkout"
  | "purchase"
  | "click_buy_now"
  | "click_shop"
  | "view_shades"
  | "view_experience"
  | "payment_started"
  | "payment_success"
  | "payment_failed"
  | "search"
  | "login"
  | "signup"
  | "review_submitted"
  | "support_created";

export function track(event: AnalyticsEvent, props?: Record<string, string | number | boolean | null>) {
  if (typeof window === "undefined") return;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return;
  const win = window as Window & { dataLayer?: unknown[] };
  if (Array.isArray(win.dataLayer)) win.dataLayer.push({ event, ...props });
}
