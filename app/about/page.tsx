import type { Metadata } from "next";
import { PageBack } from "@/components/page-back";
import { Media } from "@/components/media";
import { product } from "@/lib/product";
import "../quiet.css";

export const metadata: Metadata = {
  title: "About",
  description: "The idea behind Rouge Sur Mesure: personal color, held in a luxury object.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main id="main" className="page quiet-page">
      <PageBack href="/shop">All products</PageBack>
      <p className="kicker">About</p>
      <h1>Color, made personal.</h1>
      <div className="prose">
        <p>
          Rouge Sur Mesure is presented here as a beauty object: matte black, quilted, edged in gold. The interest is
          the shade you choose to live with, not a corporate history.
        </p>
        <p>
          Personalization, on this site, means looking closely. Swatches. A finished smear. A screen of three
          overlapping circles. A portrait of color worn on the lip.
        </p>
        <p>
          Technology stays in the background. The companion screen is shown. Mechanisms that the photographs do not
          show are left unsaid.
        </p>
      </div>
      <div className="split" style={{ marginTop: 32 }}>
        <Media {...product.images.campaign} ratio="ratio-wide" />
        <Media {...product.images.vanity} />
      </div>
    </main>
  );
}
