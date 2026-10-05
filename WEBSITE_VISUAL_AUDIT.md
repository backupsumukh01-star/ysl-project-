# Website visual inspection

The first inspection below was capture-only. A later fix pass changed the specific problems from that inspection. The fix-pass results are the current source of truth for those routes. Screenshots from the fix pass are in `visual-audit/fix-screenshots/`. The earlier 672 screenshots remain the before set.

## Fix pass — 2 October 2026

Rechecked the affected routes at 320, 375, 390, 430, 1280, and 1440, first screen and full page, plus add-to-bag, the bag drawer, refill, the mobile bag, signed-out account, help, and reference links. Local app: `http://localhost:3000`.

What changed, from the new screenshots:

- Shop at 1280 and 1440 is one spread. The portrait is on the left, fully visible, including the base. “The collection.”, the device name, $350, and Choose 3 trios sit in the column beside it. The portrait is 349×620 and ends above the fold (bottom 712 on an 800-tall screen, and the same on a 900-tall screen). Mobile shop measurements at 320 match the earlier page.
- Adding the device with Red, Orange, and Nude opens the bag. “Added to your bag.” is a quiet line under the bag header. The device and the three trios stay visible. There is no black bar over them. Close, quantity, and checkout remain available. Checked at 390 and 1440.
- `/product/cartridge-refill` does not use the device photograph. It shows the same kind of color capsule as the shop refill, in the selected cartridge color, with the sentence “Color reference for the selected cartridge. This is not a photograph of the refill.” The $31 price and the option list are on the first phone screen. Cart and bag lines for that product use the capsule, not the device photo. No refill photograph exists in the asset library.
- Signed-out Addresses and Security use the same pattern as Profile: heading, one sentence, Sign in. The address form, sign-out, and account deletion are not shown.
- `/reference` is still a separate visual system. It is not linked from the header, menu, footer, or search. `robots` now disallows `/reference`. The routes were left in place for development.
- Desktop gallery controls read as one row under the photograph: 1 / 7, Enlarge, Save. The group is about 185px wide, centered under the picture, not stretched to the column edges. Mobile stays one row under the image.
- Trio, refill, and bundle pages keep Add to bag as the only rouge button. Buy now and Save are underlined text.
- Homepage at 320×640 shows the photograph, “Custom lip color.”, the sentence, $350, and View the device on the first screen. The photograph is about 198×248.
- The mobile bag bar can be scrolled clear of the last included trio. Extra bottom padding was added so the set is not trapped under the bar.
- Help destinations are the section names, with a quiet arrow. The word Open is gone.

Still true, and not part of this pass: choosing the same trio family twice does not show a count on the chip. Experience is still loose on desktop. FAQ still contains “Anything not confirmed is left for admin to add.” The bundle photograph still cuts the lower part of the device. Short legal pages still end in the footer. Typing `/reference` still opens the other visual system. The Next.js development mark can still sit on the wordmark in this dev server.

Rechecked pages returned 200. No horizontal overflow. No image with `naturalWidth` 0. No page-error crashes on the rechecked routes. Checkout was not reopened.

## Prior inspection

Captured 2 October 2026, before the fix pass.

Captured 2 October 2026 from the development app served at `http://localhost:3000`. That is the same app behind the public tunnel. Page screenshots were taken after fonts and images settled, with the first-visit consent choice already saved, and with the Next.js development overlay hidden in the capture browser. A separate consent-banner shot shows the first visit.

The public tunnel was checked directly: `/` and `/shop` both returned HTTP 200.

LOCAL URL: http://localhost:3000

PUBLIC URL: https://animated-reception-guns-strategic.trycloudflare.com

## What was looked at

56 concrete URLs. Each one at 320, 375, 390, 430, 1280, and 1440. First screen and full page. 672 page screenshots, all files present.

Screenshots of the homepage, shop, device, trio, refill, bundle, experience, help, FAQ, about, contact, cart, checkout, account orders, profile, addresses, security, privacy, 404, and the reference storefront were opened and read. The other routes were measured for status, heading clearance, overflow, broken images, and console output, and their captured text was read.

This is not a pass. Several pages are calm and on-brand. Several are unfinished, confusing, or a different website.

## Route groups

### Customer routes

These are the shopper pages. Dynamic examples are real URLs that open.

