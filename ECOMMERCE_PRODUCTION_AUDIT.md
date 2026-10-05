# Rouge Sur Mesure — production-readiness audit

Audit only. No storefront or application code was changed for this report.

Date: 30 September 2026. Local server checks in this pass returned HTTP 200 for the routes listed below. Mobile and desktop layout were verified in earlier browser passes for the homepage, shop, device page, trio pages, cart, and footer. This pass did not re-measure every viewport, and it did not open the browser console. A live Razorpay payment was not placed. An email was not delivered to an inbox.

Statuses:

- COMPLETED — the behavior exists and is safe to rely on for that item
- PARTIAL — the behavior exists and still needs configuration, business information, or a real test
- MISSING — it is not built
- BLOCKED — it cannot be finished without something only you can supply
- NEEDS TESTING — the code path exists and has not been proven with a real provider

---

# A. Public storefront

| Route | Exists | HTTP | Mobile / desktop | Images | Data | Placeholder | Blocker |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Yes | 200 | Earlier passes | Device photos present | Yes | No | Public URL is local |
| `/shop` | Yes | 200 | Earlier passes | Trio and refill cards use an empty “image needed” frame, not a broken file | 10 active products | Trio photos | Photos |
| `/product/rouge-sur-mesure` | Yes | 200 | Earlier passes | Device photos | $350 | Complimentary set names are intentionally unnamed | Payment and shipping |
| `/product/cartridge-trio-red` | Yes | 200 earlier this session | Earlier passes | Empty frame. `red-trio.png` missing | R1 · R2 · R3, $89 | Photo | Photo |
| `/product/cartridge-trio-pink` | Yes | Same pattern | Earlier passes | `pink-trio.png` missing | P1 · P2 · P3, $89 | Photo | Photo |
| `/product/cartridge-trio-orange` | Yes | Same pattern | Earlier passes | `orange-trio.png` missing | O1 · O2 · O3, $89 | Photo | Photo |
| `/product/cartridge-trio-nude` | Yes | Same pattern | Earlier passes | `nude-trio.png` missing | N1 · N2 · N3, $89 | Photo | Photo |
| `/product/cartridge-trio-warm-red` | Yes | Same pattern | Earlier passes | `warm-red-trio.png` missing | O1 · R1 · R2, $89 | Photo | Photo |
| `/product/cartridge-trio-warm-nude` | Yes | Same pattern | Earlier passes | `warm-nude-trio.png` missing | N1 · O1 · N3, $89 | Photo | Photo |
| `/product/cartridge-trio-cool-nude` | Yes | 200 | Earlier passes | `cool-nude-trio.png` missing | N1 · P1 · N3, $89 | Photo | Photo |
| `/product/cartridge-refill` | Yes | 200 earlier | Catalog pass | No product photo. `swatches.png` is not used as the photo | $31 | Photo | Photo |
| `/product/rouge-sur-mesure-bundle` | Yes | 200 earlier | Catalog pass | Packaging image | $350. Included trio is not named | Bundle contents | Business description |
| `/cart` | Yes | 200 | Earlier passes | Line images fall back when a photo is missing | Bag prices | No | None for the bag |
| `/checkout` | Yes | 200 | Form exists | No broken product photos required | Summary from the bag | Shipping and payment cannot start | Yes |
| `/order-success` and `/order-success/[orderId]` | Yes | 200 on the index | Not rechecked this pass | — | Shown after a verified payment | No successful payment has been made | Payments |
| `/about` | Yes | 200 | Earlier product section | Showcase image | Yes | No | None |
| `/experience` | Yes | 200 | Not rechecked this pass | — | How it works | No | None |
| `/faq` | Yes | 200 | Earlier pass | — | FAQ copy | No | None |
| `/contact` | Yes | 200 | Not rechecked this pass | — | Form stores a ticket | Support address is an example address | Inbox |
| `/shipping` | Yes | 200 earlier | Not rechecked this pass | — | Says flat shipping is not set | Yes | Shipping rules |
| `/returns` | Yes | 200 earlier | Not rechecked this pass | — | Says a return policy is not published | Yes | Policy |
| `/privacy` | Yes | 200 earlier | Not rechecked this pass | — | Page says it is a placeholder | Yes | Policy |
| `/terms` | Yes | 200 earlier | Not rechecked this pass | — | Placeholder. It still says an order does not charge a card | Yes | Policy |
| `/risk-disclosure` | Yes | 200 earlier | Not rechecked this pass | — | Placeholder | Yes | Policy |
| `/account/login` | Yes | 200 earlier | Not rechecked this pass | — | Email code | Code is only logged | Email provider |
| `/account`, `/account/profile`, `/account/addresses`, `/account/orders` | Yes | 200 earlier | Not rechecked this pass | — | Own data after sign-in | No | Email login |
| `/wishlist` | Yes | 200 | Save tested earlier | — | Local save, account sync after sign-in | No | None |
| `/track-order` | Yes | 200 | Not rechecked this pass | — | Lookup by order number and email | Tracking fields empty until entered | Carrier data |
| `/help`, `/cartridges`, `/refills`, `/account/support` | Yes | 200 for help, cartridges, refills | Not rechecked this pass | — | Supporting pages | No | None |
| `/invoice/[orderId]` | Yes | Not requested this pass | — | — | Receipt for an order the customer owns | No paid order in this test | Payments |
| `/offline` | Yes | Not requested | — | — | Offline fallback | — | None |
| `/reference` and `/reference/*` | Yes | Not the live shop | — | Separate reference storefront | Second catalog | Placeholders inside reference | Should not be advertised. `robots.txt` currently allows it |

