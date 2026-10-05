import { publishedEmail, siteConfig } from "@/lib/config";

const sans = "Helvetica,Arial,sans-serif";
const serif = "Georgia,'Times New Roman',serif";
const ink = "#161616";
const muted = "#5c5854";
const quiet = "#6a6560";
const paper = "#fffaf8";
const ground = "#f3efe9";
const line = "#e4dfd8";
const burgundy = "#9a1f33";

const accent = {
  paid: "#2f6b45",
  failed: "#b42318",
  shipping: "#2a5278",
  refund: "#8a5a20",
  support: "#5e4a78",
  account: burgundy,
  notice: "#8a6840",
} as const;

type Accent = keyof typeof accent;

function accentForTitle(title: string): Accent {
  const text = title.toLowerCase();
  if (/fail|not completed|cancel/.test(text)) return "failed";
  if (/confirm|paid/.test(text)) return "paid";
  if (/refund|return/.test(text)) return "refund";
  if (/ship|deliver|packed|processing|out for/.test(text)) return "shipping";
  if (/bag|available again|waiting/.test(text)) return "notice";
  return "account";
}

const PAYMENT_LABELS: Record<string, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  PENDING_PAYMENT: "Awaiting payment",
  UNPAID: "Unpaid",
  FAILED: "Failed",
  REFUND_PENDING: "Refund pending",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partially refunded",
};

function shell(title: string, body: string, options?: { kicker?: string; preheader?: string; accent?: Accent }) {
  const tone = accent[options?.accent || "account"];
  const email = publishedEmail(siteConfig.supportEmail);
  const contact = email
    ? `Questions: <a href="mailto:${escapeHtml(email)}" style="color:${burgundy};text-decoration:none;">${escapeHtml(email)}</a>`
    : `Reply to this email, or use the <a href="${escapeHtml(siteUrl())}/contact" style="color:${burgundy};text-decoration:none;">contact form</a>.`;
  const preheader = options?.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(options.preheader)}</div>`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${ground};color:${ink};">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${ground};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${paper};">
        <tr><td style="height:3px;background:${tone};font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr>
          <td style="padding:36px 32px 0;">
            <p style="margin:0;font-family:${serif};font-size:22px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:${ink};">Rouge</p>
            <p style="margin:8px 0 0;font-family:${sans};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${quiet};">Sur Mesure · Sold by ${escapeHtml(siteConfig.sellerName)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 0;">
            ${options?.kicker ? `<p style="margin:0 0 10px;font-family:${sans};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${tone};">${escapeHtml(options.kicker)}</p>` : ""}
            <h1 style="margin:0;font-family:${serif};font-size:32px;font-weight:500;line-height:1.15;color:${ink};">${escapeHtml(title)}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 32px 36px;font-family:${sans};font-size:15px;line-height:1.65;color:${ink};">
            ${body}
            <p style="margin:28px 0 0;padding-top:22px;border-top:1px solid ${line};font-size:13px;line-height:1.6;color:${muted};">${contact}</p>
            <p style="margin:12px 0 0;font-size:12px;line-height:1.6;color:${muted};">Yves Saint Laurent and related trademarks are the property of their respective owner. This message is about your account or order. Marketing mail is not sent without consent.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 4px;"><tr><td bgcolor="${burgundy}" style="background:${burgundy};"><a href="${escapeHtml(href)}" style="display:inline-block;padding:16px 22px;font-family:${sans};font-size:12px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a></td></tr></table>`;
}

function panel(label: string, html: string, tone = burgundy) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;background:${ground};"><tr><td style="padding:18px 20px;border-left:2px solid ${tone};font-family:${sans};font-size:15px;line-height:1.6;color:${ink};"><p style="margin:0 0 8px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${quiet};">${escapeHtml(label)}</p>${html}</td></tr></table>`;
}

function paymentColor(status: string) {
  if (status === "PAID") return accent.paid;
  if (status === "FAILED") return accent.failed;
  if (status.includes("REFUND")) return accent.refund;
  return muted;
}

function moneyRow(label: string, value: string, emphasis = false) {
  const weight = emphasis ? "font-weight:500;font-family:" + serif + ";font-size:18px;padding-top:12px;" : "font-size:14px;";
  const color = emphasis ? ink : muted;
  return `<tr><td style="padding:5px 0;${weight}color:${color};">${escapeHtml(label)}</td><td style="padding:5px 0;${weight}color:${ink};text-align:right;">${escapeHtml(value)}</td></tr>`;
}

function isZeroAmount(value: string) {
  const amount = Number(value.replace(/[^\d.]/g, ""));
  return !Number.isFinite(amount) || amount === 0;
}

function displayDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function paymentLabel(status: string) {
  return PAYMENT_LABELS[status] || status;
}