| Route | Concrete URL |
| --- | --- |
| `/` | `/` |
| `/shop` | `/shop` |
| `/product/rouge-sur-mesure` | `/product/rouge-sur-mesure` |
| `/product/cartridge-trio-red` | `/product/cartridge-trio-red` |
| `/product/cartridge-trio-orange` | `/product/cartridge-trio-orange` |
| `/product/cartridge-trio-pink` | `/product/cartridge-trio-pink` |
| `/product/cartridge-trio-nude` | `/product/cartridge-trio-nude` |
| `/product/cartridge-trio-warm-red` | `/product/cartridge-trio-warm-red` |
| `/product/cartridge-trio-warm-nude` | `/product/cartridge-trio-warm-nude` |
| `/product/cartridge-trio-cool-nude` | `/product/cartridge-trio-cool-nude` |
| `/product/[slug]` | `/product/cartridge-refill` and `/product/rouge-sur-mesure-bundle` |
| `/experience` | `/experience` |
| `/faq` | `/faq` |
| `/about` | `/about` |
| `/contact` | `/contact` |
| `/help` | `/help` |
| `/cart` | `/cart` |
| `/checkout` | `/checkout` |
| `/track-order` | `/track-order` |
| `/wishlist` | `/wishlist` |
| `/offline` | `/offline` |
| `/account` | `/account` |
| `/account/login` | `/account/login` |
| `/account/verify` | `/account/verify?email=reviewer@example.com` |
| `/account/orders` | `/account/orders` |
| `/account/orders/[id]` | `/account/orders/sample` |
| `/account/orders/[id]/return` | `/account/orders/sample/return` |
| `/account/profile` | `/account/profile` |
| `/account/addresses` | `/account/addresses` |
| `/account/security` | `/account/security` |
| `/account/support` | `/account/support` |
| `/shipping` | `/shipping` |
| `/returns` | `/returns` |
| `/privacy` | `/privacy` |
| `/terms` | `/terms` |
| `/risk-disclosure` | `/risk-disclosure` |
| `/order-success` | `/order-success` |
| `/order-success/[orderId]` | `/order-success/sample` |
| `/invoice/[orderId]` | `/invoice/sample` returns the collection 404 |
| `/cartridges` | redirects to `/shop` |
| `/refills` | redirects to `/shop` |
| Unknown URL | `/missing-page` returns the collection 404 |

Header anchors, not separate pages: `/#colors`, and on the device page `#trios` and `#app`.

### Staff routes

- `/admin/login`
- `/admin`

These are not shopper pages. The logged-out admin screen is a plain email and password form plus a section list.

### Development / reference routes

Reachable by typing the URL. Not linked from the main header, footer, or search. `noindex`. They do not use the main header or footer.

- `/reference`
- `/reference/shop`
- `/reference/product/rouge-sur-mesure`
- `/reference/product/cartridge-trio-red`
- `/reference/product/cartridge-refill`
- `/reference/product/rouge-sur-mesure-bundle`
- `/reference/faq`
- `/reference/cartridges`
- `/reference/refills`
- `/reference/cart`
- `/reference/checkout`

## Public URLs

Base: `https://animated-reception-guns-strategic.trycloudflare.com`

Customer:

