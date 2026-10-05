"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" className="page">
      <p className="kicker">Interrupted</p>
      <h1>The page did not finish loading.</h1>
      <p className="lede">This can be a network interruption. Nothing in your bag was changed by this screen.</p>
      <button className="btn btn-gold" type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