function siteUrl() {
  return siteConfig.siteUrl.replace(/\/$/, "");
}

function deliveryWindow(toneColor: string) {
  const email = publishedEmail(siteConfig.supportEmail);
  const support = email
    ? `<a href="mailto:${escapeHtml(email)}" style="color:${burgundy};text-decoration:none;">contact support</a>`
    : `<a href="${escapeHtml(siteUrl())}/contact" style="color:${burgundy};text-decoration:none;">contact support</a>`;
  return panel(
    "Delivery",
    `<p style="margin:0;">Shipping is included in the price. Delivery usually takes around 7 to 15 days. The order ships from France, so it needs that time to arrive. If it has not arrived after 15 days, ${support}.</p>`,
    toneColor,
  );
}

export function otpEmail(code: string) {
  const body = `<p style="margin:0;">Your verification code is below. It expires shortly and can be used once.</p>
${panel("Code", `<p style="margin:0;font-family:${serif};font-size:32px;font-weight:500;letter-spacing:0.22em;color:${ink};">${escapeHtml(code)}</p>`, accent.account)}
<p style="margin:18px 0 0;color:${muted};">If you did not ask for this, you can ignore the message.</p>`;
  return {
    subject: "Your verification code",
    html: shell("Your verification code", body, { kicker: "Account", preheader: `Your code is ${code}`, accent: "account" }),
  };
}

export function welcomeEmail(name: string) {
  const hello = name ? `Hello ${escapeHtml(name)}, your account is ready.` : "Your account is ready.";
  const body = `<p style="margin:0;">${hello} You can review orders from your account page.</p>
${button(`${siteUrl()}/account`, "Open your account")}`;
  return {
    subject: "Welcome",
    html: shell("Welcome", body, { kicker: "Account", preheader: "Your account is ready.", accent: "account" }),
  };
}

export function orderEmail(input: { title: string; number: string; total: string; note: string }) {
  const details = [
    input.number ? `<p style="margin:0 0 8px;">Order ${escapeHtml(input.number)}</p>` : "",
    input.total ? `<p style="margin:0 0 8px;">Amount: ${escapeHtml(input.total)}</p>` : "",
    `<p style="margin:0;">${escapeHtml(input.note)}</p>`,
  ].join("");
  const href = input.number ? `${siteUrl()}/account/orders` : `${siteUrl()}/account`;
  const label = input.number ? "View orders" : "Open your account";
  const tone = accentForTitle(input.title);
  return {
    subject: `${input.title} ${input.number}`.trim(),
    html: shell(input.title, `${details}${button(href, label)}`, { kicker: tone === "notice" ? "Bag" : "Account", preheader: input.note, accent: tone }),
  };
}

export type OrderMailLine = { name: string; quantity: number; unit: string };
export type OrderMailAddress = { name?: string; line1?: string; line2?: string; city?: string; region?: string; postcode?: string; country?: string; phone?: string };