- https://animated-reception-guns-strategic.trycloudflare.com/
- https://animated-reception-guns-strategic.trycloudflare.com/shop
- https://animated-reception-guns-strategic.trycloudflare.com/product/rouge-sur-mesure
- https://animated-reception-guns-strategic.trycloudflare.com/product/cartridge-trio-red
- https://animated-reception-guns-strategic.trycloudflare.com/product/cartridge-trio-orange
- https://animated-reception-guns-strategic.trycloudflare.com/product/cartridge-trio-pink
- https://animated-reception-guns-strategic.trycloudflare.com/product/cartridge-trio-nude
- https://animated-reception-guns-strategic.trycloudflare.com/product/cartridge-trio-warm-red
- https://animated-reception-guns-strategic.trycloudflare.com/product/cartridge-trio-warm-nude
- https://animated-reception-guns-strategic.trycloudflare.com/product/cartridge-trio-cool-nude
- https://animated-reception-guns-strategic.trycloudflare.com/product/cartridge-refill
- https://animated-reception-guns-strategic.trycloudflare.com/product/rouge-sur-mesure-bundle
- https://animated-reception-guns-strategic.trycloudflare.com/experience
- https://animated-reception-guns-strategic.trycloudflare.com/faq
- https://animated-reception-guns-strategic.trycloudflare.com/about
- https://animated-reception-guns-strategic.trycloudflare.com/contact
- https://animated-reception-guns-strategic.trycloudflare.com/help
- https://animated-reception-guns-strategic.trycloudflare.com/cart
- https://animated-reception-guns-strategic.trycloudflare.com/checkout
- https://animated-reception-guns-strategic.trycloudflare.com/track-order
- https://animated-reception-guns-strategic.trycloudflare.com/wishlist
- https://animated-reception-guns-strategic.trycloudflare.com/offline
- https://animated-reception-guns-strategic.trycloudflare.com/account
- https://animated-reception-guns-strategic.trycloudflare.com/account/login
- https://animated-reception-guns-strategic.trycloudflare.com/account/verify?email=reviewer@example.com
- https://animated-reception-guns-strategic.trycloudflare.com/account/orders
- https://animated-reception-guns-strategic.trycloudflare.com/account/orders/sample
- https://animated-reception-guns-strategic.trycloudflare.com/account/orders/sample/return
- https://animated-reception-guns-strategic.trycloudflare.com/account/profile
- https://animated-reception-guns-strategic.trycloudflare.com/account/addresses
- https://animated-reception-guns-strategic.trycloudflare.com/account/security
- https://animated-reception-guns-strategic.trycloudflare.com/account/support
- https://animated-reception-guns-strategic.trycloudflare.com/shipping
- https://animated-reception-guns-strategic.trycloudflare.com/returns
- https://animated-reception-guns-strategic.trycloudflare.com/privacy
- https://animated-reception-guns-strategic.trycloudflare.com/terms
- https://animated-reception-guns-strategic.trycloudflare.com/risk-disclosure
- https://animated-reception-guns-strategic.trycloudflare.com/order-success
- https://animated-reception-guns-strategic.trycloudflare.com/order-success/sample
- https://animated-reception-guns-strategic.trycloudflare.com/invoice/sample
- https://animated-reception-guns-strategic.trycloudflare.com/cartridges
- https://animated-reception-guns-strategic.trycloudflare.com/refills
- https://animated-reception-guns-strategic.trycloudflare.com/missing-page

Reference:

- https://animated-reception-guns-strategic.trycloudflare.com/reference
- https://animated-reception-guns-strategic.trycloudflare.com/reference/shop
- https://animated-reception-guns-strategic.trycloudflare.com/reference/product/rouge-sur-mesure
- https://animated-reception-guns-strategic.trycloudflare.com/reference/product/cartridge-trio-red
- https://animated-reception-guns-strategic.trycloudflare.com/reference/product/cartridge-refill
- https://animated-reception-guns-strategic.trycloudflare.com/reference/product/rouge-sur-mesure-bundle
- https://animated-reception-guns-strategic.trycloudflare.com/reference/faq
- https://animated-reception-guns-strategic.trycloudflare.com/reference/cartridges
- https://animated-reception-guns-strategic.trycloudflare.com/reference/refills
- https://animated-reception-guns-strategic.trycloudflare.com/reference/cart
- https://animated-reception-guns-strategic.trycloudflare.com/reference/checkout

Staff:

- https://animated-reception-guns-strategic.trycloudflare.com/admin/login
- https://animated-reception-guns-strategic.trycloudflare.com/admin

## Header

The customer header is consistent: 64px, warm paper, serif wordmark “ROUGE”, quiet icons. Desktop nav is Shop, How it works, Colors, FAQ. Mobile uses a menu. Search, account, and bag open as panels. The mobile menu is clear: All products, How it works, Colors, App, FAQ, Profile, Orders, Support, Bag.

No customer page put its heading under the header. Measured heading tops sit below the 64px bar.

A small dark mark still sits on the top-left of the wordmark in these captures. This public URL is the development server, so a reviewer opening it in a normal browser can also see the Next.js development indicator. That mark is not part of the storefront.

The reference storefront replaces this header with a centered “ROUGE”, a search field, a black category bar, and pill filters.

## Homepage

The homepage is the strongest page. At 390 and 1440 the first screen is the device photograph, “Custom lip color.”, the $350 price, and “View the device”. The hierarchy is obvious. Pink family selection on the color block works.

