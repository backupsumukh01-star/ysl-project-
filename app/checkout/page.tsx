"use client";

import { FormEvent, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkoutLinePayload, lineKey, useCart, type CartLine } from "@/components/cart-provider";
import { GoogleAuthChoices } from "@/components/google-auth";
import { CartLineImage } from "@/components/refill-mark";
import { CheckoutAddress } from "@/components/checkout-address";
import { useMarket, useMoney } from "@/components/market";
import { bagShelf } from "@/components/bag-quote";
import { siteConfig } from "@/lib/config";
import { formatMoney, shippingChargeLabel } from "@/lib/product";
import { trackAddPaymentInfo, trackInitiateCheckout, trackInternal } from "@/lib/analytics/meta";
import { readAttribution } from "@/lib/analytics/browser";
import { ApiError, api } from "@/lib/api-client";
import "./checkout.css";

type RazorpayHandler = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayCheckout = { open: () => void };
type RazorpayWindow = Window & { Razorpay?: new (options: Record<string, unknown>) => RazorpayCheckout };

const seenCheckout = new Set<string>();

type ServerQuote = {
  currency: string;
  lines: { productId: string; variantId: string; name: string; variantName: string; quantity: number; unit: number | null }[];
  subtotal: number;
  discount: number;
  shipping: number | null;
  tax: number;
  total: number | null;
  shippingConfigured: boolean;
  taxConfigured: boolean;
  shippingEstimate: string;
};

function idempotencyKeyFor(items: { id: string; variantId?: string; variantName?: string; quantity: number }[]) {
  const signature = items
    .map((item) => `${item.id}:${item.variantId || ""}:${item.variantName || ""}:${item.quantity}`)
    .sort()
    .join("|");
  const storageKey = `rsm-checkout:${signature}`;
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;
  const next = crypto.randomUUID();
  sessionStorage.setItem(storageKey, next);
  return next;
}

