"use client";

import Link from "next/link";
import { useCart, lineKey } from "@/components/cart-provider";
import { Price, QuantitySelector } from "@/components/commerce";
import { lineKind, shippingChargeLabel } from "@/lib/product";
import { CartLineImage } from "@/components/refill-mark";
import { chosenTrios, SetContains } from "@/components/set-contains";
import { BagPriceList, bagShelf, bagSubtotalLabel, bagTotalLabel, useBagQuote } from "@/components/bag-quote";
import { useMarket, useMoney } from "@/components/market";
import "./cart.css";

export default function CartPage() {
  const market = useMarket();
  const money = useMoney();
  const { items, ready, subtotal, setQuantity, removeItem, clear } = useCart();
  const quote = useBagQuote(items, ready);
  const subtotalLabel = bagSubtotalLabel(market.currency, money, items, subtotal, quote);
  const totalLabel = bagTotalLabel(money, quote);
  const shelf = bagShelf(market.currency, money, items, quote);
  const shippingKnown = quote?.shippingConfigured === true && quote.shipping != null;

  return (
    <main id="main" className="page bag-page">
      <p className="kicker">Bag</p>
      <h1>Your bag.</h1>
      {!ready && !items.length ? null : !items.length ? (
        <div className="empty bag-empty">
          <p className="bag-empty__title">Your bag is empty.</p>
          <p className="bag-empty__note">The device, a cartridge trio, and a single refill.</p>
          <Link className="btn btn-gold" href="/shop">
            Shop now
          </Link>
        </div>
      ) : (
        <div className="split">
          <div>
            {items.map((line) => (
              <article className="line" key={lineKey(line)}>
                <CartLineImage slug={line.slug} image={line.image} label={line.variantName} size={160} />
                <div>
                  <h2>{line.name}</h2>
                  {lineKind(line.sku) ? <p className="muted">{lineKind(line.sku)}</p> : null}
                  {chosenTrios(line.variantName).length === 3 ? null : line.slug === "rouge-sur-mesure" ? (
                    <p className="muted"><Link href="/product/rouge-sur-mesure#trios">Choose any 3 trios</Link></p>
                  ) : line.variantName ? (
                    <p className="muted">{line.variantName}</p>
                  ) : null}
                  {line.sku ? <p className="bag-sku">{line.sku}</p> : null}
                  <Price amount={line.price} compareAt={line.compareAt} />
                  <div className="bag-actions">
                    <QuantitySelector value={line.quantity} onChange={(quantity) => setQuantity(lineKey(line), quantity)} />
                    <button type="button" className="bag-remove" onClick={() => removeItem(lineKey(line))}>
                      Remove
                    </button>
                  </div>
                </div>
                {chosenTrios(line.variantName).length === 3 ? (
                  <div className="bag-set">
                    <SetContains trios={chosenTrios(line.variantName)} quantity={line.quantity} />
                  </div>
                ) : null}
              </article>
            ))}
            <button type="button" className="bag-clear" onClick={clear}>
              Remove all
            </button>
          </div>
          <aside className="bag-summary">
            <BagPriceList
              shelf={shelf}
              subtotal={subtotalLabel}
              shipping={!quote ? "Checking" : shippingKnown ? shippingChargeLabel(quote.shipping, quote.currency) : "Not published"}
              total={shippingKnown && totalLabel ? totalLabel : ""}
            />
            <Link className="btn btn-gold btn-full" href="/checkout">
              Checkout
            </Link>
            {quote && !shippingKnown ? <p className="muted">Checkout stays closed until a shipping price is set. No charge is made.</p> : null}
            <Link className="bag-link" href="/shop">
              Continue shopping
            </Link>
          </aside>
          <div className="bag-pay">
            <p>
              <span>
                Total
                {shelf.saving ? <small>Saving {shelf.saving}</small> : null}
              </span>
              <span>{shippingKnown && totalLabel ? totalLabel : subtotalLabel}</span>
            </p>
            <Link className="btn btn-gold btn-full" href="/checkout">
              Checkout
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
