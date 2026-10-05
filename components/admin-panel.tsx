"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api-client";

const links = ["", "orders", "products", "catalog", "customers", "reviews", "testimonials", "content", "coupons", "support", "returns", "emails", "settings"];

export function AdminPanel() {
  const pathname = usePathname();
  const section = pathname.replace("/admin", "").replace(/^\//, "") || "dashboard";
  const [data, setData] = useState<unknown>(null);
  const [message, setMessage] = useState("");
  const [authed, setAuthed] = useState(false);

  const load = useCallback(async () => {
    const path =
      section === "dashboard"
        ? "/api/admin/dashboard"
        : section === "settings"
          ? "/api/admin/content"
          : `/api/admin/${section}`;
    try {
      setData(await api(path));
      setAuthed(true);
      setMessage("");
    } catch (error) {
      setAuthed(false);
      setMessage(error instanceof ApiError ? error.message : "Admin data could not be loaded.");
    }
  }, [section]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main id="main" className="page admin-page">
      <p className="kicker">Admin</p>
      <nav className="account-nav" aria-label="Admin">
        {links.map((link) => (
          <Link key={link || "home"} href={link ? `/admin/${link}` : "/admin"}>
            {link || "Overview"}
          </Link>
        ))}
      </nav>
      {message ? <p className="notice">{message}</p> : null}
      {!authed ? <Link href="/admin/login">Admin sign in</Link> : null}
      {authed && section === "dashboard" ? <Dashboard data={data} /> : null}
      {authed && section === "orders" ? <Orders data={data} /> : null}
      {authed && section === "products" ? <Products data={data} reload={load} /> : null}
      {authed && section === "catalog" ? <CatalogEditor data={data} reload={load} /> : null}
      {authed && section === "customers" ? <Customers data={data} /> : null}
      {authed && section === "reviews" ? <Reviews data={data} reload={load} /> : null}
      {authed && section === "testimonials" ? <Testimonials data={data} reload={load} /> : null}
      {authed && section === "content" ? <Content data={data} /> : null}
      {authed && section === "settings" ? <Content data={data} /> : null}
      {authed && section === "coupons" ? <Coupons data={data} reload={load} /> : null}
      {authed && section === "support" ? <Support data={data} reload={load} /> : null}
      {authed && section === "returns" ? <Returns data={data} reload={load} /> : null}
      {authed && section === "emails" ? <Emails data={data} reload={load} /> : null}
    </main>
  );
}

function CatalogEditor({ data, reload }: { data: unknown; reload: () => void }) {
  const payload = data as {
    cartridges?: { code: string; name: string; family: string; ingredients: string; soldIndividually: boolean }[];
    faqs?: { id: string; question: string; answer: string }[];
    app?: { ios: string; android: string; bluetooth: string; iosUrl: string; androidUrl: string; methods: string; note: string };
  };
  return (
    <form
      className="stack-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await api("/api/admin/catalog", {
          method: "PATCH",
          body: JSON.stringify({
            cartridges: (payload.cartridges || []).map((item) => ({
              code: item.code,
              name: String(form.get(`name-${item.code}`) || ""),
              ingredients: String(form.get(`ingredients-${item.code}`) || ""),
              soldIndividually: form.get(`sold-${item.code}`) === "on",
            })),
            faqs: (payload.faqs || []).map((item) => ({
              id: item.id,
              question: String(form.get(`q-${item.id}`) || ""),
              answer: String(form.get(`a-${item.id}`) || ""),
            })),
            app: {
              ios: String(form.get("ios") || ""),
              android: String(form.get("android") || ""),
              bluetooth: String(form.get("bluetooth") || ""),
              iosUrl: String(form.get("iosUrl") || ""),
              androidUrl: String(form.get("androidUrl") || ""),
              methods: String(form.get("methods") || ""),
              note: String(form.get("note") || ""),
            },
          }),
        });
        reload();
      }}
    >
      <h1>Catalog facts</h1>
      <h2>App</h2>
      <input name="ios" defaultValue={payload.app?.ios || ""} />
      <input name="android" defaultValue={payload.app?.android || ""} />
      <input name="bluetooth" defaultValue={payload.app?.bluetooth || ""} />
      <input name="iosUrl" defaultValue={payload.app?.iosUrl || ""} placeholder="App Store URL, leave blank if unset" />
      <input name="androidUrl" defaultValue={payload.app?.androidUrl || ""} placeholder="Google Play URL, leave blank if unset" />
      <textarea name="methods" defaultValue={payload.app?.methods || ""} rows={3} />
      <textarea name="note" defaultValue={payload.app?.note || ""} rows={2} />
      <h2>Cartridges</h2>
      {(payload.cartridges || []).map((item) => (
        <fieldset key={item.code}>
          <legend>{item.code} · {item.family}</legend>
          <input name={`name-${item.code}`} defaultValue={item.name} />
          <textarea name={`ingredients-${item.code}`} defaultValue={item.ingredients} rows={3} />
          <label>
            <input name={`sold-${item.code}`} type="checkbox" defaultChecked={item.soldIndividually} /> Sold individually
          </label>
        </fieldset>
      ))}
      <h2>FAQ</h2>
      {(payload.faqs || []).map((item) => (
        <fieldset key={item.id}>
          <input name={`q-${item.id}`} defaultValue={item.question} />
          <textarea name={`a-${item.id}`} defaultValue={item.answer} rows={3} />
        </fieldset>
      ))}
      <button className="btn btn-ghost" type="submit">Save catalog</button>
    </form>
  );
}