At 320×640 the first screen now shows the photograph, “Custom lip color.”, what the device does, $350, and View the device. Shop the collection sits at the bottom edge. The photograph stays the largest element. 375, 390, and 430 were already showing the price and the primary action, and those widths were not restyled.

Desktop composition is balanced. The second image begins at the bottom of a 1440×900 screen, which is fine.

## Shop

Mobile shop is clear: “The collection.”, then the device photograph, then the name. Color selection works. After choosing Pink, the trio card shows the pink photograph, “Pink”, the shade line, $89, and Add to bag.

Desktop shop at 1280 and 1440 is now a centered spread. The full portrait, including the marble base, is on the left. The collection title and the device purchase sit in the right column. The portrait ends above the fold at both widths. Side margins remain; they are the margin around that spread, not a cropped product in an empty frame.

The refill row on the shop page is weaker than the device and trio. Under “Single refill” the image area is a pale panel with a flat color circle, not a product photograph. Next to the photographed products it looks like a placeholder.

## Device product

Mobile: photograph, then “1 / 7”, Enlarge, and Save in one row, then the name and $350. That order is right. The photograph is smaller than the homepage hero and floats in side space at 320.

Desktop: the portrait is uncropped and the thumbnails are a clean left rail. “1 / 7”, Enlarge, and Save are one short row centered under the photograph.

Choosing families works. A selected chip gets a dark frame. Choosing the same family twice does not show a count on the chip, so a customer cannot see that Red was picked twice. Add to bag opens the bag. The set contents list the device and the three trios.

The confirmation is the line “Added to your bag.” under the bag header. The device, the three trios, the price, and the quantity stay visible. Checked at 390 and 1440.

## Trio pages

All seven share one layout. Photograph first, then “Cartridge trio”, the family name, the existing description, $89, quantity, Add to bag, Buy now, Save. At 1440 the photograph is left and the purchase column is right. This is the closest product page to the homepage.

Add to bag is the only filled button. Buy now and Save are underlined text under it.

The palette section below is on the same paper as the rest of the page. Shade chips are small but readable.

## Refill and bundle

The refill page no longer uses the device photograph. There is no single-cartridge photograph in the project. The page uses a color capsule for the selected option and says it is a color reference, not a photograph of the refill. The $31 price and the option menu remain.

The bundle page has its own gift-box photograph, which is more honest. The box image is still cut at the bottom of the device. Add to bag is the only filled button. Buy now and Save are text. The native select remains.

“Reviews from this shop appear after a verified purchase.” appears on both. It is honest, and it reads like an empty-state apology under the price.

## How it works, FAQ, about, contact, help

How it works matches the homepage type. Steps are 01, title, sentence, photograph. On desktop the photograph is much taller than the sentence, so the text column has a large empty area beside the image. The page is understandable. It is looser than the homepage.

FAQ is one of the better secondary pages. Closed questions are a quiet list. Opening one shows the answer and swaps + for −. The line “Anything not confirmed is left for admin to add.” is internal language on a customer page.

About is on brand: serif headline, short paragraphs, two photographs.

Contact is a long stack of empty fields. The purpose is clear. The form is visually plain, which is acceptable, and it has no visible submit button on the first phone screen.

Help still uses Help as both the eyebrow and the title. Each destination is now the section name, with a quiet arrow: How it works, Ordering, Payment, Shipping, Tracking, Returns, Refunds, Account, Cartridge compatibility, Product care, Support. The word Open is gone. The links are unchanged.

## Bag and checkout

Empty bag and empty checkout are clear and on brand. The footer arrives on the same screen. That is acceptable for one sentence, and it makes the page feel short.

With a device set in the bag, the line shows the device photo, name, SKU, $350, quantity, and Remove. “This set contains” then repeats the device and each trio. The phone bar is still fixed. The page has enough bottom space that the last trio can be scrolled fully above the bar. Quantity change and Remove both work.

A device-only line cannot be created. The product page will not add the device until three families are chosen.

Checkout with that bag does not take payment. The page says “Checkout is closed”, “A shipping price has not been published, so checkout stays closed. No charge was made.”, and shows the line Red · Orange · Nude at $350. The primary button is “Return to bag”. That state is clear.

## Account

