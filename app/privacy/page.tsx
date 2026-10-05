import type { Metadata } from "next";
import { PageBack } from "@/components/page-back";
import { getSettings } from "@/lib/settings";
import "../quiet.css";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

export default async function PrivacyPage() {
  const settings = await getSettings();
  return (
    <main id="main" className="page prose quiet-page">
      <PageBack href="/shop">All products</PageBack>
      <p className="kicker">Legal</p>
      <h1>Privacy</h1>
      <p>
        This page describes what the shop stores today. It does not claim compliance with any statute. This shop is sold
        by {settings.sellerName}. A privacy contact email has not been published.
      </p>
      <h2>What this site stores</h2>
      <p>
        The bag is saved on your device. An account, order, and support request are stored when you create them. A
        checkout stores the shipping address you enter and the campaign labels from the visit, such as a source or
        campaign name, so an order can be understood later. A paid order also stores the Razorpay order id and payment
        id. Card numbers are not stored here.
      </p>
      <h2>Sign-in</h2>
      <p>Buying requires an account. You can create it or sign in with Google, or with an email and a password. A one-time email code is still available from the account page. Passwords are stored as a hash, not as the password you type. Google confirms the email; this store does not receive your Google password.</p>
      <h2>Measurement</h2>
      <p>
        Advertising and analytics stay off until you accept them. Declining does not turn them on through the server.
        Necessary shop, bag, checkout, and sign-in functions keep working either way. You can change this from Privacy
        choices in the footer.
      </p>
      <h2>What is not sent to advertising tools</h2>
      <p>Passwords, one-time codes, card numbers, payment authentication details, and payment secrets are not sent to advertising tools.</p>
      <h2>Contact</h2>
      <p>Use the address on the contact page when a real privacy contact is published.</p>
    </main>
  );
}