function Dashboard({ data }: { data: unknown }) {
  const stats = data as {
    orders: number;
    paid: number;
    pending: number;
    revenue: number;
    averageOrder: number | null;
    currency?: string;
    customers: number;
    products: number;
    lowStock: number;
    outOfStock?: number;
    cancellations?: number;
    refunded?: number;
    contribution?: number | null;
    segments?: { key: string; count: number }[];
    reviews: number;
    tickets: number;
    funnel?: { pageViews: number; productViews: number; addToCart: number; checkoutStarts: number; paymentStarts: number; purchases: number };
    topProducts?: { name: string; quantity: number }[];
    campaigns?: { source: string; campaign: string; count: number }[];
    metaConfigured?: boolean;
    metaEvents?: { id: string; eventId: string; eventName: string; status: string; attempts: number; errorMessage: string }[];
    recentOrders: { number: string; status: string; paymentStatus: string }[];
  };
  const [note, setNote] = useState("");
  if (!stats) return null;
  const funnel = stats.funnel;
  const emptyFunnel = !funnel || (funnel.pageViews === 0 && funnel.productViews === 0 && funnel.addToCart === 0 && funnel.purchases === 0);
  async function retry(id: string) {
    try {
      const result = await api<{ status?: string; message?: string }>("/api/admin/meta/retry", { method: "POST", body: JSON.stringify({ id }) });
      setNote(result.status ? `Retry status: ${result.status}` : result.message || "Retry did not run.");
    } catch (error) {
      setNote(error instanceof ApiError ? error.message : "Retry did not run.");
    }
  }
  return (
    <>
      <h1>Overview</h1>
      <ul>
        <li>Total orders: {stats.orders}</li>
        <li>Paid orders: {stats.paid}</li>
        <li>Pending payments: {stats.pending}</li>
        <li>Revenue: {stats.revenue} {stats.currency || ""}</li>
        <li>Average order value: {stats.averageOrder == null ? "No paid orders yet" : stats.averageOrder}</li>
        <li>Customers: {stats.customers}</li>
        <li>Products: {stats.products}</li>
        <li>Low stock: {stats.lowStock}</li>
        <li>Out of stock: {stats.outOfStock ?? 0}</li>
        <li>Reviews waiting: {stats.reviews}</li>
        <li>Open support: {stats.tickets}</li>
        <li>Cancellations: {stats.cancellations ?? 0}</li>
        <li>Completed refunds: {stats.refunded ?? 0}</li>
      </ul>
      <h2>Contribution</h2>
      <p>{stats.contribution == null ? "Product cost is not configured, so contribution is not calculated." : `Revenue minus configured product cost, completed refunds, and configured fees: ${stats.contribution}`}</p>
      <h2>Segments</h2>
      {stats.segments?.length ? stats.segments.map((segment) => <p key={segment.key}>{segment.key}: {segment.count}</p>) : <p>No segment counts yet.</p>}
      <h2>Measured funnel</h2>
      {emptyFunnel ? <p>No measured visits yet.</p> : null}
      {funnel ? (
        <ul>
          <li>Visitors: {funnel.pageViews}</li>
          <li>Product views: {funnel.productViews}</li>
          <li>Add to cart: {funnel.addToCart}</li>
          <li>Checkout started: {funnel.checkoutStarts}</li>
          <li>Payments started: {funnel.paymentStarts}</li>
          <li>Purchases: {funnel.purchases}</li>
        </ul>
      ) : null}
      <h2>Top products</h2>
      {stats.topProducts?.length ? stats.topProducts.map((item) => <p key={item.name}>{item.name}: {item.quantity}</p>) : <p>No paid product totals yet.</p>}
      <h2>Campaigns</h2>
      {stats.campaigns?.length ? stats.campaigns.map((item) => <p key={`${item.source}-${item.campaign}`}>{item.source || "unknown"} / {item.campaign}: {item.count}</p>) : <p>No campaign visits yet.</p>}
      <h2>Meta events</h2>
      <p>{stats.metaConfigured ? "Meta credentials are present on the server." : "Meta credentials are not configured."}</p>
      {note ? <p>{note}</p> : null}
      {stats.metaEvents?.length ? stats.metaEvents.map((event) => (
        <p key={event.id}>
          {event.eventName} · {event.eventId} · {event.status} · attempts {event.attempts}
          {event.errorMessage ? ` · ${event.errorMessage}` : ""}
          {event.status !== "SENT" && event.eventName === "Purchase" ? <button type="button" onClick={() => retry(event.id)}>Retry</button> : null}
        </p>
      )) : <p>No Meta events yet.</p>}
      {stats.recentOrders?.map((order) => (
        <p key={order.number}>
          {order.number} · {order.status} · {order.paymentStatus}
        </p>
      ))}
    </>
  );
}

