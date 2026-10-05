import Link from "next/link";

export function PageBack({ href, children }: { href: string; children: string }) {
  return (
    <Link className="page-back" href={href}>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M10 3.5 5.5 8 10 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </Link>
  );
}