Login, verify, account home, orders, profile, and support are the same brand when signed out: eyebrow, serif heading, one sentence, a rouge Sign in button. Verify shows the email from the query string and does not reveal a code.

Addresses and Security now use that same signed-out pattern. A signed-out customer sees the heading, a short explanation, and Sign in. The address form and the sign-out and deletion actions stay behind a session.

Unknown order and the return form explain that the order was not found or that a return policy is not published. Those states are understandable.

## Legal, tracking, wishlist, offline, success, 404

Shipping, returns, privacy, terms, and risk disclosure use the same serif heading, small eyebrow, and a comfortable reading width. They say they are placeholders. That is clear. On a desktop they are short, so the footer sits on the first screen. The type is good. The pages feel like documents, which is right, and they feel slightly empty.

Track an order is a two-field form. Wishlist empty says “Nothing saved yet.” Saving the device from the product page then shows it on the wishlist. Offline explains that the shop needs a connection. Order success with nothing stored says “No order is stored on this device.” An unknown confirmation uses the collection 404 plus “That order was not found.” Invoice without an owned order is the same 404. `/missing-page` is the same 404. These are consistent with each other.

## Reference storefront

`/reference` is a different shop on the same domain.

White background. Search bar. Black bar. Pill filters. Sort menu. Product cards with outlined “ADD TO CART”. Several trios use drawn swatch placeholders labeled “Color reference placeholder”. The refill card uses a smear photograph that the main shop does not use. Product pages show empty stars and “No verified reviews yet.” The reference bag and checkout have a newsletter block and “Find a store · not configured”.

A customer who opens that URL will not think they are still on the homepage. The header, menu, footer, and search do not link to it. `robots` disallows `/reference`. The routes were not deleted and were not restyled.

## UX questions

Answers are for the customer site. Reference is called out where it differs.

1. Understand the page in three seconds. Yes on home, shop mobile, device, trios, FAQ, about, cart, login, and the 404. Weaker on help, because every block says Open. Weaker on refill, because the picture is the device. No on `/reference`.

2. Primary action. Obvious on home, device, trios, and empty cart. On refill and bundle, Add to bag, Buy now, and Save compete. On closed checkout, Return to bag is clear. On addresses, there is a form and no obvious next step when signed out.

3. Visual noise. Low on home, about, FAQ, and legal. Higher on the device bag drawer because of the black confirmation block. High on `/reference`.

4. Competing with the primary action. The three-button stack on trio, refill, and bundle. The toast over the bag. The desktop shop’s empty space, which weakens the product.

5. Premium. Home, about, device photography, and trio photography feel expensive. Help, the address form, the security pills, the shop refill circle, and the reference cards do not.

6. Same brand as the homepage. Yes for shop, device, trios, about, FAQ, contact, cart, checkout, and account home. Partly for experience, help, and legal. No for `/reference` and `/admin`.

7. Confusing. Refill photograph. Addresses while signed out. Security actions while signed out. Choosing the same trio family twice without a visible count. The bag toast covering the item just added.

8. Cheap or generic. “Open” on help. The native select on refill and bundle. Empty stars on reference products. “ADD TO CART” outlines. The flat refill circle on the shop page.

9. Unnecessarily large. Homepage photograph at 320. Shop’s empty desktop field. Experience photograph beside a two-line caption. Account pages’ empty paper above the footer.

10. Unnecessarily small. Gallery thumbnails are small but usable. Trio shade names under the palette are small. The reference placeholder drawings are small and unlabeled as real products.

## CROSS-SITE INCONSISTENCIES

- Homepage, shop, and product pages are warm paper. `/reference` is white with a black bar.
- Customer buttons are a rouge pill. Reference buttons are a white rectangle with a black outline and tracked uppercase type.
- Customer headings are large serif. Reference listings use small uppercase labels and sans product names.
- Customer product photography is full-bleed and photographic. Reference trios are flat color diagrams labeled as placeholders.
- The shop refill uses a color circle. The refill product page uses the device photograph. The reference refill uses a lipstick-smear image. Three different pictures for one product.
- Device and trio pages have no review chrome. Reference product pages show five empty stars.
- Customer bag says “Your bag.” Reference bag says “YOUR BAG” and adds a newsletter form.
- Customer checkout, when closed, is a short honest statement. Reference checkout is an empty-bag page inside the other chrome.
- Account pages use a text Sign in button in rouge. Security uses outlined pills, one of them rouge-bordered.
- Help uses a repeated “Open” text link. Other pages use a rouge button or a quiet underlined link with a real destination name.
- Desktop shop is a left-weighted single feature with a blank right side. Desktop device and trio pages use a two-column editorial layout. They do not feel like the same grid.
- The customer footer is a dark close with four groups. Reference replaces it with its own footer, including “Find a store · not configured”.
- Admin is a separate utilitarian screen. That is acceptable for staff, and it is still a third visual system on the same host.