Broken-image check this pass: the seven trio photograph files are absent. The product pages use an empty frame, so the browser is not loading a 404 image as the product photo. `hero.png`, `showcase.png`, `packaging.png`, and `swatches.png` are present. Console errors were not rechecked in this pass.

Footer and mobile menu exist. Social links stay hidden because no social URLs are configured.

---

# B. Product catalog

Database read on 30 September 2026. One active row per product. No duplicate slugs. `trackInventory` is false and stock is 0 on every row. The cart cap is 10. That cap is not warehouse stock.

| Product | Slug | Price | Codes | Active | Image |
| --- | --- | --- | --- | --- | --- |
| Rouge Sur Mesure | `rouge-sur-mesure` | $350 | Device, 3 complimentary sets, 9 cartridges, brush. Set names are not stored | Yes | Device photos |
| Cartridge Trio — Red | `cartridge-trio-red` | $89 | R1, R2, R3 | Yes | Missing |
| Cartridge Trio — Pink | `cartridge-trio-pink` | $89 | P1, P2, P3 | Yes | Missing |
| Cartridge Trio — Orange | `cartridge-trio-orange` | $89 | O1, O2, O3 | Yes | Missing |
| Cartridge Trio — Nude | `cartridge-trio-nude` | $89 | N1, N2, N3 | Yes | Missing |
| Cartridge Trio — Warm Red | `cartridge-trio-warm-red` | $89 | O1, R1, R2 | Yes | Missing |
| Cartridge Trio — Warm Nude | `cartridge-trio-warm-nude` | $89 | N1, O1, N3 | Yes | Missing |
| Cartridge Trio — Cool Nude | `cartridge-trio-cool-nude` | $89 | N1, P1, N3 | Yes | Missing |
| Cartridge refill | `cartridge-refill` | $31 | O2, O3, R3, N2, N3 | Yes | No product photo |
| Rouge Sur Mesure bundle | `rouge-sur-mesure-bundle` | $350 | “Device and one of the seven supported trios.” The trio is not named | Yes | Packaging image |
| Accessory — to be confirmed | `accessory-to-be-confirmed` | No price | None | Inactive, hidden | Not sold |

SKUs are stored on the product row and copied onto order lines. Related products come from the catalog: trios relate to the device, and a refill is related only when the trio contains a refill code. Pink and Warm Red relate to the device only. Cart lines merge on product id plus variant. Currency on the site setting is USD.

Incomplete on purpose: trio photographs, refill photograph, the three complimentary set names, and the named trio inside the bundle.

---

# C. Cart

