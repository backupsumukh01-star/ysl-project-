import type { ReactNode } from "react";
import type { AppDownloadLinks } from "@/lib/app-links";

function AppleBadge() {
  return (
    <svg viewBox="0 0 148 44" aria-hidden="true">
      <rect width="148" height="44" rx="4" fill="#161616" />
      <path fill="#fff" d="M24.7 22.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-.1 2.9-2.2c.7-1.1 1-2.2 1-2.2s-1.9-.7-1.9-2.9zm-1.8-5.3c.6-.8 1.1-1.9.9-3-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.6-1.3z" />
      <text x="40" y="18" fill="#fff" fontFamily="inherit" fontSize="8" letterSpacing="0.4">Download on the</text>
      <text x="40" y="32" fill="#fff" fontFamily="inherit" fontSize="15" fontWeight="500">App Store</text>
    </svg>
  );
}

function PlayBadge() {
  return (
    <svg viewBox="0 0 148 44" aria-hidden="true">
      <rect width="148" height="44" rx="4" fill="#161616" />
      <path fill="#ea4335" d="M16.2 12.2 24.6 22 16.2 31.8c-.5-.3-.8-.9-.8-1.6V13.8c0-.7.3-1.3.8-1.6z" />
      <path fill="#fbbc04" d="M25.2 22.6 27.8 25.2 18.6 30.6 24.6 22l.6.6z" />
      <path fill="#4285f4" d="M27.8 18.8 25.2 21.4 24.6 22 18.6 13.4l9.2 5.4z" />
      <path fill="#34a853" d="M16.2 12.2 24.6 22 18.6 30.6c-.8.5-1.8.4-2.4-.4L16.2 31.8V12.2z" />
      <text x="36" y="18" fill="#fff" fontFamily="inherit" fontSize="8" letterSpacing="0.6">GET IT ON</text>
      <text x="36" y="32" fill="#fff" fontFamily="inherit" fontSize="15" fontWeight="500">Google Play</text>
    </svg>
  );
}

function StoreLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  const ready = Boolean(href);
  return (
    <a
      className="mk-dl__badge"
      href={ready ? href : "#"}
      aria-label={label}
      {...(ready ? { target: "_blank", rel: "noopener noreferrer" } : { onClick: (event: { preventDefault: () => void }) => event.preventDefault() })}
    >
      {children}
    </a>
  );
}

function QrSlot({ svg, label }: { svg: string; label: string }) {
  if (!svg) return null;
  return <div className="mk-dl__qr" role="img" aria-label={`${label} QR code`} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function AppDownload({ links }: { links: AppDownloadLinks }) {
  return (
    <section className="mk-dl" id="the-app" aria-labelledby="app-download-title">
      <div className="mk-dl__grid">
        <div className="mk-dl__copy">
          <p className="mk-dl__rule"><span className="mk-dl__mark">04 / The app</span></p>
          <p className="mk-dl__kicker">Download the app</p>
          <h2 id="app-download-title">Your color, wherever you go.</h2>
          <p className="mk-dl__lede">Create personalized lip colors, explore shades, and experience Rouge Sur Mesure from your phone.</p>
          <div className="mk-dl__compose">
            <p className="mk-dl__band"><span>App</span></p>
            <div className="mk-dl__stage">
              <p className="mk-dl__watermark" aria-hidden="true">Your color</p>
              <div className="mk-dl__pair">
                <div className="mk-dl__store">
                  <p>iPhone</p>
                  <StoreLink href={links.APP_STORE_URL} label="Download on the App Store">
                    <AppleBadge />
                  </StoreLink>
                  <QrSlot svg={links.appStoreQr} label="App Store" />
                  <p className="mk-dl__scan">Scan to download</p>
                </div>
                <div className="mk-dl__split" aria-hidden="true" />
                <div className="mk-dl__store">
                  <p>Android</p>
                  <StoreLink href={links.GOOGLE_PLAY_URL} label="Get it on Google Play">
                    <PlayBadge />
                  </StoreLink>
                  <QrSlot svg={links.googlePlayQr} label="Google Play" />
                  <p className="mk-dl__scan">Scan to download</p>
                </div>
              </div>
            </div>
            <div className="mk-dl__close" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