export function orderReceiptEmail(input: {
  title: string;
  note: string;
  number: string;
  date: string;
  customerName: string;
  lines: OrderMailLine[];
  subtotal: string;
  shipping: string;
  tax: string;
  discount: string;
  total: string;
  currency: string;
  paymentStatus: string;
  address?: OrderMailAddress | null;
  tracking?: { courier?: string; number?: string; url?: string };
}) {
  const tone = accentForTitle(input.title);
  const toneColor = accent[tone];
  const lines =
    input.lines
      .map(
        (item) => `<tr>
          <td style="padding:14px 12px 14px 0;border-bottom:1px solid ${line};font-family:${sans};font-size:15px;color:${ink};">${escapeHtml(item.name)}</td>
          <td style="padding:14px 12px;border-bottom:1px solid ${line};font-family:${sans};font-size:14px;color:${muted};text-align:right;">${item.quantity}</td>
          <td style="padding:14px 0;border-bottom:1px solid ${line};font-family:${sans};font-size:14px;color:${ink};text-align:right;white-space:nowrap;">${escapeHtml(item.unit)}</td>
        </tr>`,
      )
      .join("") || `<tr><td style="padding:14px 0;font-family:${sans};font-size:15px;">No line items were stored.</td></tr>`;
  const address = input.address
    ? [input.address.name, input.address.line1, input.address.line2, [input.address.city, input.address.region, input.address.postcode].filter(Boolean).join(", "), input.address.country, input.address.phone]
        .filter(Boolean)
        .map((part) => escapeHtml(String(part)))
        .join("<br>")
    : "A shipping address was not stored on this order.";
  const shipping = isZeroAmount(input.shipping) ? "Included" : input.shipping;
  const totals = [
    moneyRow("Subtotal", input.subtotal),
    isZeroAmount(input.discount) ? "" : moneyRow("Discount", input.discount),
    moneyRow("Shipping", shipping),
    moneyRow("Tax", input.tax),
    moneyRow("Total", /[₹$€£]/.test(input.total) ? input.total : `${input.total} ${input.currency}`.trim(), true),
  ].join("");
  const tracking = input.tracking
    ? panel(
        "Tracking",
        `<p style="margin:0;">Carrier: ${escapeHtml(input.tracking.courier || "Not added yet")}<br>Tracking number: ${escapeHtml(input.tracking.number || "Not added yet")}${input.tracking.url ? `<br><a href="${escapeHtml(input.tracking.url)}" style="color:${toneColor};text-decoration:none;">Open tracking</a>` : ""}</p>`,
        toneColor,
      )
    : "";
  const delivery = tone === "paid" || tone === "shipping" ? deliveryWindow(toneColor) : "";
  const body = `<p style="margin:0;">${escapeHtml(input.note)}</p>
<p style="margin:22px 0 0;font-family:${serif};font-size:22px;font-weight:500;line-height:1.2;">${escapeHtml(input.number)}</p>
<p style="margin:6px 0 0;font-family:${sans};font-size:14px;color:${muted};">${escapeHtml(displayDate(input.date))} · <span style="color:${paymentColor(input.paymentStatus)};">${escapeHtml(paymentLabel(input.paymentStatus))}</span></p>
<p style="margin:18px 0 0;color:${muted};">For ${escapeHtml(input.customerName || "Customer")}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0;">
  <tr>
    <td style="padding:0 12px 8px 0;border-bottom:1px solid ${line};font-family:${sans};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${quiet};">Item</td>
    <td style="padding:0 12px 8px;border-bottom:1px solid ${line};font-family:${sans};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${quiet};text-align:right;">Qty</td>
    <td style="padding:0 0 8px;border-bottom:1px solid ${line};font-family:${sans};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${quiet};text-align:right;">Price</td>
  </tr>
  ${lines}
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;">${totals}</table>
${panel("Shipping address", `<p style="margin:0;">${address}</p><p style="margin:12px 0 0;font-size:13px;color:${muted};">A separate billing address is not collected. This is the only address stored on the order.</p>`, toneColor)}
${delivery}
${tracking}
<p style="margin:18px 0 0;font-size:13px;color:${muted};">Card numbers and payment secrets are not included in this message.</p>
${button(`${siteUrl()}/account/orders`, "View orders")}`;
  return {
    subject: `${input.title} ${input.number}`.trim(),
    html: shell(input.title, body, { kicker: "Order", preheader: input.note, accent: tone }),
  };
}

export function supportCustomerEmail(input: { number: string; subject: string; message: string }) {
  const body = `<p style="margin:0;">We received your message and will reply to this email address.</p>
${panel("Request", `<p style="margin:0;">${escapeHtml(input.number)}<br>${escapeHtml(input.subject)}</p>`, accent.support)}
${panel("Your message", `<p style="margin:0;">${escapeHtml(input.message)}</p>`, accent.support)}`;
  return {
    subject: `We received your request ${input.number}`,
    html: shell("We received your support request.", body, { kicker: "Support", preheader: `Request ${input.number}`, accent: "support" }),
  };
}

export function supportAdminEmail(input: { number: string; subject: string; email: string; name: string; phone: string; orderRef: string; message: string }) {
  const who = [input.name, input.email, input.phone, input.orderRef ? `Order ${input.orderRef}` : ""]
    .filter(Boolean)
    .map((part) => escapeHtml(part))
    .join("<br>");
  const body = `<p style="margin:0;">Reply to this email to write directly to ${escapeHtml(input.email)}.</p>
${panel("Customer", `<p style="margin:0;">${who}</p>`, accent.support)}
${panel(input.subject || "Message", `<p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${quiet};">${escapeHtml(input.number)}</p><p style="margin:0;">${escapeHtml(input.message)}</p>`, accent.support)}`;
  return {
    subject: `Order request ${input.number} from ${input.name || input.email}`,
    html: shell("New customer message", body, { kicker: "Support", preheader: `${input.subject} · ${input.number}`, accent: "support" }),
  };
}

export function passwordResetEmail(link: string) {
  const body = `<p style="margin:0;">Use the button below to choose a new password. The link expires in one hour and works once.</p>
${button(link, "Choose a new password")}
<p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${muted};">If the button does not open, copy this address into your browser:<br><a href="${escapeHtml(link)}" style="color:${burgundy};word-break:break-all;">${escapeHtml(link)}</a></p>
<p style="margin:14px 0 0;color:${muted};">If you did not ask for this, you can ignore the message. Your current password stays as it is.</p>`;
  return {
    subject: "Reset your password",
    html: shell("Reset your password", body, { kicker: "Account", preheader: "This link expires in one hour.", accent: "account" }),
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char);
}