| Check | Result |
| --- | --- |
| Add, remove, increase, decrease | Implemented. Minimum 1 |
| Maximum | 10, or tracked stock when tracking is on. Tracking is off |
| Duplicate lines | Same product and variant merge. A second line is not created |
| Several products | Separate lines |
| Persistence | `localStorage` key `rsm-cart`. Survives refresh in the same browser |
| Drawer, cart page, empty cart | Implemented |
| Checkout handoff and Buy Now | Open checkout. They do not complete payment |
| Subtotal and currency | Client display uses catalog prices. The server quote replaces those prices at checkout |
| Mobile | Drawer and sticky Add to Bag were verified in earlier passes |

The bag is trustworthy as a list of product ids and quantities. It is not the price authority. Checkout ignores a browser price and re-quotes on the server.

NEEDS TESTING: a fresh browser after clearing storage, and a signed-in cart merge through `/api/cart/merge`, were not repeated in this pass.

---

# D. Checkout

Collected: name, email, phone, one street address, city, state, postcode, country. There is no separate billing address. The stored address is the shipping address.

Summary shows products, quantities, and the server quote once checkout is allowed. Coupon entry exists and is validated on the server. Shipping and tax have no business rates.

Validation rejects a missing field, a bad email, a short phone, an empty bag, an unknown product, and a quantity outside 1–10. Signed-in checkout must use the account email. Guest checkout is allowed. Rate limit is 20 attempts per 10 minutes per IP, in memory only.

Duplicate submit uses an idempotency key. The same key returns the existing order instead of a second order.

Where the flow stops today:

1. `quoteCart` returns `SHIPPING_UNCONFIRMED` because neither a flat rate nor a free-shipping threshold is stored. No order row is created. No charge is made.
2. If a shipping rule is later stored, `createCheckoutOrder` writes a `PENDING_PAYMENT` order and then calls Razorpay. `RAZORPAY_KEY_ID` is absent, so that call returns `PAYMENT_NOT_CONFIGURED`. The bag stays. The pending order can remain in the database with inventory released.
3. Razorpay Checkout, the success page, and the confirmation email are never reached.

Failed payment, cancelled modal, and successful verify exist in code. They have not been exercised against Razorpay. Refresh keeps the bag. The back button was not retested in this pass.

---

# E. Razorpay

| Check | Result |
| --- | --- |
| `RAZORPAY_KEY_ID` | ABSENT. Checkout cannot open |
| `RAZORPAY_KEY_SECRET` | SET locally. Value is not recorded here |
| `RAZORPAY_WEBHOOK_SECRET` | SET locally. Value is not recorded here |
| `RAZORPAY_ENVIRONMENT` | SET. Treat it as test until a live payment is accepted |
| Order creation | Server posts the quoted minor amount and currency. It does not run while the Key ID is missing |
| Checkout initialization | Loads Razorpay only after a provider order id exists |
| Signature verification | HMAC-SHA256, timing-safe compare |
| Amount, currency, payment id, Razorpay order id | Before paid, the server fetches the payment and requires status `captured` plus matching ids, amount, and currency |
| Internal order | Verify loads the order and requires its stored Razorpay order id to match |
| Webhook | `POST /api/webhooks/razorpay`. Bad signature is rejected. Processed event ids return success without applying again. A processing error returns HTTP 500 so Razorpay can retry |
| Failed and cancelled | Failed webhook marks the payment failed and does not mark the order paid. Closing the modal does not mark the order paid |
| Refund | Admin can request a refund for the order total. Completion waits for `refund.processed` |
| Production webhook URL | Not registered. The site URL is local |

Would a successful payment create exactly one paid order if the webhook arrives more than once?

Yes for the order. `markOrderPaid` returns immediately when `paymentStatus` is already `PAID`, and the database update checks again inside the transaction. It does not insert a second order. A simultaneous double delivery can both pass the first check and both attempt the confirmation email before the first send is stored. The email dedupe key stops a later send after the first is logged as sent. That race needs a real double-webhook test. It does not create a second order.

NEEDS TESTING: one captured test payment, one failed payment, one cancelled modal, one duplicate webhook, and one amount mismatch.

---

# F. Order system

Payment and fulfillment are separate fields.

