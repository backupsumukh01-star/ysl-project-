import { notFound } from "next/navigation";
import { MailFrame } from "@/components/email-preview-frame";
import {
  orderEmail,
  orderReceiptEmail,
  otpEmail,
  passwordResetEmail,
  supportAdminEmail,
  supportCustomerEmail,
  welcomeEmail,
  type OrderMailAddress,
  type OrderMailLine,
} from "@/lib/email/templates";
import "./preview.css";

export const metadata = {
  title: "Email previews",
  robots: { index: false, follow: false },
};

const lines: OrderMailLine[] = [
  { name: "Rouge Sur Mesure — Pink · Orange · Nude", quantity: 1, unit: "₹9,999" },
  { name: "Cartridge Trio — Red", quantity: 1, unit: "₹1,999" },
  { name: "Cartridge refill — Deep Red", quantity: 1, unit: "₹799" },
];

const address: OrderMailAddress = {
  name: "Sample Customer",
  line1: "14 Residency Road",
  line2: "Apartment 3",
  city: "Bengaluru",
  region: "Karnataka",
  postcode: "560025",
  country: "India",
  phone: "+91 98450 00000",
};

function receipt(title: string, note: string, paymentStatus: string, tracking?: { courier?: string; number?: string; url?: string }) {
  return orderReceiptEmail({
    title,
    note,
    number: "RSM-SAMPLE",
    date: "2026-10-05",
    customerName: "Sample Customer",
    lines,
    subtotal: "₹12,797",
    shipping: "₹0",
    tax: "₹0",
    discount: "₹0",
    total: "₹12,797",
    currency: "INR",
    paymentStatus,
    address,
    tracking,
  });
}

export default function EmailPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const letters = [
    { id: "confirmation", label: "Order confirmation", ...receipt("Order confirmed", "Thank you. Your payment was verified on the server.", "PAID") },
    { id: "payment", label: "Payment confirmed", ...receipt("Payment confirmed", "The payment reference is stored with your order. Card details are not included.", "PAID") },
    { id: "reset", label: "Password reset", ...passwordResetEmail("http://localhost:3000/account/reset?token=preview-token") },
    {
      id: "contact",
      label: "Contact — customer",
      ...supportCustomerEmail({
        number: "SUP-104228",
        subject: "Please correct the shipping address",
        message: "The apartment number on my order should be 3, not 8. The rest of the address is correct.",
      }),
    },
    {
      id: "contact-owner",
      label: "Contact — owner",
      ...supportAdminEmail({
        number: "SUP-104228",
        subject: "Please correct the shipping address",
        email: "customer@example.net",
        name: "Sample Customer",
        phone: "+91 98450 00000",
        orderRef: "RSM-SAMPLE",
        message: "The apartment number on my order should be 3, not 8. The rest of the address is correct.",
      }),
    },
    { id: "failed", label: "Payment not completed", ...receipt("Payment was not completed", "Your bag is still saved. No successful charge was recorded.", "FAILED") },
    { id: "cancelled", label: "Order cancelled", ...receipt("Order cancelled", "The order was cancelled before shipment. A refund is recorded only after the payment provider confirms it.", "PAID") },
    {
      id: "shipped",
      label: "Order shipped",
      ...receipt("Order shipped", "Your order has been marked shipped.", "PAID", {
        courier: "Sample Courier",
        number: "TRK000000",
        url: "https://ysl-project.vercel.app/account/orders",
      }),
    },
    { id: "refund", label: "Refund", ...receipt("Refund initiated", "A refund was requested with the payment provider.", "REFUND_PENDING") },
    { id: "welcome", label: "Welcome", ...welcomeEmail("Sample Customer") },
    { id: "code", label: "Verification code", ...otpEmail("482913") },
    {
      id: "notice",
      label: "Short notice",
      ...orderEmail({
        title: "Your bag is still waiting",
        number: "",
        total: "",
        note: "Items are still in your bag. This note is sent only because marketing email is allowed on the account.",
      }),
    },
    {
      id: "owner-order",
      label: "Paid order — owner",
      ...receipt("Paid order", "A payment was verified. Reply to this email to write to the customer. Fulfillment has not been assigned to a courier.", "PAID"),
    },
  ];

  return (
    <main id="main" className="page mail-preview">
      <p className="kicker">Mail</p>
      <h1>Email previews</h1>
      <p className="mail-preview__intro">Sample orders and names. These are the messages the store sends. Nothing here was delivered.</p>
      <ul className="mail-preview__nav">
        {letters.map((letter) => (
          <li key={letter.id}>
            <a href={`#${letter.id}`}>{letter.label}</a>
          </li>
        ))}
      </ul>
      {letters.map((letter) => (
        <section key={letter.id} id={letter.id} className="mail-preview__letter">
          <h2>{letter.label}</h2>
          <p className="mail-preview__subject">{letter.subject}</p>
          <MailFrame html={letter.html} title={letter.label} />
        </section>
      ))}
    </main>
  );
}
