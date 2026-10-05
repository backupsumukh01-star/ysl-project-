"use client";

import { useEffect, useState } from "react";
import { CONSENT_COOKIE, parseConsent, type ConsentChoice } from "@/lib/analytics/consent";
import { openConsent, writeConsent } from "@/lib/analytics/browser";

function saved() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${CONSENT_COOKIE}=`));
}

export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [manage, setManage] = useState(false);
  const [choice, setChoice] = useState<ConsentChoice>({ necessary: true, analytics: false, advertising: false });

  useEffect(() => {
    setOpen(!saved());
    const show = () => {
      const current = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${CONSENT_COOKIE}=`));
      setChoice(parseConsent(current ? current.slice(CONSENT_COOKIE.length + 1) : ""));
      setManage(true);
      setOpen(true);
    };
    window.addEventListener("rsm-consent-open", show);
    return () => window.removeEventListener("rsm-consent-open", show);
  }, []);

  if (!open) return null;

  function accept(next: ConsentChoice) {
    writeConsent(next);
    setOpen(false);
    setManage(false);
  }

  return (
    <div className="consent-banner" role="dialog" aria-labelledby="consent-title">
      <div className="consent-copy">
        <p id="consent-title">Privacy</p>
        <p>Necessary cookies keep the shop, bag, and checkout working. Analytics and advertising stay off unless you allow them.</p>
        {manage ? (
          <div className="consent-options">
            <label>
              <input type="checkbox" checked disabled /> Necessary
            </label>
            <label>
              <input type="checkbox" checked={choice.analytics} onChange={(event) => setChoice((current) => ({ ...current, analytics: event.target.checked }))} /> Analytics
            </label>
            <label>
              <input type="checkbox" checked={choice.advertising} onChange={(event) => setChoice((current) => ({ ...current, advertising: event.target.checked }))} /> Advertising
            </label>
          </div>
        ) : null}
      </div>
      <div className="consent-actions">
        <button type="button" onClick={() => accept({ necessary: true, analytics: true, advertising: true })}>
          Accept
        </button>
        <button type="button" onClick={() => accept({ necessary: true, analytics: false, advertising: false })}>
          Decline
        </button>
        {manage ? (
          <button type="button" onClick={() => accept(choice)}>
            Save
          </button>
        ) : (
          <button type="button" onClick={() => setManage(true)}>
            Manage
          </button>
        )}
      </div>
    </div>
  );
}

export function PrivacyChoices() {
  return (
    <button className="text-btn" type="button" onClick={() => openConsent()}>
      Privacy choices
    </button>
  );
}
