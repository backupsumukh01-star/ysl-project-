# Website route health

Checked at `http://localhost:3000` in headless Chrome. Viewports were set directly: 320×640, 375×812, 390×844, 430×932, 1280×800, 1440×900. DevTools was not open. The Next.js development overlay was hidden only inside the screenshot browser.

“Overflow” means the document was wider than the viewport. None of the 56 URLs overflowed at any width.

A cancelled image request (`net::ERR_ABORTED`) during navigation is not a broken image. No image finished loading with a natural width of 0.

| Route | HTTP | Render | Images | Mobile | Desktop | Interactions | Console |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 200 | Pass | Pass | Pass | Pass | Pass. Primary CTA, secondary CTA, color family, menu, search | Pass |
| `/shop` | 200 | Pass | Pass | Pass | Pass | Pass. Family select updates the trio link. Refill add to bag works | Pass |
| `/product/rouge-sur-mesure` | 200 | Pass | Pass | Pass | Fail. Gallery tools collapse into a vertical letter stack at 1280 and 1440 | Pass. Seven families, three selections, add to bag | Pass |
| `/product/cartridge-trio-red` | 200 | Pass | Pass | Pass | Pass | Pass via the shop card | Pass |
| `/product/cartridge-trio-orange` | 200 | Pass | Pass | Pass | Pass | Same trio template | Pass |
| `/product/cartridge-trio-pink` | 200 | Pass | Pass | Pass | Pass | Selecting Pink on the shop points here | Pass |
| `/product/cartridge-trio-nude` | 200 | Pass | Pass | Pass | Pass | Same trio template | Pass |
| `/product/cartridge-trio-warm-red` | 200 | Pass | Pass | Pass | Pass | Same trio template | Pass |
| `/product/cartridge-trio-warm-nude` | 200 | Pass | Pass | Pass | Pass | Same trio template | Pass |
| `/product/cartridge-trio-cool-nude` | 200 | Pass | Pass | Pass | Pass | Same trio template | Pass |
| `/product/cartridge-refill` | 200 | Pass | Pass | Pass | Pass | Add to bag from the shop | Pass. One image request was aborted during navigation, not a broken file |
| `/product/rouge-sur-mesure-bundle` | 200 | Pass | Pass | Pass | Pass | Not added to the bag in this pass | Pass |
| `/experience` | 200 | Pass | Pass | Pass | Pass | Header link opens the menu item | Pass. One image request aborted during navigation |
| `/faq` | 200 | Pass | Pass | Pass | Pass | Accordion opens and closes | Pass |
| `/about` | 200 | Pass | Pass | Pass | Pass | Footer link | Pass |
| `/contact` | 200 | Pass | Pass | Pass | Pass | Empty submit shows the field errors | Pass |
| `/help` | 200 | Pass | Pass | Pass | Pass | Not in the header. Page links work as ordinary anchors | Pass |
| `/cart` | 200 | Pass | Pass | Pass | Pass | Quantity, remove, checkout, empty state | Pass |
| `/checkout` | 200 | Pass | Pass | Pass | Pass | Empty bag and the closed-checkout copy | Pass |
| `/track-order` | 200 | Pass | Pass | Pass | Pass | Unknown order returns “No order matched those details.” | Pass |
| `/wishlist` | 200 | Pass | Pass | Pass | Pass | View, remove, empty state | Pass |
| `/offline` | 200 | Pass | Pass | Pass | Pass | No retry control exists | Pass |
| `/account` | 200 | Pass | Pass | Pass | Pass | Sign-in link | Pass |
| `/account/login` | 200 | Pass | Pass | Pass | Pass | Send code reaches `/account/verify` | Pass |
| `/account/verify` | 200 | Pass | Pass | Fail. Heading starts under the fixed header | Fail. Same overlap | Code field is visible | Pass |
| `/account/orders` | 200 | Pass | Pass | Fail. Heading is under the header and no list is visible | Fail. Same overlap | Menu links here | Pass |
| `/account/orders/sample` | 200 | Pass | Pass | Pass | Pass | Unsigned. 401 then 404 from the order API | Real 401/404 responses, expected without a session |
| `/account/orders/sample/return` | 200 | Pass | Pass | Fail. Heading under the header | Fail. Same overlap | Form is on the page | Pass |
| `/account/profile` | 200 | Pass | Pass | Pass. No `h1`; the sign-in line clears the header | Pass | Unsigned | 401 from the account API |
| `/account/addresses` | 200 | Pass | Pass | Fail. Heading under the header | Fail. Same overlap | Form fields are visible below the header | Pass |
| `/account/security` | 200 | Pass | Pass | Fail. Heading under the header | Fail. Same overlap | Actions are visible below the header | 401 from the account API |
| `/account/support` | 200 | Pass | Pass | Fail. Heading under the header and no list is visible | Fail. Same overlap | Linked from the account home | Pass |
| `/shipping` | 200 | Pass | Pass | Pass | Pass | Footer link | A 401 was logged. The page text still rendered |
| `/returns` | 200 | Pass | Pass | Pass | Pass | Footer link | Pass |
| `/privacy` | 200 | Pass | Pass | Pass | Pass | Footer link | Pass |
| `/terms` | 200 | Pass | Pass | Pass | Pass | Footer link | Pass |
| `/risk-disclosure` | 200 | Pass | Pass | Pass | Pass | Footer link | Pass |
| `/order-success` | 200 | Pass | Pass | Pass | Pass | Empty device state: no stored order | Pass |
| `/order-success/sample` | 200 | Pass | Pass | Pass | Pass | Screenshot remained on “Loading your confirmation.” | Pass |
| `/invoice/sample` | 404 | Pass. Not-found page | Pass | Pass | Pass | No owned order | The 404 is the expected response |
| `/cartridges` | 200 | Pass. Lands on `/shop` | Pass | Pass | Pass | Redirect | Pass |
| `/refills` | 200 | Pass. Lands on `/shop` | Pass | Pass | Pass | Redirect | Pass |
| `/missing-page` | 404 | Pass. Not-found page | Pass | Pass | Pass | Not linked | The 404 is the expected response |
| `/reference` | 200 | Pass | Pass | Pass | Pass | Not in the main header | Pass |
| `/reference/shop` | 200 | Pass | Pass | Pass | Pass | Reference frame | Pass |
| `/reference/faq` | 200 | Pass | Pass | Pass | Pass | Reference footer | Pass |
| `/reference/cartridges` | 200 | Pass | Pass | Pass | Pass | Reference frame | Pass |
| `/reference/refills` | 200 | Pass | Pass | Pass | Pass | Reference frame | Pass |
| `/reference/cart` | 200 | Pass | Pass | Pass | Pass | Reference frame | Pass |
| `/reference/checkout` | 200 | Pass | Pass | Pass | Pass | Reference frame | Pass |
| `/reference/product/rouge-sur-mesure` | 200 | Pass | Pass | Pass | Pass | Reference listing | Pass |
| `/reference/product/cartridge-trio-red` | 200 | Pass | Pass | Pass | Pass | Reference listing | Pass |
| `/reference/product/cartridge-refill` | 200 | Pass | Pass | Pass | Pass | Reference listing | Pass |
| `/reference/product/rouge-sur-mesure-bundle` | 200 | Pass | Pass | Pass | Pass | Reference listing | Pass |
| `/admin/login` | 200 | Pass | Pass | Pass | Pass | Staff only | Pass |
| `/admin` | 200 | Pass | Pass | Pass | Pass | Logged-out gate | Pass |

Header height on the storefront was 64px wherever a header was measured. Reference pages use their own top bar.

No captured console message contained a hydration mismatch. Unsigned account calls return 401. An unknown invoice returns 404. Those are recorded above and are not treated as script crashes.