function Orders({ data }: { data: unknown }) {
  const orders = (data as { orders?: { id: string; number: string; email: string; status: string; paymentStatus: string; total: number }[] })?.orders || [];
  const [note, setNote] = useState("");
  return (
    <>
      <h1>Orders</h1>
      {orders.map((order) => (
        <article key={order.id} className="notice">
          <p>
            {order.number} · {order.email}
          </p>
          <p>
            {order.status} · {order.paymentStatus} · {order.total}
          </p>
          <label className="field">
            <span>Fulfillment</span>
            <select
              defaultValue={order.status}
              onChange={async (event) => {
                await api(`/api/admin/orders/${order.id}`, { method: "PATCH", body: JSON.stringify({ status: event.target.value }) });
                setNote(`Updated ${order.number}`);
              }}
            >
              {["PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUND_REQUESTED", "REFUNDED"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <button type="button" className="icon-btn" onClick={() => api(`/api/admin/orders/${order.id}`, { method: "PATCH", body: JSON.stringify({ action: "resend" }) })}>
            Resend confirmation
          </button>
          <button type="button" className="icon-btn" onClick={() => api(`/api/admin/orders/${order.id}`, { method: "PATCH", body: JSON.stringify({ action: "refund" }) })}>
            Request refund
          </button>
        </article>
      ))}
      {!orders.length ? <p>No orders yet.</p> : null}
      {note ? <p>{note}</p> : null}
    </>
  );
}

function Products({ data, reload }: { data: unknown; reload: () => void }) {
  const products = (data as { products?: {
    id: string;
    name: string;
    slug: string;
    price: number | null;
    active: boolean;
    stock: number;
    featured: boolean;
    trackInventory: boolean;
    shortDescription: string;
    description: string;
    availability: string;
    included: string;
    compatibility: string;
    details: string;
    tags: string[];
    seoTitle: string;
    seoDescription: string;
    images: { src: string }[];
  }[] })?.products || [];
  return (
    <>
      <h1>Products</h1>
      {products.map((product) => (
        <form
          key={product.id}
          className="notice stack-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const price = String(form.get("price") || "");
            const images = String(form.get("images") || "").split("\n").map((line) => line.trim()).filter(Boolean);
            await api(`/api/admin/products/${product.id}`, {
              method: "PATCH",
              body: JSON.stringify({
                name: String(form.get("name") || ""),
                shortDescription: String(form.get("shortDescription") || ""),
                description: String(form.get("description") || ""),
                availability: String(form.get("availability") || ""),
                included: String(form.get("included") || ""),
                compatibility: String(form.get("compatibility") || ""),
                details: String(form.get("details") || ""),
                tags: String(form.get("tags") || ""),
                seoTitle: String(form.get("seoTitle") || ""),
                seoDescription: String(form.get("seoDescription") || ""),
                price: price === "" ? null : Number(price),
                stock: Number(form.get("stock") || 0),
                active: form.get("active") === "on",
                featured: form.get("featured") === "on",
                trackInventory: form.get("track") === "on",
                ...(images.length ? { images: images.map((src, index) => ({ src, isPrimary: index === 0 })) } : {}),
              }),
            });
            reload();
          }}
        >
          <input name="name" defaultValue={product.name} />
          <input name="price" defaultValue={product.price ?? ""} placeholder="Price" />
          <input name="stock" type="number" defaultValue={product.stock} />
          <textarea name="shortDescription" defaultValue={product.shortDescription} rows={2} />
          <textarea name="description" defaultValue={product.description} rows={4} />
          <textarea name="included" defaultValue={product.included} rows={2} />
          <textarea name="compatibility" defaultValue={product.compatibility} rows={2} />
          <textarea name="details" defaultValue={product.details} rows={3} />
          <input name="availability" defaultValue={product.availability} />
          <input name="tags" defaultValue={product.tags.join(", ")} placeholder="Tags, comma separated" />
          <input name="seoTitle" defaultValue={product.seoTitle} placeholder="SEO title" />
          <textarea name="seoDescription" defaultValue={product.seoDescription} rows={2} />
          <textarea name="images" defaultValue={product.images.map((image) => image.src).join("\n")} rows={3} />
          <label>
            <input name="active" type="checkbox" defaultChecked={product.active} /> Active
          </label>
          <label>
            <input name="featured" type="checkbox" defaultChecked={product.featured} /> Featured
          </label>
          <label>
            <input name="track" type="checkbox" defaultChecked={product.trackInventory} /> Track inventory
          </label>
          <button className="btn btn-ghost" type="submit">
            Save
          </button>
          <button
            className="icon-btn"
            type="button"
            onClick={async () => {
              await api(`/api/admin/products/${product.id}`, { method: "DELETE" });
              reload();
            }}
          >
            Archive
          </button>
        </form>
      ))}
      <ProductCreate reload={reload} />
    </>
  );
}

