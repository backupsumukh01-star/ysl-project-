import { publishedEmail, siteConfig } from "@/lib/config";

function shell(title: string, body: string) {
  const email = siteConfig.supportEmail;
  return `<!doctype html><html><body style="margin:0;background:#0b0a09;color:#f7f3ec;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="letter-spacing:.18em;text-transform:uppercase;font-size:12px;color:#c8a46a;">Rouge Sur Mesure</p>
    <h1 style="font-weight:500;font-size:32px;line-height:1.2;">${title}</h1>
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#f7f3ec;">${body}</div>
    <p style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#aaa39a;">${publishedEmail(email) ? `Questions: <a style="color:#d8b477;" href="mailto:${escapeHtml(publishedEmail(email))}">${escapeHtml(publishedEmail(email))}</a>` : "Support email will be published shortly."}</p>
    <p style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#aaa39a;">Yves Saint Laurent and related trademarks are the property of their respective owner. This message is about your account or order. Marketing mail is not sent without consent.</p>
  </div></body></html>`;
}

export function otpEmail(code: string) {
  return {
    subject: "Your verification code",
    html: shell("Your verification code", `<p>Your verification code is:</p><p style="font-size:28px;letter-spacing:.2em;">${code}</p><p>It expires shortly and can be used once. If you did not ask for this, you can ignore the message.</p>`),
  };
}

export function welcomeEmail(name: string) {
  return {
    subject: "Welcome",
    html: shell("Welcome", `<p>Hello${name ? ` ${escapeHtml(name)}` : ""}, your account is ready. You can review orders from your account page.</p><p><a style="color:#d8b477;" href="${siteConfig.siteUrl}/account">Open your account</a></p>`),
  };
}

export function orderEmail(input: { title: string; number: string; total: string; note: string }) {
  return {
    subject: `${input.title} ${input.number}`.trim(),
    html: shell(input.title, `<p>Order ${escapeHtml(input.number)}</p><p>Amount: ${escapeHtml(input.total)}</p><p>${escapeHtml(input.note)}</p><p><a style="color:#d8b477;" href="${siteConfig.siteUrl}/account/orders">View orders</a></p>`),
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
  const lines = input.lines
    .map((line) => `<tr><td style="padding:6px 0;">${escapeHtml(line.name)}</td><td style="padding:6px 8px;text-align:right;">${line.quantity}</td><td style="padding:6px 0;text-align:right;">${escapeHtml(line.unit)}</td></tr>`)
    .join("");
  const address = input.address
    ? [input.address.name, input.address.line1, input.address.line2, [input.address.city, input.address.region, input.address.postcode].filter(Boolean).join(", "), input.address.country, input.address.phone]
        .filter(Boolean)
        .map((line) => escapeHtml(String(line)))
        .join("<br>")
    : "A shipping address was not stored on this order.";
  const tracking = input.tracking
    ? `<p>Carrier: ${escapeHtml(input.tracking.courier || "Not added yet")}<br>Tracking number: ${escapeHtml(input.tracking.number || "Not added yet")}${input.tracking.url ? `<br><a style="color:#d8b477;" href="${escapeHtml(input.tracking.url)}">Tracking link</a>` : ""}</p>`
    : "";
  const body = `
    <p>${escapeHtml(input.note)}</p>
    <p>Order ${escapeHtml(input.number)}<br>Date: ${escapeHtml(input.date)}<br>Customer: ${escapeHtml(input.customerName || "Customer")}</p>
    <table style="width:100%;border-collapse:collapse;">${lines || `<tr><td>No line items were stored.</td></tr>`}</table>
    <p>Subtotal: ${escapeHtml(input.subtotal)}<br>Shipping: ${escapeHtml(input.shipping)}<br>Tax: ${escapeHtml(input.tax)}<br>Discount: ${escapeHtml(input.discount)}<br>Total: ${escapeHtml(input.total)} ${escapeHtml(input.currency)}</p>
    <p>Payment status: ${escapeHtml(input.paymentStatus)}</p>
    <p>Shipping address:<br>${address}</p>
    <p>A separate billing address is not collected. The shipping address above is the only address stored on the order.</p>
    ${tracking}
    <p>Card numbers and payment secrets are not included in this message.</p>
    <p><a style="color:#d8b477;" href="${siteConfig.siteUrl}/account/orders">View orders</a></p>`;
  return { subject: `${input.title} ${input.number}`.trim(), html: shell(input.title, body) };
}

export function supportCustomerEmail(input: { number: string; subject: string; message: string }) {
  return {
    subject: `We received your request ${input.number}`,
    html: shell(
      "We received your support request.",
      `<p>Ticket ${escapeHtml(input.number)}</p><p>Subject: ${escapeHtml(input.subject)}</p><p>${escapeHtml(input.message)}</p><p>The next step is a reply from support. ${publishedEmail(siteConfig.supportEmail) ? `Contact ${escapeHtml(siteConfig.supportEmail)} if you need to add something.` : "Support email will be published shortly."}</p>`,
    ),
  };
}

export function supportAdminEmail(input: { number: string; subject: string; email: string }) {
  return {
    subject: `Support ${input.number}`,
    html: shell("New support request", `<p>${escapeHtml(input.number)} from ${escapeHtml(input.email)}</p><p>${escapeHtml(input.subject)}</p>`),
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char);
}
