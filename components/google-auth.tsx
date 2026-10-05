"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, api } from "@/lib/api-client";

type GoogleAccounts = {
  accounts: {
    id: {
      initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
      renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleAccounts;
  }
}

function loadGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const src = "https://accounts.google.com/gsi/client";
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    const script = existing || document.createElement("script");
    const done = () => (window.google?.accounts?.id ? resolve() : reject(new Error("Google did not load.")));
    script.addEventListener("load", done, { once: true });
    script.addEventListener("error", () => reject(new Error("Google did not load.")), { once: true });
    if (!existing) {
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    } else if (window.google?.accounts?.id) {
      resolve();
    }
  });
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.6 7.1l6.3 5.3C37.4 38.4 44 34 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

export function GoogleAuthChoices({
  onSignedIn,
  onError,
}: {
  onSignedIn: (email: string) => void;
  onError: (message: string) => void;
}) {
  const slot = useRef<HTMLDivElement>(null);
  const signedInRef = useRef(onSignedIn);
  const errorRef = useRef(onError);
  signedInRef.current = onSignedIn;
  errorRef.current = onError;
  const [clientId, setClientId] = useState("");
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancel = false;
    api<{ clientId: string }>("/api/auth/google")
      .then((result) => {
        if (cancel) return;
        if (!result.clientId) {
          setMissing(true);
          return;
        }
        setClientId(result.clientId);
      })
      .catch(() => {
        if (!cancel) setMissing(true);
      });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!clientId || !slot.current) return;
    let cancel = false;
    const parent = slot.current;
    loadGoogleScript()
      .then(() => {
        if (cancel || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            const credential = response.credential || "";
            if (!credential) {
              errorRef.current("Google did not return an account.");
              return;
            }
            api<{ email: string }>("/api/auth/google", {
              method: "POST",
              body: JSON.stringify({ credential }),
            })
              .then((result) => signedInRef.current(result.email))
              .catch((error) => errorRef.current(error instanceof ApiError ? error.message : "Google sign-in could not finish."));
          },
        });
        parent.innerHTML = "";
        window.google.accounts.id.renderButton(parent, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: Math.max(280, Math.round(parent.getBoundingClientRect().width) || 420),
          logo_alignment: "left",
        });
      })
      .catch(() => errorRef.current("Google could not be loaded."));
    return () => {
      cancel = true;
    };
  }, [clientId]);

  if (missing || !clientId) {
    return (
      <button type="button" className="auth-google-btn" onClick={() => onError("Google sign-in is not set up on this store yet.")}>
        <span className="auth-google-btn__mark">
          <GoogleMark />
        </span>
        <span className="auth-google-btn__label">Continue with Google</span>
      </button>
    );
  }

  return <div ref={slot} className="auth-google" />;
}