function ProductCreate({ reload }: { reload: () => void }) {
  return (
    <form
      className="stack-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await api("/api/admin/products", {
          method: "POST",
          body: JSON.stringify({
            name: String(form.get("name") || ""),
            slug: String(form.get("slug") || ""),
            shortDescription: "Details have not been confirmed.",
            description: "Placeholder product. Specifications have not been confirmed.",
            type: String(form.get("type") || "ACCESSORY"),
            price: null,
          }),
        });
        event.currentTarget.reset();
        reload();
      }}
    >
      <h2>Add product</h2>
      <input name="name" placeholder="Name" required />
      <input name="slug" placeholder="slug" required />
      <input name="type" placeholder="DEVICE, REFILL, ACCESSORY, BUNDLE" />
      <button className="btn btn-gold" type="submit">
        Create
      </button>
    </form>
  );
}

function Customers({ data }: { data: unknown }) {
  const customers = (data as { customers?: { id: string; email: string; name: string; orders: number }[] })?.customers || [];
  return (
    <>
      <h1>Customers</h1>
      {customers.map((customer) => (
        <p key={customer.id}>
          {customer.email} · {customer.name || "No name"} · {customer.orders} orders
        </p>
      ))}
      {!customers.length ? <p>No customers yet.</p> : null}
    </>
  );
}

