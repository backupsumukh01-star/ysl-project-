"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CONSENT_COOKIE, parseConsent } from "@/lib/analytics/consent";

function allowed() {
  const current = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CONSENT_COOKIE}=`));
  const choice = parseConsent(current ? current.slice(CONSENT_COOKIE.length + 1) : "");
  return choice.analytics || choice.advertising;
}

export function VercelMetrics() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(allowed());
    sync();
    window.addEventListener("rsm-consent", sync);
    return () => window.removeEventListener("rsm-consent", sync);
  }, []);

  if (!on) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