export default function CheckoutPage() {
  const { items, ready, clear } = useCart();
  const market = useMarket();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const [message, setMessage] = useState("");
  const [configured, setConfigured] = useState(false);
  const [paymentsReady, setPaymentsReady] = useState(false);
  const [email, setEmail] = useState("");
  const [coupon, setCoupon] = useState("");
  const [country, setCountry] = useState("");
  const onCountry = useCallback((name: string) => setCountry(name), []);
  const [quote, setQuote] = useState<ServerQuote | null>(null);
  const [quoteNotice, setQuoteNotice] = useState("");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [guest, setGuest] = useState(false);
  const [accountMode, setAccountMode] = useState<"register" | "login">("register");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountPending, setAccountPending] = useState(false);

  useEffect(() => {
    if (!ready || !items.length) return;
    const signature = items.map((item) => `${item.id}:${item.quantity}`).join("|");
    if (seenCheckout.has(signature)) return;
    seenCheckout.add(signature);
    const priced = items.every((item) => item.price != null);
    trackInitiateCheckout({
      contentIds: items.map((item) => item.id),
      contents: items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        ...(item.price != null ? { item_price: item.price } : {}),
      })),
      numItems: items.reduce((sum, item) => sum + item.quantity, 0),
      ...(priced
        ? { value: items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0), currency: siteConfig.currency }
        : {}),
    });
  }, [ready, items]);

  useEffect(() => {
    api<{ configured: boolean }>("/api/payments/config")
      .then((result) => setConfigured(result.configured))
      .catch(() => setConfigured(false))
      .finally(() => setPaymentsReady(true));
    api<{ user: { email: string } | null }>("/api/auth/session")
      .then((result) => {
        setEmail(result.user?.email || "");
        setSignedIn(Boolean(result.user));
      })
      .catch(() => setSignedIn(false));
  }, []);

  useEffect(() => {
    if (!ready || !items.length) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      api<ServerQuote>("/api/checkout/quote", {
        method: "POST",
        body: JSON.stringify({
          couponCode: coupon,
          ...(country ? { country } : {}),
          lines: checkoutLinePayload(items),
        }),
      })
        .then((result) => {
          if (cancelled) return;
          setQuote(result);
          setQuoteNotice("");
        })
        .catch((error) => {
          if (cancelled) return;
          setQuoteNotice(error instanceof ApiError ? error.message : "That code could not be applied.");
        });
    }, coupon.trim() ? 400 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ready, items, coupon, country]);

  useEffect(() => {
    const payment = new URLSearchParams(window.location.search).get("payment");
    if (payment === "cancelled") setMessage("Payment was cancelled. Your items are still in your bag.");
    if (payment === "failed") setMessage("Payment wasn't completed. Your bag is still saved.");
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length || pendingRef.current || !quote?.shippingConfigured || !configured) return;
    pendingRef.current = true;
    if (items.some((item) => item.price == null)) {
      pendingRef.current = false;
      setMessage("A price has not been confirmed yet, so payment cannot start.");
      return;
    }
    const data = new FormData(event.currentTarget);
    setPending(true);
    setMessage(configured ? "Opening secure payment." : "");
    try {
      const order = await api<{
        orderId: string;
        amountMinor: number;
        currency: string;
        razorpayOrderId: string;
        keyId: string;
        total: number | null;
      }>("/api/payments/create-order", {
        method: "POST",
        body: JSON.stringify({
          idempotencyKey: idempotencyKeyFor(items),
          couponCode: coupon,
          lines: checkoutLinePayload(items),
          address: {
            email: String(data.get("email") || ""),
            phone: String(data.get("phone") || ""),
            name: String(data.get("name") || ""),
            line1: String(data.get("address") || ""),
            line2: String(data.get("address2") || ""),
            city: String(data.get("city") || ""),
            region: String(data.get("state") || ""),
            postcode: String(data.get("postcode") || ""),
            country: String(data.get("country") || siteConfig.defaultCountry),
          },
          attribution: readAttribution(),
        }),
      });
      if (!order.razorpayOrderId) {
        pendingRef.current = false;
        setPending(false);
        setMessage("Payment is temporarily unavailable. No charge was made.");
        return;
      }
      trackAddPaymentInfo(order.orderId, {
        contentIds: items.map((item) => item.id),
        contents: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          ...(item.price != null ? { item_price: item.price } : {}),
        })),
        numItems: items.reduce((sum, item) => sum + item.quantity, 0),
        ...(order.total != null ? { value: order.total, currency: order.currency } : { currency: order.currency }),
      });
      const Razorpay = await loadRazorpay();
      const checkout = new Razorpay({
        key: order.keyId,
        amount: order.amountMinor,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: "Rouge Sur Mesure",
        description: "Order payment",
        prefill: { email: String(data.get("email") || ""), contact: String(data.get("phone") || ""), name: String(data.get("name") || "") },
        handler: async (response: RazorpayHandler) => {
          try {
            const verified = await api<{ duplicate?: boolean; purchase?: { eventId: string } }>("/api/payments/verify", {
              method: "POST",
              body: JSON.stringify({ orderId: order.orderId, ...response }),
            });
            if (!verified.duplicate && verified.purchase) {
              sessionStorage.setItem(`rsm_purchase_${order.orderId}`, JSON.stringify(verified.purchase));
            }
            clear();
            router.push(`/order-success/${order.orderId}`);
          } catch {
            trackInternal("PaymentFailed", order.orderId);
            pendingRef.current = false;
            setPending(false);
            setMessage("We couldn't confirm this payment. Your bag is still saved.");
          }
        },
        modal: {
          ondismiss: () => {
            trackInternal("PaymentCancelled", order.orderId);
            pendingRef.current = false;
            setPending(false);
            setMessage("Payment was cancelled. Your items are still in your bag.");
          },
        },
      });
      checkout.open();
    } catch (error) {
      pendingRef.current = false;
      setPending(false);
      setMessage(error instanceof ApiError ? error.message : "Checkout could not start. Your bag is still saved.");
    }
  }

  if (!ready) {
    return (
      <main id="main" className="page pay-page">
        <p className="kicker">Checkout</p>
        <h1>Checkout</h1>
        <p className="muted">Loading your bag.</p>
      </main>
    );
  }

  async function onAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (accountPending) return;
    setAccountPending(true);
    setAccountError("");
    try {
      const result = await api<{ email: string }>("/api/auth/password", {
        method: "POST",
        body: JSON.stringify({ mode: accountMode, email: accountEmail, password: accountPassword }),
      });
      setEmail(result.email);
      setSignedIn(true);
    } catch (error) {
      setAccountError(error instanceof ApiError ? error.message : "The account could not be saved.");
    } finally {
      setAccountPending(false);
    }
  }

  if (!items.length) {
    return (
      <main id="main" className="page pay-page">
        <p className="kicker">Checkout</p>
        <h1>Checkout</h1>
        <p>Your bag is empty, so there is nothing to place.</p>
        <Link className="btn btn-gold" href="/shop">
          Shop
        </Link>
      </main>
    );
  }

  if (signedIn === null) {
    return (
      <main id="main" className="page pay-page">
        <p className="kicker">Checkout</p>
        <h1>Checkout</h1>
        <p className="muted">Checking your account.</p>
      </main>
    );
  }

  if (!signedIn && !guest) {
    return (
      <main id="main" className="page pay-page">
        <header className="pay-top">
          <p className="kicker">Secure checkout</p>
          <h1>Checkout</h1>
          <PaySteps current={1} />
        </header>
        <div className="checkout-grid">
          <section className="pay-card">
            <h2>{accountMode === "register" ? "Create an account" : "Sign in"}</h2>
            <p className="pay-card__note">Continue as a guest, with Google, or with your email and a password. Shipping details open next.</p>
            <button
              type="button"
              className="btn btn-full pay-guest"
              onClick={() => {
                const typed = accountEmail.trim();
                if (typed) setEmail(typed);
                setGuest(true);
              }}
            >
              Continue as guest
            </button>
            <p className="auth-or"><span>or</span></p>
            <GoogleAuthChoices
              onSignedIn={(nextEmail) => {
                setEmail(nextEmail);
                setSignedIn(true);
              }}
              onError={setAccountError}
            />
            {accountError ? <p className="notice">{accountError}</p> : null}
            <p className="auth-or"><span>or</span></p>
            <form className="pay-account" onSubmit={onAccount}>
              <Field name="account-email" label="Email" type="email" autoComplete="email" value={accountEmail} onChange={setAccountEmail} />
              <Field name="account-password" label="Password" type="password" autoComplete={accountMode === "register" ? "new-password" : "current-password"} value={accountPassword} onChange={setAccountPassword} />
              <button className="btn btn-gold btn-full" type="submit" disabled={accountPending}>
                {accountPending ? "Saving" : accountMode === "register" ? "Create account" : "Sign in"}
              </button>
            </form>
            {accountMode === "login" ? (
              <button
                type="button"
                className="pay-switch"
                disabled={accountPending}
                onClick={async () => {
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail.trim())) {
                    setAccountError("Enter the email on the account, then use Forgot password.");
                    return;
                  }
                  setAccountPending(true);
                  setAccountError("");
                  try {
                    await api("/api/auth/password-reset", { method: "POST", body: JSON.stringify({ email: accountEmail.trim() }) });
                    setAccountError("If that email has an account, a reset link is on its way.");
                  } catch (error) {
                    setAccountError(error instanceof ApiError ? error.message : "The reset link could not be sent.");
                  } finally {
                    setAccountPending(false);
                  }
                }}
              >
                Forgot password
              </button>
            ) : null}
            <button
              type="button"
              className="pay-switch"
              onClick={() => {
                setAccountMode(accountMode === "register" ? "login" : "register");
                setAccountError("");
              }}
            >
              {accountMode === "register" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </section>
          <OrderSummary items={items} quote={quote} />
        </div>
      </main>
    );
  }

  const checking = !quote || !paymentsReady;

  if (checking) {
    return (
      <main id="main" className="page pay-page">
        <p className="kicker">Checkout</p>
        <h1>Checkout</h1>
        <p className="muted">Checking whether checkout can open.</p>
      </main>
    );
  }

  return (
    <main id="main" className="page pay-page">
      <header className="pay-top">
        <p className="kicker">Secure checkout</p>
        <h1>Checkout</h1>
        <PaySteps current={2} />
      </header>
      {!configured ? <p className="notice">Payment is temporarily unavailable. No charge will be made.</p> : null}
      {message ? <p className="notice">{message}</p> : null}
      <form id="checkout" className="checkout-grid" onSubmit={onSubmit} noValidate>
        <div className="pay-card">
          <h2>Contact</h2>
          {guest ? (
            <Field name="email" label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
          ) : (
            <Field key={email || "account-email"} name="email" label="Email" type="email" autoComplete="email" defaultValue={email} readOnly />
          )}
          <CheckoutAddress
            defaultCountry={market.country || siteConfig.defaultCountry}
            coupon={coupon}
            onCoupon={setCoupon}
            shippingMessage={siteConfig.shippingMessage}
            shippingEstimate={quote?.shippingEstimate}
            couponNotice={quoteNotice}
            onCountry={onCountry}
          />
        </div>
        <div className="checkout-pay">
          <p>Continues in a secure payment window</p>
          <button className="btn btn-gold btn-full" type="submit" disabled={pending || !quote?.shippingConfigured || !configured}>
            {pending ? "Opening secure payment" : !quote?.shippingConfigured ? "Checkout unavailable" : configured ? `Pay ${formatMoney(quote.total, quote.currency)}` : "Payment unavailable"}
          </button>
        </div>
        <OrderSummary items={items} quote={quote} pay={(
          <>
          <button className="btn btn-gold btn-full" type="submit" disabled={pending || !quote?.shippingConfigured || !configured}>
            {pending ? "Opening secure payment" : !quote?.shippingConfigured ? "Checkout unavailable" : configured ? `Pay ${formatMoney(quote.total, quote.currency)}` : "Payment unavailable"}
          </button>
          <p className="muted">
            <Link href="/cart">Return to bag</Link>
            {" · "}
            <Link href="/contact">Contact support</Link>
          </p>
          </>
        )} />
      </form>
    </main>
  );
}