Payment: `PENDING`, `PAID`, `FAILED`, `REFUND_PENDING`, `PARTIALLY_REFUNDED`, `REFUNDED`.

Fulfillment: `PENDING_PAYMENT`, `PAID`, `PROCESSING`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `RETURN_REQUESTED`, `RETURNED`, `REFUND_PENDING`, `REFUNDED`, `FAILED_DELIVERY`, `RETURN_TO_ORIGIN`.

There is no separate `payment_pending` label. Unpaid orders use fulfillment `PENDING_PAYMENT` and payment `PENDING`.

| Field | Present |
| --- | --- |
| Order number, customer name, email, phone | Yes |
| Shipping address | Yes, one JSON address |
| Billing address | No |
| Products, quantity, unit price, sku | Yes, on order items |
| Discount, shipping, tax, total, currency, coupon code | Yes. Shipping and tax are 0 until rules exist |
| Razorpay order id and payment id | Yes, on the order and payment rows |
| Courier, tracking number, tracking URL, shipping method, delivery estimate | Yes, empty until an admin enters them |
| Created and updated timestamps | Yes |
| Status history | No event log of fulfillment changes. Payment events exist. Order changes overwrite `status` and `updatedAt` |

A paid order is stored in the database. Permanence is limited by local SQLite and the lack of an automated backup.

---

# G. Customer and owner emails

Provider: none. `EMAIL_PROVIDER` is empty. `EMAIL_FROM` is absent. `STORE_OWNER_EMAIL` is absent. The support address is an example address, so templates do not present it as a real reply-to.

Development writes the HTML body to `EmailLog`. Production without a provider records `EMAIL NOT CONFIGURED` and does not treat that row as sent. Nothing in this audit was delivered to an inbox.

Templates include store name, order number, date, customer, line items, quantities, unit prices, subtotal, shipping, tax, discount, total, currency, shipping address, and payment status. Card numbers are not included. Tracking is included on shipped and out-for-delivery mail only when those fields are filled.

| Email | Trigger | Recipient | Actually sent |
| --- | --- | --- | --- |
| Login code | OTP request | Customer | Logged only |
| Welcome | After verification | Customer | Logged only |
| Order confirmation | Server marks paid | Customer | Logged only, and only after paid |
| Payment confirmation | Same moment | Customer | Logged only |
| Payment failed | Failed payment | Customer and owner slot | Logged only. Owner slot records “not configured” |
| Processing, packed, shipped, out for delivery, delivered | Admin fulfillment change | Customer | Logged only |
| Cancelled | Customer cancel before shipment | Customer and owner slot | Logged only |
| Refund initiated and completed | Admin refund and refund webhook | Customer and owner slot | Logged only |
| Return requested, approved, rejected | Customer request and admin decision | Customer and owner slot | Logged only |
| Support ticket | Contact form | Customer and support address | Logged only |
| Owner new paid order | Server marks paid | `STORE_OWNER_EMAIL` only | Not sent. Variable is absent |

There is no customer password, so there is no password-reset email. Account deletion request mail exists.

To make email production-ready: choose Resend or SMTP, set `EMAIL_FROM`, set `STORE_OWNER_EMAIL` to a real inbox, replace the example support address, and receive one message of each type above.

---

# H. Shipping

| Item | Result |
| --- | --- |
| Rates | BLOCKED. Not stored. Checkout refuses to start |
| Free-shipping threshold | BLOCKED. Not stored |
| Countries and regions | BLOCKED. Any country string is accepted |
| Delivery estimate | BLOCKED. No promise is published |
| Carrier, tracking number, tracking URL | Fields and admin inputs exist. Empty |
| Fulfillment status | Implemented |
| Address validation | Required fields only. No postal lookup |
| Customer tracking | `/track-order` |
| Shipped email | Includes tracking only after it is entered |
| Return address | BLOCKED |

The public shipping page says flat shipping is not set and that the text is not a legal promise.

---

# I. Tax

`taxRateBps` is not stored, so calculated tax is 0. Tax is added on top of the merchandise total. It is not included in the product price. There are no country or state rules. Checkout, the order row, emails, and admin can show the stored tax number, which is currently zero. No rate was invented. Tax treatment is BLOCKED.

