import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <main id="main" className="page quiet-page">
      <p className="kicker">Order</p>
      <h1>No confirmation is open.</h1>
      <p className="lede">A finished payment opens its own confirmation. You can also look up an order with its number and email.</p>
      <div className="actions">
        <Link className="btn btn-gold" href="/track-order">
          Track an order
        </Link>
        <Link className="btn btn-ghost" href="/shop">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