## Prioritized problems

### P0

None found. No customer route overflowed horizontally. No product image finished broken. No page left its heading under the header. Checkout does not pretend payment is open.

### P1

These were the prior P1 findings. The fix pass addressed them as follows.

- Bag confirmation no longer covers the drawer. It is a short status line in the bag header.
- Desktop shop is a portrait-and-text spread. The device photograph is fully visible at 1280 and 1440.
- The refill page no longer shows the device. It uses a labeled color reference because no refill photograph exists.
- Signed-out Addresses uses the Sign in pattern. The blank form is gone.
- Reference is still a second visual system if the URL is typed. It is not in customer navigation, and crawlers are told not to index it. It was not restyled.

### P2

ROUTE: `/product/rouge-sur-mesure`
VIEWPORT: 390
PROBLEM: Selecting the same family twice does not show a count on the chip.
WHY IT MATTERS: The bag can contain two identical trios while the picker looks like one choice.
SUGGESTED FIX: Show the count on the chip.

ROUTE: `/shop` and `/product/cartridge-refill`
VIEWPORT: 390 and 1440
PROBLEM: The refill is a color capsule. There is no cartridge photograph in the project, so this is intentional. It is still visually lighter than the photographed device and trio.
WHY IT MATTERS: A customer can tell it is not the device. It does not look like a finished product shot.
SUGGESTED FIX: Use a real refill photograph if one is later supplied. Do not generate one.

ROUTE: `/experience`
VIEWPORT: 1440
PROBLEM: A short caption sits beside a very tall photograph, with a large empty text column.
WHY IT MATTERS: The step feels loose compared with the homepage.
SUGGESTED FIX: Keep the photograph uncropped and align the number and title to a tighter block.

ROUTE: `/faq`
VIEWPORT: 390
PROBLEM: “Anything not confirmed is left for admin to add.” is on the customer page.
WHY IT MATTERS: It sounds like an internal note.
SUGGESTED FIX: Remove that sentence from the customer view when copy is next edited. Do not invent a replacement claim.

### P3

ROUTE: `/shipping`, `/returns`, `/privacy`, `/terms`, `/risk-disclosure`, empty `/cart`, empty `/checkout`, signed-out account pages
VIEWPORT: 1440×900
PROBLEM: After one or two sentences, the rest of the first screen is empty paper and then the footer.
WHY IT MATTERS: The pages are readable and feel slightly unfinished.
SUGGESTED FIX: Keep the type. Do not add fake content. A slightly tighter block is enough.

ROUTE: `/product/rouge-sur-mesure-bundle`
VIEWPORT: 1440
PROBLEM: The gift-box photograph cuts off the bottom of the device.
WHY IT MATTERS: The product is partially hidden.
SUGGESTED FIX: Show the existing photograph in full.

ROUTE: `/reference/product/rouge-sur-mesure` and the other reference products
VIEWPORT: 1440
PROBLEM: Empty star marks sit above “No verified reviews yet.”
WHY IT MATTERS: Stars imply a rating that does not exist.
SUGGESTED FIX: Remove the star marks on that storefront if it stays available.

ROUTE: customer header in this development tunnel
VIEWPORT: all
PROBLEM: A dark development indicator can sit on the wordmark.
WHY IT MATTERS: A reviewer of the public URL will think the logo is broken.
SUGGESTED FIX: Review on a production build, or hide the development indicator while reviewing.

## Technical check

Measured on all 56 URLs at all 6 widths after the failed captures were retaken.

