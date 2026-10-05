# Production configuration

Local development can keep using SQLite and `http://localhost:3000`. Do not copy this machine's database or secrets into production, and do not invent the values below.

Nothing in this list is complete until the owner supplies the real value. A blank or placeholder in `.env.local` is not a production setting.

The Razorpay webhook for a live site is:

`https://<production-domain>/api/webhooks/razorpay`

Register that URL in Razorpay. Do not register localhost as the production webhook.

## Required before accepting orders

Technical configuration. Checkout stays closed, or payment and email stay unavailable, until these are real.

- Shipping amount — `SHIPPING_FLAT_MINOR`, whole cents. An empty value is not free shipping.
- Shipping enable flag — `SHIPPING_ENABLED=true` only after the amount is set. If shipping is enabled and the amount is missing or invalid, checkout stays closed.
- Tax, if any — `TAX_RATE_BPS`. Leave `0` when no tax is collected. Do not invent a rate. `800` would mean 8.00%.
- Razorpay Key ID — `RAZORPAY_KEY_ID`. The checkout page receives this so Razorpay can open. Do not prefix it with `NEXT_PUBLIC_`.
- Razorpay secret — `RAZORPAY_KEY_SECRET`. Server only.
- Razorpay webhook secret — `RAZORPAY_WEBHOOK_SECRET`. Server only.
- Email provider — `EMAIL_PROVIDER` of `resend` or `smtp`. Until this is set, mail is not sent.
- Email sender — `EMAIL_FROM`.
- Email credentials — `RESEND_API_KEY`, or `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASSWORD`.
- Support email — `NEXT_PUBLIC_SUPPORT_EMAIL`. Until this is set, the site says the address will be published shortly.
- Store owner email — `STORE_OWNER_EMAIL`, for the paid-order notice.
- Production database — hosted PostgreSQL, not `prisma/dev.db`. Set `DATABASE_URL` to the pooled URL and `DIRECT_URL` to the direct URL. The first deploy runs `prisma migrate deploy`. Then run the catalog seed once. Do not reset the local SQLite file, and do not seed demo reviews into production.
- Production site URL — `NEXT_PUBLIC_SITE_URL`. Do not hard-code localhost as the live site.
- Razorpay webhook — the path above, on that site URL.

## Business information

These are owner decisions. They are unpublished. Do not invent them in the storefront.

- Legal seller name
- Seller address
- Return policy — window, conditions, and any refund terms
- Shipping policy — the amount above, plus any delivery timing the owner is willing to state
- Optional free-shipping threshold — `SHIPPING_FREE_THRESHOLD_MINOR`, cents, only if the owner wants one

## Optional / remaining content

- Refill photograph — none is in the asset library. The refill page uses a color capsule and says it is not a photograph.
- Any additional product photography the owner wants to add later

## Public versus server-only

Public, and safe to prefix with `NEXT_PUBLIC_`: site URL, currency, support email, phone, and hours.

Server only: database URL, Razorpay Key ID, Razorpay secret, webhook secret, email credentials, owner email, auth secret, and admin password.
