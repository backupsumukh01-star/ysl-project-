import type { Metadata } from "next";
import Link from "next/link";
import { PageBack } from "@/components/page-back";
import { siteConfig, supportPhoneHref } from "@/lib/config";
import { getSettings } from "@/lib/settings";
import "../quiet.css";

export const metadata: Metadata = {
  title: "Terms",
  description: "How an order, a replacement, and a refund work at Rouge Sur Mesure.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const settings = await getSettings();
  return (
    <main id="main" className="page prose quiet-page">
      <PageBack href="/shop">All products</PageBack>
      <p className="kicker">Legal</p>
      <h1>Terms</h1>
      <p>
        These terms are the agreement for shopping at Rouge Sur Mesure, sold by {settings.sellerName}. Yves Saint Laurent
        Beauté identifies the product. This shop is not the official Yves Saint Laurent website. By placing an order,
        you agree to these terms.
      </p>
      <p>Last updated 8 October 2026.</p>

      <h2>The shop</h2>
      <p>
        The website shows the device, cartridge trios, and refills, and takes an order for them.
        {siteConfig.supportAddress ? (
          <>
            {" "}
            The published address is {siteConfig.supportAddress}.
            {siteConfig.supportPhone ? (
              <>
                {" "}
                The phone is <a href={supportPhoneHref(siteConfig.supportPhone)}>{siteConfig.supportPhone}</a>
                {siteConfig.supportHours ? `, ${siteConfig.supportHours}` : ""}.
              </>
            ) : null}{" "}
          </>
        ) : (
          " A street address has not been published. "
        )}
        A governing law has not been published. Questions about an order go through the <Link href="/contact">contact page</Link>.
      </p>

      <h2>Prices</h2>
      <p>
        Prices, shipping, and tax are calculated on the server from the catalog and the published settings. The amount
        shown in your browser is not the amount that is charged. On the India storefront, prices are shown in rupees,
        with no decimals. Shipping is included in the product price. There is no separate shipping charge. Checkout
        opens only when a shipping price has been published and card payment is configured.
      </p>

      <h2>Placing an order</h2>
      <p>
        You may check out as a guest or with an account. Submitting checkout creates an unpaid order and opens Razorpay
        for the server total. The order is placed, and marked paid, only after the server verifies the payment with
        Razorpay. Closing the payment window, or a failed payment, does not place a paid order and does not send a
        paid-order confirmation.
      </p>
      <p>
        The device order records the three cartridge families chosen before it is added to the bag. A bundle records the
        cartridge trio selected on that product. A refill records the cartridge option selected. Stock is limited only
        for a product that has inventory tracking turned on. A confirmation is sent to the email on the order when email
        delivery is configured.
      </p>

      <h2>An order cannot be cancelled</h2>
      <p>
        After an order is placed, you cannot cancel it. You also cannot cancel one product from that order and keep the
        rest. A change of mind, a different shade, or a different address is not a cancellation. If the payment was not
        verified, there is no paid order to cancel.
      </p>

      <h2>A faulty product</h2>
      <p>
        If a product is faulty, you can apply for a replacement. Apply from the order in your account, or write through
        the contact page with the order number and what is wrong. The request is recorded. A replacement is sent only
        after the request is reviewed. This is a replacement of the faulty product, not a refund, and not a cancellation.
      </p>

      <h2>A second replacement</h2>
      <p>
        If that replacement is also faulty, or is otherwise not right, you can ask for a refund. The refund applies to
        the product that was replaced twice. It is not available while the first replacement is still the remedy. Ask
        from the order, or through the contact page, and say that the second replacement was not right.
      </p>

      <h2>An order that has not shipped</h2>
      <p>
        You can apply for a refund because an order has not shipped only after 20 days from the order date, and only if
        the order still has not shipped. A request before those 20 days is not accepted as a refund. Once the order has
        shipped, this reason no longer applies. A shipped order that is not faulty stays with you. It cannot be cancelled,
        and it is not refunded for a change of mind.
      </p>

      <h2>How a refund is paid</h2>
      <p>
        A refund is not paid when you submit the form. It is paid only after the request is reviewed and approved. An
        approved refund takes 7 to 15 days to reach the original payment method. The shop does not store your card
        number. Razorpay handles the payment, and the refund returns by that same route.
      </p>
      <p>
        The same 7 to 15 days applies to a refund after a second replacement and to a refund for an order that has not
        shipped within 20 days. The <Link href="/returns">returns page</Link> repeats these rules.
      </p>

      <h2>Shipping</h2>
      <p>
        {settings.shippingMessage} An order may ship from outside India. A delivery date is not promised on this page.
        When a shipment is created, a courier and a tracking number can be added to the order.
      </p>

      <h2>Accounts</h2>
      <p>
        An account keeps your orders, saved addresses, and invoices. You are responsible for the email and password on
        the account. Guest checkout is still available. Signing in with Google confirms the email. This shop does not
        receive your Google password.
      </p>

      <h2>Using the website</h2>
      <p>
        You may use the website to read about the products and to place an order. You may not misuse the checkout, the
        account, or the contact form, and you may not attempt to interfere with payment verification. Photographs and
        colour on screen are illustrative. A published ingredient list is shown where this shop has that list.
      </p>

      <h2>Trademarks</h2>
      <p>
        Yves Saint Laurent and related trademarks are the property of their respective owner. This site does not state
        that it is an official store. The shop name Rouge Sur Mesure and the pages of this website are used by{" "}
        {settings.sellerName} to sell this order.
      </p>

      <h2>Limits</h2>
      <p>
        These terms do not exclude a right that the law does not allow us to exclude. Apart from that, the shop’s
        responsibility for an order is to supply the product, replace it when these terms say so, or refund it when
        these terms say so. We are not responsible for a shade result that differs from a photograph, or for a delay
        once the order has shipped with a tracking number.
      </p>

      <h2>Changes</h2>
      <p>
        If these terms change, the date at the top of this page will change. The version published here applies to an
        order placed after that date. A change does not alter an order already placed.
      </p>

      <h2>Contact</h2>
      <p>
        This shop is sold by {settings.sellerName}. For a replacement, a refund request, or a question about these
        terms, use the <Link href="/contact">contact page</Link> and include the email and order number.
      </p>
    </main>
  );
}