---

# J. Inventory

Inventory tracking is disabled on every product. Stock and reserved are 0. Reservation, decrement on payment, and restore on cancel run only when `trackInventory` is true. The cart maximum of 10 still applies. Out of stock is not enforced. Admin can edit stock on a product. Webhook retries do not decrement stock while tracking is off. If tracking is turned on later, the paid transaction decrements once and the duplicate-paid path does not decrement again. Real quantities were not invented. Inventory is inactive.

---

# K. Customer account

Email one-time code. No password. Session cookie is httpOnly, SameSite lax, and secure when `NODE_ENV` is production. Logout exists. Profile, addresses, order list, and order detail exist and are limited to that user on the server. Wishlist syncs after sign-in. Reviews can be submitted from a paid order. Account security can request deletion. It does not erase the user immediately.

A customer can see their own order history after they are signed in with the same email. They cannot see it until login email is actually delivered. Guest orders are tied to an account only when that user is signed in at checkout.

NEEDS TESTING: sign in with a delivered code and open a paid order.

---

# L. Reviews

A review requires a signed-in user and a `PAID` order containing that product. One review per user, order, and product. New reviews stay pending. Admin can approve them. Public product pages keep “No reviews yet” until an approved review exists. Structured data has no rating. No reviews were created for this audit.

---

# M. Admin

Admin login is a separate user with a password hash. Customer sessions cannot call admin APIs. The local admin email is an example address.

| Feature | Result |
| --- | --- |
| Login and logout | Implemented. Identity is not a production operator |
| Dashboard | Implemented |
| Orders, status, tracking, refund action | Implemented |
| Customers | Implemented as a list |
| Products and catalog editor | Implemented |
| Inventory editing | Fields exist. Tracking is off |
| Payments | Seen on the order. No separate payments section |
| Refunds | Implemented. Needs Razorpay |
| Returns | Implemented. Policy text is unpublished |
| Coupons | Implemented. No launch code is seeded |
| Reviews | Moderation implemented |
| Testimonials | Implemented and not used as public reviews |
| Content and settings | Implemented |
| Support tickets | Implemented |
| Email log and retry | Implemented. Retry needs a stored body and a provider |
| Shipping workflow | Tracking fields on the order |
| Audit log | MISSING as a general admin audit trail. Payment events and email logs exist |
| Roles and permissions | One admin. No staff roles |

---

# N. Database

Prisma datasource provider is SQLite. `DATABASE_URL` is set. Models cover users, sessions, admins, addresses, products, images, variants, carts, orders, order items, payments, payment events, webhooks, reviews, coupons, support tickets, email logs, settings, Meta events, refunds, returns, wishlist, stock alerts, and risk flags.

There is no billing-address table and no fulfillment history table.

SQLite on this machine is not safe for concurrent real orders. Before real customers: create a hosted database, point `DATABASE_URL` at it, and run `prisma migrate deploy`. Do not seed that database with development orders. This audit did not migrate anything.

---

# O. Backups

`docs/OPERATIONS.md` says to copy `prisma/dev.db` by hand and to restore only while the app is stopped. There is no schedule, no off-site storage, no automated backup, and no tested restore of an order. Order recovery after a disk failure is MISSING.

---

# P. Analytics

Browser helpers exist for `PageView`, `ViewContent`, `AddToCart`, and `InitiateCheckout`, with product id, value, and currency when the caller supplies them. `Purchase` is sent from the server only after `paymentStatus` is `PAID`, with value and currency. The browser success handler does not create the purchase by itself. Server Purchase and browser Purchase are meant to share an event id.

`NEXT_PUBLIC_GA_ID` is absent, so GA does nothing. Meta ids are empty, so those events are not delivered. No test event was sent in this audit.

---

# Q. Meta ads

| Item | State |
| --- | --- |
| `NEXT_PUBLIC_META_PIXEL_ID` | ABSENT |
| `META_DATASET_ID` | EMPTY |
| `META_ACCESS_TOKEN` | EMPTY |
| Domain verification | BLOCKED. Site URL is local |
| Conversions API and event id | Code exists. It does not run without the token and pixel |
| ViewContent, AddToCart, InitiateCheckout, Purchase | Coded. Purchase waits for a paid order |