function Reviews({ data, reload }: { data: unknown; reload: () => void }) {
  const reviews = (data as { reviews?: { id: string; title: string; status: string; comment: string; rating: number }[] })?.reviews || [];
  return (
    <>
      <h1>Reviews</h1>
      {!reviews.length ? <p>No reviews yet.</p> : null}
      {reviews.map((review) => (
        <article key={review.id} className="notice">
          <p>
            {review.rating}/5 · {review.status}
          </p>
          <p>{review.comment}</p>
          {["APPROVED", "REJECTED", "PENDING"].map((status) => (
            <button
              key={status}
              className="icon-btn"
              type="button"
              onClick={async () => {
                await api("/api/admin/reviews", { method: "PATCH", body: JSON.stringify({ id: review.id, status }) });
                reload();
              }}
            >
              {status}
            </button>
          ))}
        </article>
      ))}
    </>
  );
}

function Testimonials({ data, reload }: { data: unknown; reload: () => void }) {
  const testimonials = (data as { testimonials?: { id: string; name: string; quote: string; published: boolean }[] })?.testimonials || [];
  async function save(event: FormEvent<HTMLFormElement>, id?: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api("/api/admin/testimonials", {
      method: "POST",
      body: JSON.stringify({
        id,
        name: String(form.get("name") || ""),
        quote: String(form.get("quote") || ""),
        location: String(form.get("location") || ""),
        published: form.get("published") === "on",
      }),
    });
    reload();
  }
  return (
    <>
      <h1>Testimonials</h1>
      <p>Only publish words you have permission to use. Nothing is invented here.</p>
      {testimonials.map((item) => (
        <form key={item.id} className="notice stack-form" onSubmit={(event) => save(event, item.id)}>
          <input name="name" defaultValue={item.name} />
          <textarea name="quote" defaultValue={item.quote} />
          <input name="location" placeholder="Location" />
          <label>
            <input name="published" type="checkbox" defaultChecked={item.published} /> Published
          </label>
          <button className="btn btn-ghost" type="submit">
            Save
          </button>
          <button
            className="icon-btn"
            type="button"
            onClick={async () => {
              await api(`/api/admin/testimonials?id=${item.id}`, { method: "DELETE" });
              reload();
            }}
          >
            Delete
          </button>
        </form>
      ))}
      <form className="stack-form" onSubmit={(event) => save(event)}>
        <h2>New testimonial</h2>
        <input name="name" placeholder="Customer name" required />
        <textarea name="quote" required />
        <input name="location" placeholder="Location" />
        <button className="btn btn-gold" type="submit">
          Create unpublished
        </button>
      </form>
    </>
  );
}

function Content({ data }: { data: unknown }) {
  const settings = (data as { settings?: Record<string, string | number | boolean | null>; faq?: string })?.settings;
  if (!settings) return null;
  const fields = ["sellerName", "heroKicker", "heroTitle", "heroSubtitle", "heroPrimary", "heroSecondary", "announcement", "shippingMessage", "returnsMessage", "supportEmail", "currency", "shippingEnabled", "shippingFlatMinor", "freeShippingThresholdMinor", "shippingEstimate", "taxRateBps"];
  return (
    <form
      className="stack-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const next: Record<string, string> = {};
        for (const field of fields) next[field] = String(form.get(field) ?? "");
        await api("/api/admin/content", { method: "PUT", body: JSON.stringify({ settings: next, faq: String(form.get("faq") || "") }) });
      }}
    >
      <h1>Content and settings</h1>
      {fields.map((field) => (
        <label className="field" key={field}>
          <span>{field}</span>
          <input name={field} defaultValue={String(settings[field] ?? "")} />
        </label>
      ))}
      <label className="field">
        <span>FAQ JSON</span>
        <textarea name="faq" defaultValue={(data as { faq?: string }).faq || ""} rows={8} />
      </label>
      <button className="btn btn-gold" type="submit">
        Save
      </button>
    </form>
  );
}