- HTTP: customer pages 200, except `/invoice/sample` and `/missing-page`, which are 404 and render the collection not-found page. `/cartridges` and `/refills` end at `/shop` with 200.
- Reference and admin routes returned 200 on the retry.
- Horizontal overflow: none.
- Heading under the header: none on the customer site.
- Broken images (`naturalWidth` 0): none.
- Hydration warnings in the captured console: none.
- Console errors that are expected, not crashes: 401 on signed-out account, orders, profile, addresses, and support. 404 on unknown order, unknown confirmation, and unknown invoice.
- A few image requests were aborted when the capture changed viewport. The images still painted.
- During the first capture the development server stopped and later routes failed with connection refused. Those routes were captured again after the server was back. The retry left no failed rows.
- Missing fonts: Fraunces and Outfit loaded on the customer pages that were inspected. No missing-font fallback was recorded.

## Final summary

TOTAL ROUTES: 56 concrete URLs captured (43 customer, including redirects and the 404, 11 reference, 2 staff)

TOTAL SCREENSHOTS: 672 page screenshots (56 × 6 × 2) plus 32 interaction screenshots

MOBILE WIDTHS: 320, 375, 390, 430

DESKTOP WIDTHS: 1280, 1440

BROKEN ROUTES: none after the retry

BROKEN IMAGES: none

CONSOLE ERRORS: expected 401 and 404 responses only. No hydration warning.

HYDRATION WARNINGS: none recorded

MOBILE OVERFLOW: none

DESKTOP LAYOUT ISSUES after the fix pass: experience steps are still loose. Reference is still a different layout if the URL is opened directly. The shop spread has ordinary side margins.

P0: 0

P1 after the fix pass: none of the previous P1 defects remain on the customer journey. Reference is still reachable by URL.

P2 still open: hidden duplicate trio count, shop refill shown as a color capsule, loose experience layout, admin language on FAQ. Homepage at 320, gallery controls, cart bar clearance, button hierarchy, help labels, and signed-out security were corrected.

P3: short pages ending in empty paper, bundle photo crop, empty stars on reference, development indicator on the wordmark.

TOP 10 VISUAL PROBLEMS still open:

1. Typing `/reference` still opens a white catalog with placeholder drawings.
2. Experience photographs still dwarf their captions on desktop.
3. The shop and refill page use a color capsule because no refill photograph exists.
4. The bundle gift-box photograph still cuts the lower part of the device.
5. Short legal and empty-state pages still end in the footer on a tall desktop.
6. The development indicator can sit on the wordmark while this dev server is public.
7. FAQ still shows an internal sentence.
8. Help still repeats the word Help as eyebrow and title.
9. Desktop shop side margins are wide around the centered spread. The product itself is no longer cropped.
10. Reference product pages still show empty stars.

TOP 10 UX PROBLEMS still open:

1. Picking the same trio family twice is not shown as a count on the chip.
2. Checkout is correctly closed, and a customer with a full bag still cannot pay until a shipping price exists. The page says so.
3. The reference URL is a second shopping path if someone knows it.
4. The refill has no product photograph, so the customer sees a labeled color reference.
5. The bundle photograph does not show the whole device in the box.
6. Signed-in account behavior was not retested. No session was created.
7. The shop refill capsule is still simpler than the photographed device and trio.
8. FAQ contains language written for an admin, not a customer.
9. Empty bag and legal pages feel short on desktop.
10. A customer cannot tell from the chip alone that one family was chosen more than once.

TOP 10 CROSS-SITE INCONSISTENCIES:

1. Reference is a white catalog. The customer site is warm paper and editorial.
2. Reference uses outlined uppercase buttons. The customer site uses a rouge pill.
3. Reference trios are diagrams. Customer trios are photographs.
4. Three different pictures represent the refill.
5. Reference shows empty stars. The customer product pages do not.
6. Desktop shop and desktop product pages do not share a grid.
7. Help’s “Open” links do not match other links.
8. Security pills do not match account Sign in.
9. Reference footer and customer footer are different components.
10. Admin is a third, utilitarian interface on the same host.

## Not tested

- A signed-in account, a real order list, a real order detail, or a real return. No customer account was created and no OTP was submitted.
- Payment success, a paid confirmation, and a real invoice. Checkout is closed. No payment was attempted.
- A device-only bag line. The product page refuses to add the device before three families are chosen.
- The shopper’s own browser bag and wishlist. Interaction used a separate browser profile.
- Production build. These shots are the development server, which is what the public tunnel serves.
- Every one of the 672 images was not opened by eye. Every route was measured. The pages named above were visually inspected at mobile and desktop.
