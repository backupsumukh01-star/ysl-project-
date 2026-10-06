import type { Metadata } from "next";
import Link from "next/link";
import { PageBack } from "@/components/page-back";
import { getSettings } from "@/lib/settings";
import "../quiet.css";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Rouge Sur Mesure collects, uses, and stores personal information.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const settings = await getSettings();
  return (
    <main id="main" className="page prose quiet-page">
      <PageBack href="/shop">All products</PageBack>
      <p className="kicker">Legal</p>
      <h1>Privacy</h1>
      <p>
        This notice explains how Rouge Sur Mesure, sold by {settings.sellerName}, handles personal information when you
        browse the shop, create an account, place an order, or write to us. Yves Saint Laurent Beauté identifies the
        product. This shop is not the official Yves Saint Laurent website.
      </p>
      <p>Last updated 6 October 2026.</p>

      <h2>Who this notice is for</h2>
      <p>
        It applies to visitors and customers of this website, including customers in India. It describes what we collect,
        why we collect it, who receives it, and how you can ask to see it, correct it, or have an account deleted. It
        does not appoint a separate grievance officer, because a dedicated privacy email has not been published. The
        contact page is the way to reach us.
      </p>

      <h2>Information you give us</h2>
      <p>We collect the details you type or confirm.</p>
      <ul>
        <li>An account stores your email, name, and phone number. A password is stored only as a hash, not as the password you type. You can also choose whether to receive marketing email.</li>
        <li>If you sign in with Google, Google confirms the email and gives us an account identifier. We do not receive your Google password.</li>
        <li>A one-time email code is stored only as a hash, and only until it expires or is used.</li>
        <li>Checkout stores the email, name, phone number, and shipping address you enter: the street, city, region, postal code, and country.</li>
        <li>If you are signed in, that name, phone number, and address are saved on the account so the next checkout can fill them in. You can add a new address. A guest checkout is not written onto an account.</li>
        <li>The contact form stores your name, email, the phone number and order number if you enter them, the subject, and the message.</li>
        <li>A review you submit stores the name shown with it, the rating, and the text you write.</li>
      </ul>

      <h2>Information an order creates</h2>
      <p>
        An order stores its number, the products and cartridge choices, the quantities, the prices, any discount, the
        shipping amount, tax if a tax amount is set, the currency, and the payment status. After you pay, it also stores
        the Razorpay order id and payment id. Card numbers, card security codes, UPI PINs, and bank authentication
        details are entered in Razorpay. This shop does not store them.
      </p>
      <p>
        The order can also store the page you landed on, the site that referred you, and campaign labels from the link
        you opened, such as a source or a campaign name. That record is kept so the order can be understood later. It
        also records whether you had allowed analytics or advertising at that moment. After dispatch, we may add a
        courier name and a tracking number.
      </p>

      <h2>Information stored on your device</h2>
      <p>Some information stays in your browser so the shop can keep working between pages.</p>
      <ul>
        <li>The bag is saved on the device. If you are signed in, the bag is also kept with the account.</li>
        <li>Checkout details you have typed can be saved on the device so a refresh does not clear the form.</li>
        <li>A wishlist, if you use one, is saved on the device.</li>
        <li>A country cookie decides which price list you see. On the India storefront, prices are shown in rupees. That cookie lasts about a year.</li>
        <li>A consent cookie records whether analytics and advertising are allowed. It lasts about six months.</li>
        <li>A sign-in cookie is set when you sign in. The matching session is stored on our server as a hash. A customer session lasts up to 30 days unless you sign out.</li>
        <li>After a verified payment, a receipt cookie lets a guest open that order.</li>
        <li>A visit identifier is stored so one visit can be told from another. The first and latest campaign or referrer can also be kept on the device. A click identifier from a Meta ad, if the link contains one, is stored for about 90 days.</li>
      </ul>

      <h2>How we use it</h2>
      <p>We use this information to run the shop and to complete what you asked us to do.</p>
      <ul>
        <li>To show the catalog and the price for your market.</li>
        <li>To keep the bag and to calculate checkout on the server.</li>
        <li>To take payment, mark an order paid only after the server verifies it with Razorpay, and send the confirmation to the email on the order.</li>
        <li>To deliver the order, show an invoice in the account, and handle a return or a replacement when you ask for one.</li>
        <li>To sign you in, send a one-time code, or reset a password.</li>
        <li>To remember a saved address for the next order, when you are signed in.</li>
        <li>To reply to a message you send. We reply to the email you entered.</li>
        <li>To send marketing email only if you turn that on in the account. You can turn it off there.</li>
        <li>To measure visits and advertising only after you allow those choices, as described below.</li>
        <li>To protect the shop, including limiting attempts to use a one-time code.</li>
      </ul>
      <p>We do not sell personal information.</p>

      <h2>Payments</h2>
      <p>
        Payment is completed in Razorpay’s window. This shop receives the result: whether the payment was captured, the
        amount, the currency, and Razorpay’s order and payment identifiers. Closing the window, or a failed payment,
        does not mark the order paid. Your card or UPI details stay with Razorpay under its own terms. They are not
        placed in our database and they are not sent to advertising tools.
      </p>

      <h2>Accounts</h2>
      <p>
        You can create an account with an email and a password, or with Google. A one-time email code is also available
        from the account page. The sign-in cookie is marked so page scripts cannot read it. Signing out ends the
        sessions for that account.
      </p>
      <p>
        You can correct your name, phone number, and saved addresses in the account. You can ask for the account to be
        deleted from account security, with the control labelled “Request account deletion”. That request is recorded,
        and marketing email is turned off. The account is not removed until the request is reviewed. Order, payment,
        refund, and invoice records that we still need for the sale can be kept after the account is closed.
      </p>

      <h2>Messages</h2>
      <p>
        Order confirmations, password messages, and the note that a deletion was requested are sent to the email on the
        account or the order. A contact-form message is stored as a support request so we can reply to you. If the
        contact page shows a WhatsApp link, that conversation uses the number published there.
      </p>
      <p>
        A separate privacy email address has not been published. Use the <Link href="/contact">contact page</Link> and
        include the email on your account or order so we can find the right record.
      </p>

      <h2>Cookies and similar storage</h2>
      <p>
        Necessary storage stays on so the shop, the bag, checkout, and sign-in can work. Declining analytics and
        advertising does not turn those functions off. Necessary storage includes the sign-in cookie, the receipt
        cookie, the country cookie, the consent cookie, the bag, checkout details kept on the device, and the visit
        identifier.
      </p>
      <p>
        Analytics and advertising stay off until you allow them. You can change this at any time from Privacy choices
        in the footer. Accept allows both. Decline leaves both off. Manage lets you set them separately, then save.
      </p>

      <h2>Analytics</h2>
      <p>
        If you allow analytics, or if you allow advertising, we may record shop events. Those events can include a page
        view, a product view, a search, an add to bag, a removal from the bag, the start of checkout, payment
        information, a completed purchase, a failed or cancelled payment, a registration, a contact message, and views
        of the how-to film or a demo. A record can include the page, a product identifier, a value, the currency, the
        device type, a session identifier, and the campaign labels from the visit.
      </p>
      <p>
        Vercel Analytics and Speed Insights, which measure visits and how quickly pages load, load only after you allow
        analytics or advertising. If you decline both, those tools are not started.
      </p>

      <h2>Advertising</h2>
      <p>
        If you allow advertising, events may be sent to Meta so an ad can be measured and an audience can be built. The
        details used for matching can include a hashed email, a hashed phone number, a hashed city, region, postal code,
        and country, the IP address, the browser type, and Meta’s own browser identifiers. A hash is a one-way code. It
        is not the original email or phone number.
      </p>
      <p>
        Passwords, one-time codes, card numbers, payment authentication details, and payment secrets are not sent to
        advertising tools. If you decline advertising, those events are not sent.
      </p>

      <h2>Who receives information</h2>
      <p>We share information only as needed to run the shop.</p>
      <ul>
        <li>{settings.sellerName}, and the people who fulfil an order or answer a message.</li>
        <li>Razorpay, to take the payment and confirm that it was captured.</li>
        <li>Google, if you choose Google sign-in.</li>
        <li>The email service that sends order and account messages, when that service is connected.</li>
        <li>The service that hosts this website, and the database that stores accounts, orders, and messages.</li>
        <li>Vercel’s measurement tools, only after you allow analytics or advertising.</li>
        <li>Meta, only after you allow advertising.</li>
        <li>A courier, once a shipment is created, with the details needed to deliver the parcel.</li>
      </ul>
      <p>
        Some of these services may process information outside India. We send them the details required for the purpose
        above, not a copy of the whole shop database.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>A one-time code is kept only until it expires or is used.</li>
        <li>A customer session lasts up to 30 days.</li>
        <li>The consent cookie and the visit identifier last about six months.</li>
        <li>The country cookie lasts about a year.</li>
        <li>A Meta click identifier stored on the device lasts about 90 days.</li>
        <li>An account lasts until a deletion request is reviewed and completed.</li>
        <li>An order, its payment record, and its invoice are kept so we can deliver, refund if needed, and keep the sale record.</li>
        <li>A contact message is kept so we can reply and look back at the request.</li>
      </ul>

      <h2>Your choices</h2>
      <p>
        You can correct the name, phone number, and addresses in your account. You can turn marketing email off there.
        You can allow or refuse analytics and advertising from Privacy choices in the footer. You can sign out, which
        ends the current sessions.
      </p>
      <p>
        You can ask to see the information we hold about you, ask us to correct it, or ask us to delete the account.
        Write through the <Link href="/contact">contact page</Link>, or use Request account deletion when you are signed
        in. We may ask you to confirm that the request comes from the email on the account. We may refuse a request
        where we still need the record for an order, a payment, a refund, or an invoice, and we will tell you why.
      </p>

      <h2>Children</h2>
      <p>
        This shop is meant for adults. We do not knowingly collect personal information from children. If you believe a
        child has given us information, write through the contact page and we will review it.
      </p>

      <h2>Security</h2>
      <p>
        Sign-in cookies are not readable by page scripts. Passwords and one-time codes are stored as hashes. Payment
        card details are handled by Razorpay. Access to order and account records is limited to the signed-in customer
        and to the people operating the shop. No method of storage or transmission is perfect. If you believe an account
        has been used without permission, write through the contact page.
      </p>

      <h2>Changes to this notice</h2>
      <p>
        If this notice changes, the date at the top of this page will change. The version published here is the one that
        applies to your use of the shop. A change does not alter the amount of an order already placed.
      </p>

      <h2>Contact</h2>
      <p>
        This shop is sold by {settings.sellerName}. For a privacy question, a copy of your information, a correction, or
        a deletion request, use the <Link href="/contact">contact page</Link>. Include the email address on the account
        or the order.
      </p>
    </main>
  );
}