function Coupons({ data, reload }: { data: unknown; reload: () => void }) {
  const coupons = (data as { coupons?: { code: string; type: string; active: boolean }[] })?.coupons || [];
  return (
    <>
      <h1>Coupons</h1>
      {coupons.map((coupon) => (
        <p key={coupon.code}>
          {coupon.code} · {coupon.type} · {coupon.active ? "Active" : "Inactive"}
        </p>
      ))}
      <form
        className="stack-form"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          await api("/api/admin/coupons", {
            method: "POST",
            body: JSON.stringify({
              code: String(form.get("code") || ""),
              type: String(form.get("type") || "PERCENTAGE"),
              value: Number(form.get("value") || 0),
            }),
          });
          reload();
        }}
      >
        <input name="code" placeholder="CODE" required />
        <select name="type">
          <option>PERCENTAGE</option>
          <option>FIXED</option>
        </select>
        <input name="value" type="number" placeholder="Percent or minor units" required />
        <button className="btn btn-gold" type="submit">
          Save coupon
        </button>
      </form>
    </>
  );
}

function Returns({ data, reload }: { data: unknown; reload: () => void }) {
  const requests = (data as { returns?: { id: string; status: string; reason: string; orderId: string }[] })?.returns || [];
  const statuses = ["REQUESTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "PICKUP_SCHEDULED", "RECEIVED", "REFUND_PENDING", "REFUNDED", "CLOSED"];
  return (
    <>
      <h1>Returns</h1>
      {!requests.length ? <p>No return requests yet.</p> : null}
      {requests.map((item) => (
        <article key={item.id} className="notice">
          <p>{item.orderId} · {item.status}</p>
          <p>{item.reason}</p>
          <select
            defaultValue={item.status}
            onChange={async (event) => {
              await api("/api/admin/returns", { method: "PATCH", body: JSON.stringify({ id: item.id, status: event.target.value }) });
              reload();
            }}
          >
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </article>
      ))}
    </>
  );
}

function Support({ data, reload }: { data: unknown; reload: () => void }) {
  const tickets = (data as { tickets?: { id: string; number: string; subject: string; status: string; message: string }[] })?.tickets || [];
  return (
    <>
      <h1>Support</h1>
      {!tickets.length ? <p>No requests yet.</p> : null}
      {tickets.map((ticket) => (
        <article key={ticket.id} className="notice">
          <p>
            {ticket.number} · {ticket.subject} · {ticket.status}
          </p>
          <p>{ticket.message}</p>
          <select
            defaultValue={ticket.status}
            onChange={async (event) => {
              await api("/api/admin/support", { method: "PATCH", body: JSON.stringify({ id: ticket.id, status: event.target.value }) });
              reload();
            }}
          >
            {["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </article>
      ))}
    </>
  );
}

function Emails({ data, reload }: { data: unknown; reload: () => void }) {
  const emails = (data as { emails?: { id: string; type: string; recipient: string; status: string; error: string; subject: string }[] })?.emails || [];
  return (
    <>
      <h1>Emails</h1>
      <p>If the provider is not configured, messages are logged and not delivered.</p>
      {emails.map((email) => (
        <article key={email.id} className="notice">
          <p>
            {email.type} · {email.recipient} · {email.status}
          </p>
          <p>{email.subject}</p>
          {email.error ? <p>{email.error}</p> : null}
          <button
            className="icon-btn"
            type="button"
            onClick={async () => {
              await api("/api/admin/emails", { method: "POST", body: JSON.stringify({ id: email.id }) });
              reload();
            }}
          >
            Retry
          </button>
        </article>
      ))}
    </>
  );
}

export function AdminLogin() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  return (
    <main id="main" className="page">
      <h1>Admin sign in</h1>
      <form
        className="stack-form"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          try {
            await api("/api/admin/login", {
              method: "POST",
              body: JSON.stringify({ email: String(form.get("email") || ""), password: String(form.get("password") || "") }),
            });
            router.push("/admin");
            router.refresh();
          } catch (error) {
            setMessage(error instanceof ApiError ? error.message : "Sign-in failed.");
          }
        }}
      >
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" required />
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" required />
        </label>
        <button className="btn btn-gold" type="submit">
          Sign in
        </button>
      </form>
      {message ? <p className="notice">{message}</p> : null}
    </main>
  );
}
