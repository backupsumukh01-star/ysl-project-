import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/app-links";

function AppleBadge() {
  return (
    <svg viewBox="0 0 148 44" role="img" aria-label="Download on the App Store">
      <rect width="148" height="44" rx="7" fill="#161616" />
      <path fill="#fff" d="M30.2 23.2c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9-.8 0-1.9-.9-3.2-.8-1.6.1-3.1 1-3.9 2.4-1.7 2.9-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.7c1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.5 1.3-2.6s-2.5-.9-2.5-3.9zm-2.3-6.3c.7-.8 1.1-2 1-3.1-1 0-2.1.6-2.8 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.1-.5 2.8-1.4z" />
      <text x="46" y="18" fill="#fff" fontFamily="Helvetica, Arial, sans-serif" fontSize="8">Download on the</text>
      <text x="46" y="32" fill="#fff" fontFamily="Helvetica, Arial, sans-serif" fontSize="15" fontWeight="600">App Store</text>
    </svg>
  );
}

function PlayBadge() {
  return (
    <svg viewBox="0 0 156 44" role="img" aria-label="Get it on Google Play">
      <rect width="156" height="44" rx="7" fill="#161616" />
      <path fill="#34a853" d="M13.2 11.6 22.4 22 13.2 32.4c-.7-.4-1.2-1.2-1.2-2.1V13.7c0-.9.5-1.7 1.2-2.1z" />
      <path fill="#fbbc04" d="M22.4 22 25.6 25.2 16.2 30.7 22.4 22z" />
      <path fill="#4285f4" d="M25.6 18.8 22.4 22 16.2 13.3l9.4 5.5z" />
      <path fill="#ea4335" d="M13.2 11.6 22.4 22 16.2 13.3c-.7.4-1.2 1.2-1.2 2.1l-1.8-3.8z" />
      <text x="36" y="18" fill="#fff" fontFamily="Helvetica, Arial, sans-serif" fontSize="8" letterSpacing="0.6">GET IT ON</text>
      <text x="36" y="32" fill="#fff" fontFamily="Helvetica, Arial, sans-serif" fontSize="15" fontWeight="600">Google Play</text>
    </svg>
  );
}

export function StoreBadges({ className = "pdp-stores" }: { className?: string }) {
  return (
    <div className={className}>
      <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
        <AppleBadge />
      </a>
      <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer">
        <PlayBadge />
      </a>
    </div>
  );
}
