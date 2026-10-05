import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="page">
      <p className="kicker">404</p>
      <h1>This page is not in the collection.</h1>
      <p className="lede">The address may have changed. The shop is still here.</p>
      <Link className="btn btn-gold" href="/shop">
        Continue shopping
      </Link>
    </main>
  );
}
