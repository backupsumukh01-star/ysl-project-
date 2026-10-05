# Website route inventory

Discovered from `app/**/page.tsx`, header, footer, search, drawers, and in-page links. There is no `pages/` app and no `middleware.ts`. API route handlers under `app/api/` are not pages and are not listed as customer screens.

Static product folders take precedence over `app/product/[slug]/page.tsx`. `/cartridges` and `/refills` redirect to `/shop`. `/shop?type=…` links exist, and the shop page does not read that query.

| Route | Source | Purpose | Dynamic | Navigation entry | Customer accessible | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | `app/page.tsx` | Homepage | No | Logo | Yes | Active | Primary nav: Shop, How it works, Colors, FAQ |
| `/shop` | `app/shop/page.tsx` | Collection | No | Header, footer, menu, search | Yes | Active | Device, seven trios, refill |
| `/product/rouge-sur-mesure` | `app/product/rouge-sur-mesure/page.tsx` | Device product | No | Homepage CTA, shop, search, footer | Yes | Active | Dedicated page, not the slug template |
| `/product/cartridge-trio-red` | `app/product/cartridge-trio-red/page.tsx` | Red trio | No | Shop color options | Yes | Active | `TrioStory` |
| `/product/cartridge-trio-orange` | `app/product/cartridge-trio-orange/page.tsx` | Orange trio | No | Shop color options | Yes | Active | `TrioStory` |
| `/product/cartridge-trio-pink` | `app/product/cartridge-trio-pink/page.tsx` | Pink trio | No | Shop color options | Yes | Active | `TrioStory` |
| `/product/cartridge-trio-nude` | `app/product/cartridge-trio-nude/page.tsx` | Nude trio | No | Shop color options | Yes | Active | `TrioStory` |
| `/product/cartridge-trio-warm-red` | `app/product/cartridge-trio-warm-red/page.tsx` | Warm Red trio | No | Shop color options | Yes | Active | `TrioStory` |
| `/product/cartridge-trio-warm-nude` | `app/product/cartridge-trio-warm-nude/page.tsx` | Warm Nude trio | No | Shop color options | Yes | Active | `TrioStory` |
| `/product/cartridge-trio-cool-nude` | `app/product/cartridge-trio-cool-nude/page.tsx` | Cool Nude trio | No | Shop color options | Yes | Active | `TrioStory` |
| `/product/cartridge-refill` | `app/product/[slug]/page.tsx` | Single refill | Yes | Shop, account “My refills”, ecosystem guide | Yes | Active | No dedicated folder |
| `/product/rouge-sur-mesure-bundle` | `app/product/[slug]/page.tsx` | Device plus one trio | Yes | Ecosystem guide only | Yes | Active | Not in All products or the menu |
| `/product/[slug]` | `app/product/[slug]/page.tsx` | Any other catalog slug | Yes | Search results | Yes, if the slug exists | Active | Unknown slug calls `notFound()` |
| `/experience` | `app/experience/page.tsx` | How it works | No | Header “How it works”, search, help | Yes | Active | Five photo steps |
| `/faq` | `app/faq/page.tsx` | Questions | No | Header, footer, search | Yes | Active | Shared `FaqList` |
| `/about` | `app/about/page.tsx` | Brand story | No | Footer, search | Yes | Active | Campaign and vanity images |
| `/contact` | `app/contact/page.tsx` | Support form | No | Footer, search, help link | Yes | Active | Form plus published contact lines only |
| `/help` | `app/help/page.tsx` | Help index | No | Not in header or footer | Yes, by URL | Active | Links onward to shop, shipping, account, contact |
| `/cart` | `app/cart/page.tsx` | Bag | No | Header bag, menu, drawer | Yes | Active | Empty until items are stored on the device |
| `/checkout` | `app/checkout/page.tsx` | Checkout | No | Bag, drawer | Yes | Active | Closed until shipping and payment are configured |
| `/track-order` | `app/track-order/page.tsx` | Order lookup | No | Help page | Yes, by URL | Active | Not in header or footer |
| `/wishlist` | `app/wishlist/page.tsx` | Saved products | No | Account home, product save | Yes | Active | Empty until something is saved |
| `/offline` | `app/offline/page.tsx` | Offline message | No | Not linked in nav | Yes, by URL | Active | No retry control |
| `/account` | `app/account/page.tsx` | Account home | No | Header account, menu | Yes | Active | Signed-out state asks to sign in |
| `/account/login` | `app/account/login/page.tsx` | Email code sign-in | No | Header account, account home | Yes | Active | OTP, not a password |
| `/account/verify` | `app/account/verify/page.tsx` | Enter the code | No | After login submits | Yes | Active | Reads `?email=` |
| `/account/orders` | `app/account/orders/page.tsx` | Order list | No | Menu, account home | Yes | Active | Unsigned request shows the API message |
| `/account/orders/[id]` | `app/account/orders/[id]/page.tsx` | One order | Yes | An order card | Yes, with a real id | Active | Unknown id has no order |
| `/account/orders/[id]/return` | `app/account/orders/[id]/return/page.tsx` | Return request | Yes | Order detail | Yes, with a real id | Active | Depends on a signed-in order |
| `/account/profile` | `app/account/profile/page.tsx` | Profile | No | Not in the current menu | Yes, by URL | Active | Account screen |
| `/account/addresses` | `app/account/addresses/page.tsx` | Addresses | No | Not in the current menu | Yes, by URL | Active | Account screen |
| `/account/security` | `app/account/security/page.tsx` | Security | No | Not in the current menu | Yes, by URL | Active | Account screen |
| `/account/support` | `app/account/support/page.tsx` | Account support | No | Account home | Yes | Active | Signed-in tickets |
| `/shipping` | `app/shipping/page.tsx` | Shipping statement | No | Footer, search | Yes | Active | Price unpublished |
| `/returns` | `app/returns/page.tsx` | Returns statement | No | Footer, search | Yes | Active | Policy unpublished |
| `/privacy` | `app/privacy/page.tsx` | Privacy placeholder | No | Footer | Yes | Active | Marked as a placeholder |
| `/terms` | `app/terms/page.tsx` | Terms placeholder | No | Footer | Yes | Active | Marked as a placeholder |
| `/risk-disclosure` | `app/risk-disclosure/page.tsx` | Risk placeholder | No | Footer | Yes | Active | Marked as a placeholder |
| `/order-success` | `app/order-success/page.tsx` | Local confirmation | No | Not linked until an order is stored | Yes | Active | Empty when `rsm-order` is absent |
| `/order-success/[orderId]` | `app/order-success/[orderId]/page.tsx` | Server confirmation | Yes | After payment verify | Yes, with a real id | Active | Unknown id shows a load error |
| `/invoice/[orderId]` | `app/invoice/[orderId]/page.tsx` | Invoice | Yes | An owned order | Yes, only for that account’s order | Not found without an owned order | `notFound()` otherwise |
| `/cartridges` | `app/cartridges/page.tsx` | Old cartridges URL | No | Ecosystem copy still links `/refills` style paths | Yes | Redirect | `redirect("/shop")` |
| `/refills` | `app/refills/page.tsx` | Old refills URL | No | Experience and ecosystem links | Yes | Redirect | `redirect("/shop")` |
| Unknown URL | `app/not-found.tsx` | Missing page | No | Mistyped address | Yes | Not found | Example used in the audit: `/missing-page` |
| `/reference` | `app/reference/page.tsx` | Alternate storefront home | No | Not in the main header | Yes, by URL | Active | Separate reference chrome |
| `/reference/shop` | `app/reference/shop/page.tsx` | Alternate shop | No | Reference frame | Yes, by URL | Active | Not the live shop |
| `/reference/product/[slug]` | `app/reference/product/[slug]/page.tsx` | Alternate product | Yes | Reference listing | Yes, for a known offer | Active | Device, trios, refill, bundle |
| `/reference/faq` | `app/reference/faq/page.tsx` | Alternate FAQ | No | Reference footer | Yes, by URL | Active | Separate from `/faq` |
| `/reference/cartridges` | `app/reference/cartridges/page.tsx` | Alternate cartridges | No | Reference frame | Yes, by URL | Active | Does not redirect |
| `/reference/refills` | `app/reference/refills/page.tsx` | Alternate refills | No | Reference frame | Yes, by URL | Active | Does not redirect |
| `/reference/cart` | `app/reference/cart/page.tsx` | Alternate bag | No | Reference frame | Yes, by URL | Active | Shares the same bag storage |
| `/reference/checkout` | `app/reference/checkout/page.tsx` | Alternate checkout | No | Reference bag | Yes, by URL | Active | Separate from `/checkout` |
| `/admin/login` | `app/admin/login/page.tsx` | Staff sign-in | No | Admin panel link | No | Staff | Not a shopper page |
| `/admin` and `/admin/[...section]` | `app/admin/[[...section]]/page.tsx` | Staff tools | Yes | After staff sign-in | No | Staff | Logged-out view is the panel gate |

Header hash links, not separate pages: `/#colors`, `/product/rouge-sur-mesure#trios`, `/product/rouge-sur-mesure#app`.

Colors in the header go to `/#colors` on the homepage. App in the mobile menu goes to the product page anchor.
