"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api-client";
import { formatMoney } from "@/lib/product";
import { useCart } from "@/components/cart-provider";
import { GoogleAuthChoices } from "@/components/google-auth";
import { track } from "@/lib/analytics";
import { trackCompleteRegistration } from "@/lib/analytics/meta";

type User = { email: string; name: string; phone: string; marketingEmail?: boolean };
type OrderCard = {
  id: string;
  number: string;
  status: string;
  paymentStatus: string;
  total: number | null;
  currency: string;
  createdAt: string;
  items: { name: string; quantity: number; sku?: string }[];
};

export function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [codeOpen, setCodeOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [resetPending, setResetPending] = useState(false);
  const [message, setMessage] = useState("");

  function finish() {
    track(mode === "register" ? "signup" : "login");
    router.push("/account");
    router.refresh();
  }

  async function onPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "");
    const password = String(data.get("password") || "");
    setPending(true);
    setMessage("");
    try {
      await api("/api/auth/password", { method: "POST", body: JSON.stringify({ mode, email, password }) });
      finish();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "The account could not be saved.");
      setPending(false);
    }
  }

  async function onReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("reset-email") || "");
    setResetPending(true);
    setMessage("");
    try {
      await api("/api/auth/password-reset", { method: "POST", body: JSON.stringify({ email }) });
      setMessage("If that email has an account, a reset link is on its way.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "The reset link could not be sent.");
    } finally {
      setResetPending(false);
    }
  }

  async function onCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("code-email") || "");
    setPending(true);
    setMessage("");
    try {
      await api("/api/auth/otp", { method: "POST", body: JSON.stringify({ email }) });
      track("login");
      router.push(`/account/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "The code could not be sent.");
      setPending(false);
    }
  }

  return (
    <div className="account-auth">
      <p className="kicker">Account</p>
      <h1>{mode === "register" ? "Create an account" : "Sign in"}</h1>
      <p className="lede">Continue with Google, or use your email and a password.</p>
      <GoogleAuthChoices onSignedIn={finish} onError={setMessage} />
      <p className="auth-or"><span>or</span></p>
      <div className="account-mode" role="tablist" aria-label="Account">
        <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "is-on" : undefined} onClick={() => { setMode("register"); setMessage(""); }}>
          Create account
        </button>
        <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "is-on" : undefined} onClick={() => { setMode("login"); setMessage(""); }}>
          Sign in
        </button>
      </div>
      {message ? <p className="notice" role="status">{message}</p> : null}
      <form onSubmit={onPassword} className="stack-form">
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={8} required />
        </label>
        {mode === "login" ? (
          <button type="button" className="auth-code" onClick={() => { setResetOpen((open) => !open); setMessage(""); }}>
            Forgot password
          </button>
        ) : null}
        <button className="btn btn-gold" type="submit" disabled={pending}>
          {pending ? "Saving" : mode === "register" ? "Create account" : "Sign in"}
        </button>
      </form>
      {mode === "login" && resetOpen ? (
        <form onSubmit={onReset} className="stack-form account-auth__extra">
          <label className="field">
            <span>Email</span>
            <input name="reset-email" type="email" autoComplete="email" required />
          </label>
          <button className="btn btn-dark" type="submit" disabled={resetPending}>
            {resetPending ? "Sending" : "Send reset link"}
          </button>
        </form>
      ) : null}
      <div className="account-auth__alt">
        <p className="auth-or"><span>or</span></p>
        <button type="button" className="auth-code" onClick={() => { setCodeOpen((open) => !open); setMessage(""); }}>
          Email me a code
        </button>
        {codeOpen ? (
          <form onSubmit={onCode} className="stack-form">
            <label className="field">
              <span>Email</span>
              <input name="code-email" type="email" autoComplete="email" required />
            </label>
            <button className="btn btn-dark" type="submit" disabled={pending}>
              {pending ? "Sending code" : "Send code"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export function VerifyScreen({ email }: { email: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") || "");
    setPending(true);
    try {
      const result = await api<{ created?: boolean; userId?: string }>("/api/auth/verify", { method: "POST", body: JSON.stringify({ email, code }) });
      if (result.created && result.userId) trackCompleteRegistration(result.userId);
      else track("login");
      const saved = localStorage.getItem("rsm-wishlist");
      if (saved) {
        const items = JSON.parse(saved) as { id?: string; productId?: string; variantId?: string }[];
        await api("/api/wishlist", {
          method: "PUT",
          body: JSON.stringify({ items: items.map((item) => ({ productId: item.productId || item.id || "", variantId: item.variantId || "" })).filter((item) => item.productId) }),
        }).catch(() => undefined);
      }
      router.push("/account");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "That code was not accepted.");
      setPending(false);
    }
  }

  return (
    <>
      <p className="kicker">Account</p>
      <h1>Enter your code</h1>
      <p>Sent to {email || "your email"}. The code is not shown on this page.</p>
      <form onSubmit={onSubmit} className="stack-form">
        <label className="field">
          <span>Code</span>
          <input name="code" inputMode="numeric" autoComplete="one-time-code" required />
        </label>
        <button className="btn btn-gold" type="submit" disabled={pending}>
          {pending ? "Checking" : "Verify"}
        </button>
      </form>
      {message ? <p className="notice">{message}</p> : null}
    </>
  );
}

export function DashboardScreen() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [orders, setOrders] = useState<OrderCard[]>([]);

  useEffect(() => {
    api<{ user: User | null }>("/api/auth/session").then((result) => setUser(result.user)).catch(() => setUser(null));
    api<{ orders: OrderCard[] }>("/api/orders")
      .then((result) => setOrders(result.orders))
      .catch(() => setOrders([]));
  }, []);

  if (user === undefined) return <p>Loading.</p>;
  if (!user) {
    return (
      <>
        <p className="kicker">Account</p>
        <h1>Account</h1>
        <p className="lede">Sign in to see orders and saved details.</p>
        <Link className="btn btn-gold" href="/account/login">
          Sign in
        </Link>
      </>
    );
  }

  const order = orders[0];
  return (
    <>
      <h1>{user.name || "Your account"}</h1>
      <p className="lede">{user.email}</p>
      {order ? (
        <article className="order-card">
          <h2>Order {order.number}</h2>
          <p>{statusLine(order.status, order.paymentStatus)}</p>
          <p className="order-card__total">{formatMoney(order.total, order.currency)}</p>
          <p className="order-links">
            <Link href={`/account/orders/${order.id}`}>View order</Link>
            {" · "}
            <Link href={`/invoice/${order.id}`}>Download invoice</Link>
          </p>
        </article>
      ) : (
        <div className="account-empty">
          <p>Orders appear here after payment.</p>
          <Link className="btn btn-gold" href="/shop">Shop the collection</Link>
        </div>
      )}
    </>
  );
}

const STATUS_LABELS: Record<string, string> = {
  PAID: "Paid",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  PENDING: "Pending",
  PENDING_PAYMENT: "Awaiting payment",
  UNPAID: "Unpaid",
  FAILED: "Failed",
  PARTIALLY_REFUNDED: "Partially refunded",
};

function statusLine(status: string, payment: string) {
  const order = orderStatusLabel(status);
  const paid = paymentLabel(payment);
  if (order === paid) return order;
  if (status === "PENDING" || status === "PENDING_PAYMENT") return paid;
  return `${order} · ${paid}`;
}

export function orderStatusLabel(status: string) {
  return STATUS_LABELS[status] || status;
}

export function paymentLabel(status: string) {
  return STATUS_LABELS[status] || status;
}

const ORDER_FLOW = ["PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED"];

export function OrdersScreen() {
  const [orders, setOrders] = useState<OrderCard[] | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<{ orders: OrderCard[] }>("/api/orders")
      .then((result) => setOrders(result.orders))
      .catch((error) => setMessage(error instanceof ApiError ? error.message : "Orders could not be loaded."));
  }, []);

  return (
    <>
      <h1>Orders</h1>
      {message ? <p className="notice">{message}</p> : null}
      {message?.startsWith("Sign in") ? (
        <Link className="btn btn-gold" href="/account/login">
          Sign in
        </Link>
      ) : null}
      {orders && !orders.length ? (
        <div className="account-empty">
          <p className="lede">Nothing has been paid yet.</p>
          <Link className="btn btn-gold" href="/shop">Shop the collection</Link>
        </div>
      ) : null}
      {orders?.map((order) => (
        <article className="order-card" key={order.id}>
          <h2>Order {order.number}</h2>
          <p>{new Date(order.createdAt).toLocaleDateString()}</p>
          <p>{statusLine(order.status, order.paymentStatus)}</p>
          <p className="order-card__total">{formatMoney(order.total, order.currency)}</p>
          <p>{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p>
          <p className="order-links">
            <Link href={`/account/orders/${order.id}`}>View order</Link>
            {" · "}
            <Link href={`/invoice/${order.id}`}>Download invoice</Link>
          </p>
        </article>
      ))}
    </>
  );
}

type OrderDetailData = Omit<OrderCard, "items"> & {
  name: string;
  email: string;
  phone: string;
  razorpayPaymentId: string;
  address: { line1: string; line2?: string; city: string; region: string; postcode: string; country: string } | null;
  courier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  deliveryEstimate?: string;
  items: { productId: string; variantId: string; name: string; sku: string; variantName: string; quantity: number; unit: number | null; available: boolean; slug: string }[];
};

export function OrderDetailScreen({ id }: { id: string }) {
  const { addItem, openDrawer } = useCart();
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    api<{ order: OrderDetailData }>(`/api/orders/${id}`)
      .then((result) => setOrder(result.order))
      .catch((error) => setMessage(error instanceof ApiError ? error.message : "That order was not found."));
  }, [id]);

  if (!order) {
    return (
      <>
        <h1>Order</h1>
        <p>{message || "Loading order."}</p>
      </>
    );
  }

  const stepIndex = ORDER_FLOW.indexOf(order.status);

  return (
    <>
      <h1>Order {order.number}</h1>
      <p className="lede">{new Date(order.createdAt).toLocaleDateString()} · {paymentLabel(order.paymentStatus)}</p>
      {stepIndex >= 0 ? (
        <ol className="order-steps">
          {ORDER_FLOW.map((step, index) => (
            <li key={step} data-state={index < stepIndex ? "done" : index === stepIndex ? "current" : "waiting"}>
              {orderStatusLabel(step)}
            </li>
          ))}
        </ol>
      ) : (
        <p>{orderStatusLabel(order.status)}</p>
      )}
      {order.courier || order.trackingNumber ? (
        <p>
          {order.courier} {order.trackingNumber} {order.deliveryEstimate}
          {order.trackingUrl ? <a href={order.trackingUrl}> Tracking</a> : null}
        </p>
      ) : (
        <p className="muted">A courier and tracking number have not been added.</p>
      )}
      <p className="order-card__total">{formatMoney(order.total, order.currency)}</p>
      {order.razorpayPaymentId ? <p>Payment reference: {order.razorpayPaymentId}</p> : null}
      {order.items.map((item) => (
        <article className="order-piece" key={`${item.productId}-${item.variantId}`}>
          <h2>{item.name}</h2>
          <p>
            {item.variantName} {item.sku} × {item.quantity} · {formatMoney(item.unit, order.currency)}
          </p>
          {item.available ? (
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                addItem({
                  id: item.productId,
                  slug: item.slug,
                  name: item.name,
                  price: item.unit,
                  sku: item.sku,
                  variantId: item.variantId,
                  variantName: item.variantName,
                  quantity: item.quantity,
                });
                openDrawer();
              }}
            >
              Buy again
            </button>
          ) : (
            <p className="muted">Unavailable</p>
          )}
          {order.paymentStatus === "PAID" ? (
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  await api("/api/reviews", {
                    method: "POST",
                    body: JSON.stringify({ productId: item.productId, orderId: order.id, rating, comment, title: "" }),
                  });
                  track("review_submitted");
                  setMessage("Review submitted. It stays private until it is approved.");
                } catch (error) {
                  setMessage(error instanceof ApiError ? error.message : "The review was not saved.");
                }
              }}
            >
              <label className="field">
                <span>Rating</span>
                <input type="number" min={1} max={5} value={rating} onChange={(event) => setRating(Number(event.target.value))} />
              </label>
              <label className="field">
                <span>Review</span>
                <textarea value={comment} onChange={(event) => setComment(event.target.value)} required />
              </label>
              <button className="btn btn-ghost" type="submit">
                Submit review
              </button>
            </form>
          ) : null}
        </article>
      ))}
      {order.address ? (
        <p>
          {order.address.line1}
          {order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.region} {order.address.postcode}, {order.address.country}
        </p>
      ) : null}
      <p className="order-links">
        <Link href={`/invoice/${order.id}`}>Download invoice</Link>
        {" · "}
        <Link href={`/account/orders/${order.id}/return`}>Request a return</Link>
        {" · "}
        <Link href={`/contact?order=${order.number}`}>Contact support</Link>
      </p>
      {["PAID", "PROCESSING", "PACKED"].includes(order.status) ? (
        <button
          className="btn btn-ghost"
          type="button"
          onClick={async () => {
            try {
              const result = await api<{ message: string }>(`/api/orders/${order.id}/cancel`, { method: "POST" });
              setMessage(result.message);
              setOrder({ ...order, status: "CANCELLED" });
            } catch (error) {
              setMessage(error instanceof ApiError ? error.message : "The order was not cancelled.");
            }
          }}
        >
          Request cancellation
        </button>
      ) : null}
      {message ? <p className="notice">{message}</p> : null}
    </>
  );
}

export function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<User>("/api/account/profile").then(setUser).catch(() => setUser(null));
  }, []);

  if (!user) {
    return (
      <>
        <h1>Profile</h1>
        <p>Sign in to edit your profile.</p>
        <Link className="btn btn-gold" href="/account/login">
          Sign in
        </Link>
      </>
    );
  }

  return (
    <form
      className="stack-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
          const next = await api<User>("/api/account/profile", {
            method: "PUT",
            body: JSON.stringify({
              name: String(data.get("name") || ""),
              phone: String(data.get("phone") || ""),
              marketingEmail: data.get("marketingEmail") === "on",
            }),
          });
          setUser(next);
          setMessage("Profile saved.");
        } catch (error) {
          setMessage(error instanceof ApiError ? error.message : "Profile was not saved.");
        }
      }}
    >
      <h1>Profile</h1>
      <p className="lede">{user.email}</p>
      <label className="field">
        <span>Name</span>
        <input name="name" defaultValue={user.name} />
      </label>
      <label className="field">
        <span>Phone</span>
        <input name="phone" defaultValue={user.phone} />
      </label>
      <label className="account-check">
        <input type="checkbox" name="marketingEmail" defaultChecked={user.marketingEmail} /> Marketing email
      </label>
      <button className="btn btn-gold" type="submit">
        Save
      </button>
      {message ? <p className="notice">{message}</p> : null}
    </form>
  );
}

type SavedAddress = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  city: string;
  region: string;
  postcode: string;
  country: string;
};

export function AddressesScreen() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [message, setMessage] = useState("");
  const [session, setSession] = useState<"checking" | "out" | "in">("checking");

  function load() {
    api<{ addresses: SavedAddress[] }>("/api/account/addresses")
      .then((result) => setAddresses(result.addresses))
      .catch((error) => setMessage(error instanceof ApiError ? error.message : "Addresses could not be loaded."));
  }

  useEffect(() => {
    api<{ user: { id: string } | null }>("/api/auth/session")
      .then((result) => {
        if (!result.user) {
          setSession("out");
          return;
        }
        setSession("in");
        load();
      })
      .catch(() => setSession("out"));
  }, []);

  if (session !== "in") {
    return (
      <>
        <h1>Addresses</h1>
        <p>{session === "checking" ? "Loading your addresses." : "Sign in to see saved addresses."}</p>
        {session === "out" ? (
          <Link className="btn btn-gold" href="/account/login">
            Sign in
          </Link>
        ) : null}
      </>
    );
  }

  return (
    <>
      <h1>Addresses</h1>
      <p className="lede">Saved here for the next order. Checkout can still use another address.</p>
      {addresses.length ? (
        <div className="support-list">
          {addresses.map((address) => (
            <article className="address-card" key={address.id}>
              <p className="address-card__name">{address.name}</p>
              {address.phone ? <p>{address.phone}</p> : null}
              <p>{address.line1}</p>
              <p>{[address.city, address.region, address.postcode].filter(Boolean).join(", ")}</p>
              <p>{address.country}</p>
              <button
                className="address-remove"
                type="button"
                onClick={async () => {
                  await api(`/api/account/addresses/${address.id}`, { method: "DELETE" });
                  load();
                }}
              >
                Remove
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p>No saved addresses yet.</p>
      )}
      <h2>Add an address</h2>
      <form
        className="address-form"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          try {
            await api("/api/account/addresses", {
              method: "POST",
              body: JSON.stringify({
                name: String(data.get("name") || ""),
                line1: String(data.get("line1") || ""),
                city: String(data.get("city") || ""),
                region: String(data.get("region") || ""),
                postcode: String(data.get("postcode") || ""),
                country: String(data.get("country") || ""),
                phone: String(data.get("phone") || ""),
              }),
            });
            event.currentTarget.reset();
            load();
          } catch (error) {
            setMessage(error instanceof ApiError ? error.message : "The address was not saved.");
          }
        }}
      >
        <label className="field">
          <span>Name</span>
          <input name="name" autoComplete="name" required />
        </label>
        <label className="field">
          <span>Phone</span>
          <input name="phone" autoComplete="tel" />
        </label>
        <label className="field">
          <span>Street</span>
          <input name="line1" autoComplete="address-line1" required />
        </label>
        <div className="address-form__pair">
          <label className="field">
            <span>City</span>
            <input name="city" autoComplete="address-level2" required />
          </label>
          <label className="field">
            <span>State</span>
            <input name="region" autoComplete="address-level1" required />
          </label>
        </div>
        <div className="address-form__pair">
          <label className="field">
            <span>Postcode</span>
            <input name="postcode" autoComplete="postal-code" required />
          </label>
          <label className="field">
            <span>Country</span>
            <input name="country" autoComplete="country-name" required />
          </label>
        </div>
        <button className="btn btn-gold" type="submit">
          Save address
        </button>
      </form>
      {message ? <p className="notice">{message}</p> : null}
    </>
  );
}

export function SecurityScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    api<{ user: User | null }>("/api/auth/session")
      .then((result) => setUser(result.user))
      .catch(() => setUser(null));
  }, []);

  if (!user) {
    return (
      <>
        <h1>Security</h1>
        <p>{user === undefined ? "Loading security settings." : "Sign in to manage sign-in and this account."}</p>
        {user === null ? (
          <Link className="btn btn-gold" href="/account/login">
            Sign in
          </Link>
        ) : null}
      </>
    );
  }

  return (
    <>
      <h1>Security</h1>
      <p className="lede">Sign out of this browser, or end every session for this account.</p>
      <p className="lede">Log out of this browser from the account menu. These actions apply to every signed-in browser.</p>
      <div className="order-actions">
      <button
        className="btn btn-ghost"
        type="button"
        onClick={async () => {
          await api("/api/account/security", { method: "POST" });
          setMessage("Signed out on every browser.");
          router.push("/account/login");
        }}
      >
        Sign out everywhere
      </button>
      <button
        className="btn btn-ghost"
        type="button"
        onClick={async () => {
          await api("/api/account/security", { method: "POST", body: JSON.stringify({ action: "delete" }) });
          setMessage("Deletion requested. It is not completed until it is reviewed.");
        }}
      >
        Request account deletion
      </button>
      </div>
      {message ? <p className="notice">{message}</p> : null}
    </>
  );
}
