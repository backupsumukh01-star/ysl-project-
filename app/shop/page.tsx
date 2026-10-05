import type { Metadata } from "next";
import { BuyGrid } from "@/components/buy-grid";
import "./shop.css";

export const metadata: Metadata = {
  title: "Shop",
  description: "The Rouge Sur Mesure device, cartridge trios, and a single refill.",
};

export default function ShopPage() {
  return (
    <main className="page shop-house">
      <header className="shop-intro">
        <p className="kicker">Shop</p>
        <h1>The collection.</h1>
        <p className="lede">The device, a cartridge trio, and a single refill.</p>
      </header>
      <BuyGrid />
    </main>
  );
}