function PaySteps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Account", "Details", "Payment"];
  return (
    <ol className="pay-steps">
      {steps.map((label, index) => {
        const step = index + 1;
        return (
          <li key={label} className={step < current ? "is-done" : step === current ? "is-on" : undefined} aria-current={step === current ? "step" : undefined}>
            <span>{String(step).padStart(2, "0")}</span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}

function lineAmount(item: CartLine, quote: ServerQuote | null) {
  const match = quote?.lines.find((line) => line.productId === item.id && (line.variantId || "") === (item.variantId || "") && (line.variantName || "") === (item.variantName || ""));
  if (match?.unit == null || !quote) return "—";
  return formatMoney(match.unit * item.quantity, quote.currency);
}

function OrderSummary({ items, quote, pay }: { items: CartLine[]; quote: ServerQuote | null; pay?: ReactNode }) {
  const market = useMarket();
  const money = useMoney();
  const shelf = bagShelf(market.currency, money, items, quote);
  const shippingKnown = quote?.shippingConfigured === true && quote.shipping != null;
  const [orderOpen, setOrderOpen] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 900px)");
    const apply = () => {
      if (media.matches) setOrderOpen(true);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  const totalLabel = shippingKnown && quote?.total != null ? formatMoney(quote.total, quote.currency) : "";
  return (
    <aside className="pay-summary">
      <details
        className="pay-summary__fold"
        open={orderOpen}
        onToggle={(event) => setOrderOpen(event.currentTarget.open)}
      >
        <summary>
          <span>Your order</span>
          {totalLabel ? <span className="pay-summary__peek">{totalLabel}</span> : null}
        </summary>
        <div className="pay-summary__body">
      <ul className="pay-order">
        {items.map((item) => (
          <li key={lineKey(item)}>
            <span className="pay-order__shot">
              <CartLineImage slug={item.slug} image={item.image} label={item.variantName} size={160} />
            </span>
            <span>
              <strong>{item.name}</strong>
              {item.variantName ? (
                <em className="pay-order__shades">
                  {item.variantName.split(" · ").map((shade, index) => (
                    <span key={shade}>
                      {index > 0 ? <span aria-hidden="true"> · </span> : null}
                      {shade}
                    </span>
                  ))}
                </em>
              ) : null}
              <em>Qty {item.quantity}</em>
            </span>
            <span className="pay-order__price">{lineAmount(item, quote)}</span>
          </li>
        ))}
      </ul>
      <div className="totals bag-sums">
        {shelf.mrp ? (
          <div>
            <span>Total MRP</span>
            <span>{shelf.mrp}</span>
          </div>
        ) : (
          <div>
            <span>Subtotal</span>
            <span>{quote ? formatMoney(quote.subtotal, quote.currency) : "Calculating"}</span>
          </div>
        )}
        {shelf.discount ? (
          <div>
            <span>Discount</span>
            <span className="bag-sums__off">{shelf.discount}</span>
          </div>
        ) : null}
        {shelf.coupon ? (
          <div>
            <span>Coupon</span>
            <span className="bag-sums__off">{shelf.coupon}</span>
          </div>
        ) : null}
        <div>
          <span>Shipping</span>
          <span>{!quote ? "Confirming" : shippingKnown ? shippingChargeLabel(quote.shipping, quote.currency) : "Not published"}</span>
        </div>
        <div>
          <span>Tax</span>
          <span>{quote?.taxConfigured ? formatMoney(quote.tax, quote.currency) : quote ? "Not set" : "Calculating"}</span>
        </div>
        <div>
          <span>Total</span>
          <span>{shippingKnown && quote?.total != null ? formatMoney(quote.total, quote.currency) : "—"}</span>
        </div>
      </div>
      {shelf.saving ? <p className="bag-sums__saving">You&apos;re saving {shelf.saving} on this order</p> : null}
      {pay}
      {pay ? null : (
        <p className="muted">
          <Link href="/cart">Return to bag</Link>
        </p>
      )}
        </div>
      </details>
    </aside>
  );
}

function Field({
  name,
  label,
  type = "text",
  autoComplete,
  defaultValue,
  value,
  onChange,
  readOnly = false,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={onChange ? undefined : defaultValue}
        value={onChange ? value : undefined}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        readOnly={readOnly}
        required
        minLength={type === "password" ? 8 : undefined}
      />
    </label>
  );
}

function loadRazorpay() {
  const win = window as RazorpayWindow;
  if (win.Razorpay) return Promise.resolve(win.Razorpay);
  return new Promise<NonNullable<RazorpayWindow["Razorpay"]>>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => (win.Razorpay ? resolve(win.Razorpay) : reject(new Error("Razorpay did not load.")));
    script.onerror = () => reject(new Error("Razorpay did not load."));
    document.body.appendChild(script);
  });
}
