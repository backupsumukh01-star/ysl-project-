import { NextResponse } from "next/server";
import { consentFromRequest } from "@/lib/analytics/consent";
import { acceptBrowserEvent } from "@/lib/analytics/ingest";

export const dynamic = "force-dynamic";

const allowed = new Set([
  "PageView",
  "ViewContent",
  "Search",
  "AddToCart",
  "RemoveFromCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
  "Lead",
  "CompleteRegistration",
  "Contact",
  "HowItWorksViewed",
  "DemoVideoPlayed",
  "ColorExperienceViewed",
  "PaymentFailed",
  "PaymentCancelled",
]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { event?: string; payload?: { eventId?: string }; url?: string };
    if (!body?.event || !allowed.has(body.event)) return new NextResponse(null, { status: 204 });
    await acceptBrowserEvent(request, body, consentFromRequest(request));
  } catch {
    /* Never fail the browser because analytics could not be stored. */
  }
  return new NextResponse(null, { status: 204 });
}
