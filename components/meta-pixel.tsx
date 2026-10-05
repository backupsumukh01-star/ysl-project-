"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { advertisingAllowed } from "@/lib/analytics/meta";

export function MetaPixel() {
  const pixelId = (process.env.NEXT_PUBLIC_META_PIXEL_ID || "").replace(/[^\d]/g, "");
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(advertisingAllowed());
    sync();
    window.addEventListener("rsm-consent", sync);
    return () => window.removeEventListener("rsm-consent", sync);
  }, []);

  if (!pixelId || !allowed) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      onError={() => undefined}
    >{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;t.onerror=function(){};s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');`}</Script>
  );
}