You need to provide the pixel id, dataset id if you use one, the access token, and a verified production domain. Do not add those values until the payment test is real.

---

# R. Legal

Privacy, terms, returns, shipping, and risk disclosure pages load and say they are placeholders or not legal promises. Terms still say an order does not charge a card. That sentence is unsafe once Razorpay is live. Business legal name, address, support inbox, and policies were not invented. Contact information in the environment is an example address. No warranty wording was added.

---

# S. Domain and production

| Item | State |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | SET and local |
| HTTPS and DNS | Not a production domain |
| Cookies | Secure only when Node is in production |
| CORS / origin guard | Checkout and admin writes check the request origin |
| Webhook URL | Not registered |
| `robots.txt` and `sitemap.xml` | HTTP 200. Sitemap host is the local site URL. `/reference` is allowed |
| Canonical URLs | On product and legal pages. They follow the local site URL |
| Favicon and OG | App metadata exists. Confirm the public image on the real domain |
| Email, database, Razorpay | Not production-configured |
| Error monitoring and cron | Not deployed. Abandoned cart is a manual admin action |

---

# T. Security

| Check | Result |
| --- | --- |
| Customer and admin auth | Separate. Admin APIs require an admin session |
| Order access | Server checks the owner |
| Session cookie | httpOnly, SameSite lax, secure in production |
| CSRF | Origin guard on state-changing routes |
| Price and quantity | Server quote. Quantity 1–10 |
| Payment | Signature plus captured amount, currency, and ids. Browser success is not enough |
| Webhook | Signature required |
| Secrets | `.env` is gitignored. `.env.example` has empty values. The Razorpay secret is not sent to the browser |
| Email logs | Production does not store the HTML body |
| Rate limit | In memory. It does not protect more than one server |
| Coupons | Server limits |
| Reviews | Paid-order requirement and a duplicate constraint |
| SQL | Prisma |
| File upload | Review image must be an `https` or site path. There is no upload pipeline |
| Status history and error text | Errors do not include secrets |

Not proven: a hostile checkout from another origin, login-code abuse across two servers, and a live webhook replay. No destructive test was run.

---

# U. Performance

Not measured in this pass. No Core Web Vitals numbers are claimed. Product photos that exist use the image component. Missing trio files avoid a 404 image request by using an empty frame. The shop still has those empty frames. Database access is local SQLite with no production cache or connection pool. Checkout is dynamic. The main risk later is unoptimized trio photographs once they are added, and SQLite under concurrent checkout.

---

# V. Final lists

## LIST 1 — COMPLETED

- Homepage, shop, device page, seven trio pages, refill, bundle, cart, FAQ, about, experience, footer, and mobile menu render.
- Catalog names, prices, and cartridge combinations match the expected list. Inactive accessory is hidden. No duplicate products.
- Cart add, remove, quantity, cap of 10, merge of the same product, drawer, cart page, and browser persistence.
- Server-side price quote. Browser prices are not trusted.
- Checkout field validation, guest checkout, idempotency key, and in-memory rate limit.
- Razorpay signature check, captured-payment amount and currency check, webhook signature, duplicate event id, and retry on failure.
- One paid order when the same webhook is processed again after the first update commits.
- Order record for customer, lines, money, shipping address, and Razorpay ids.
- Separate payment and fulfillment statuses, including paid, processing, shipped, delivered, cancelled, refunded, and returned.
- Email templates for confirmation, payment, failure, fulfillment, cancel, refund, and return. No card numbers.
- Unconfigured email is logged as not sent.
- Account OTP, session, profile, addresses, own orders, wishlist, and paid-order reviews.
- Admin login, orders, tracking fields, refunds, returns, coupons, reviews, products, and customers.
- Product structured data with price and currency and without ratings.
- `robots.txt` and `sitemap.xml` respond.

## LIST 2 — PARTIAL

- Checkout page. It stops before payment.
- Razorpay code. Secret and webhook secret exist. Key ID does not. No captured payment has been tested.
- Email templates and provider adapter. Nothing has been received.
- Order success, invoice, and customer order history. They need a real paid order and a delivered login code.
- Admin. The operator email is an example address.
- Shipping, tracking, and tax fields. Values are empty or zero.
- Inventory code. Tracking is off.
- Returns and refunds workflow. The policy is unpublished. Refund completion needs Razorpay.
- Analytics and Meta code. Ids are empty. Purchase waits for a paid order.
- SEO. Canonical host is local.
- Security controls listed above. They are not proven on a public https host.
- Backups. A manual copy is documented. It is not automated.

## LIST 3 — MISSING

- A separate billing address.
- An order status history.
- Automated database backups, off-site storage, and a tested restore.
- Error monitoring.
- A scheduler for abandoned-cart mail.
- Staff roles beyond one admin.
- A general admin audit log.
- Country and state tax rules.
- Country restrictions for shipping.
- Postal-address verification.
- Partial-refund detection on the webhook. The webhook marks a processed refund as a full refund.
- A lock that makes the confirmation email impossible to send twice during a simultaneous webhook pair.
- Production domain, HTTPS, and a hosted database. These are configuration, and they are also absent.
- Trio and refill photographs.

## LIST 4 — I MUST PROVIDE

- Legal business name and address
- Support email, phone, and hours
- Owner email
- Production domain and HTTPS
- Razorpay Key ID, and confirmation that the account can charge USD
- Razorpay live account after the test payment succeeds
- Email provider account, from address, and SMTP or Resend credentials
- Shipping countries, rates, any free-shipping threshold, delivery wording, carrier, and return address
- Tax decision and rate, if tax is collected
- Privacy, terms, returns, shipping, and risk-disclosure text
- A real admin email and password
- The seven trio photographs, and a refill photograph if you want one
- The three complimentary cartridge set names, if they should be shown
- Whether the bundle includes a named trio
- Whether inventory should stay unlimited
- App Store URL and Google Play URL, if the app buttons should appear
- Meta pixel id, dataset id, and access token
- Analytics id, if GA is used
- Whether `/reference` should stay public

---

PRODUCTION READINESS:

- Storefront: 88%
- Ecommerce backend: 70%
- Payments: 35%
- Emails: 30%
- Shipping: 15%
- Tax: 15%
- Inventory: 30%
- Customer accounts: 68%
- Admin: 70%
- Analytics/Meta: 25%
- Legal: 10%
- Infrastructure/security: 48%

These percentages mean “ready for a real customer,” not “a file exists.” The storefront is the furthest along. Payments, email, shipping, tax, legal, and hosting are not ready.

### BLOCKERS BEFORE FIRST REAL ORDER

1. Shipping is unset, so checkout stops before an order is created and before any payment.
2. `RAZORPAY_KEY_ID` is missing, so a card cannot be charged and an order cannot be marked paid.
3. Email is not configured, so the customer and the owner receive no confirmation even after a future paid order.
4. The database is SQLite on this machine. A real order can be lost, and concurrent checkouts are unsafe.
5. The site URL is local, so a customer cannot reach the store.
6. Terms still say an order does not charge a card, and the other legal pages are placeholders.
7. Support and admin addresses are example addresses, so there is no real inbox for the customer or the operator.

### RECOMMENDED IMPLEMENTATION ORDER

1. Decide shipping countries, rates, and any free-shipping threshold, then store them. Checkout cannot pass this step.
2. Decide tax. Store a rate only if you will collect tax.
3. Replace privacy, terms, returns, shipping, and risk disclosure, including the sentence that says an order does not charge a card.
4. Set a real support inbox, owner inbox, and admin login.
5. Put the app on the production https domain.
6. Create the hosted database, point `DATABASE_URL` at it, run the production migration, and set an automated backup.
7. Add `RAZORPAY_KEY_ID`, register the webhook, and run one test payment: success, failure, cancel, and a duplicate webhook.
8. Connect the email provider and confirm the customer and owner messages for that test order.
9. Enter a real tracking number on that test order and confirm the shipped email and the tracking page.
10. Switch Razorpay to live only after those tests pass.
11. Add the trio photographs.
12. Add Meta and analytics ids only after a captured payment produces one Purchase event.
