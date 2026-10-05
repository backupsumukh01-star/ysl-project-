import Image from "next/image";
import Link from "next/link";
import { approvedReviews, getProductBySlug, relatedProducts } from "@/lib/catalog";
import { Money } from "@/components/market";
import { db } from "@/lib/db";

/** Bundle page only. Device FAQ answers stay unchanged. */
function bundleFaqAnswer(question: string, answer: string) {
  if (question === "What is Rouge Sur Mesure?") {
    return "Rouge Sur Mesure is a custom lip color creator. This bundle is the device plus one supported cartridge trio. The separate device product includes 3 complimentary cartridge sets — 9 cartridges total — and a retractable lip brush. Additional cartridge trios and refills are available separately.";
  }
  if (question === "Are cartridges included with the device?") {
    return "The separate device product includes the Rouge Sur Mesure device, 3 complimentary cartridge sets — 9 cartridges total — and a retractable lip brush. The names of those three sets are not listed until they are configured. This bundle is the device plus one supported cartridge trio.";
  }
  if (question === "How many cartridges are included?") {
    return "This bundle includes one supported cartridge trio. The separate device product includes 3 complimentary cartridge sets — 9 cartridges total. Those three families are not named until they are configured.";
  }
  return answer;
}

export async function EcosystemGuide({ slug }: { slug?: string }) {
  const prisma = db();
  if (!prisma) return null;
  const current = await getProductBySlug(slug || "rouge-sur-mesure");
  const [families, app, faqs, related, reviews] = await Promise.all([
    prisma.cartridgeFamily.findMany({ orderBy: { sortOrder: "asc" }, include: { trios: true, cartridges: { orderBy: { code: "asc" } } } }),
    prisma.appRequirement.findUnique({ where: { id: "default" } }),
    prisma.productFaq.findMany({ where: { scope: "global" }, orderBy: { sortOrder: "asc" } }),
    current ? relatedProducts(current.id) : Promise.resolve([]),
    current ? approvedReviews(current.id) : Promise.resolve([]),
  ]);
  if (!families.length || !current) return null;
  const isBundle = current.type === "BUNDLE";
  const activeFamily = families.find((family) => family.trios.some((trio) => trio.slug === current.slug));
  const refills = families.flatMap((family) => family.cartridges).filter((cartridge) => cartridge.soldIndividually);
  const rating = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "";

  return (
    <div className="product-story">
      <section className="section" id="about">
        <div className="frame narrow">
          <p className="kicker">What it is</p>
          <h2 className="title">{current.name}</h2>
          <p>{current.description}</p>
          {current.type === "DEVICE" ? <p>This purchase includes 3 complimentary cartridge sets — 9 cartridges total. Additional trios and refills are separate products.</p> : null}
        </div>
      </section>

      <section className="section">
        <div className="frame narrow">
          <p className="kicker">What comes with it</p>
          <h2 className="title">In this product</h2>
          <p>{current.included || "Information coming soon"}</p>
        </div>
      </section>

      <section className="section" id="colors">
        <div className="frame">
          <p className="kicker">Cartridge compatibility</p>
          <h2 className="title">Seven supported trios</h2>
          <p>Choose one family. The device only makes color inside these trios. Cartridges are not blended outside them.</p>
          <div className="family-rail">
            {families.map((family) => {
              const trio = family.trios[0];
              const active = activeFamily?.id === family.id;
              return (
                <article key={family.id} className="notice">
                  <h3>{family.name}{active ? " · this page" : ""}</h3>
                  <p>{trio?.codes.replaceAll(",", " · ")}</p>
                  <p>{family.summary}</p>
                  {trio ? <p><Link href={`/product/${trio.slug}`}>Shop this trio</Link></p> : null}
                </article>
              );
            })}
          </div>
          {activeFamily ? (
            <p>Included cartridges: {activeFamily.trios[0]?.codes.replaceAll(",", ", ")}. {activeFamily.summary}</p>
          ) : null}
          <p>{current.compatibility}</p>
        </div>
      </section>

      <section className="section" id="how">
        <div className="frame narrow">
          <p className="kicker">How it works</p>
          <h2 className="title">From device to lip</h2>
          <ol className="story-list">
            {isBundle ? (
              <li>This set is the Rouge Sur Mesure device plus one supported cartridge trio.</li>
            ) : (
              <li>Get the device. It includes 3 complimentary cartridge sets — 9 cartridges total — and a retractable lip brush.</li>
            )}
            <li>Choose one of the seven cartridge trios.</li>
            <li>Create your shades with the official app on a supported iPhone or Android phone.</li>
            <li>Create the shade in that app.</li>
            <li>Mix the dispensed formula and apply it with the included retractable brush.</li>
          </ol>
          <h3>Putting cartridges in</h3>
          <p>The device instructions say to turn it on, remove the caps, and slide the base until the three cartridges click into their chambers. The app then recognizes them and starts priming. The trio instructions say to slide the bottom open, remove the caps, insert the cartridges, and that the app recognizes them and calibrates.</p>
        </div>
      </section>

      <section className="section" id="create">
        <div className="frame narrow">
          <p className="kicker">Create your shade</p>
          <h2 className="title">Official app methods</h2>
          <p>Create your shades with the official Rouge Sur Mesure app.</p>
          <article>
            <h3>Shade wheel</h3>
            <p>The product pages show a shade wheel for choosing a custom color in the app. The product description also names a shade palette. Both labels are published. How they relate was not explained.</p>
          </article>
          <article>
            <h3>Shade match</h3>
            <p>The app can take a real-life color through the camera and print it with the device.</p>
          </article>
          <article>
            <h3>YSL shade stylist</h3>
            <p>The app can scan an outfit and suggest complementary or clashing lip colors. No method behind that suggestion was published.</p>
          </article>
          <article>
            <h3>Get The Look</h3>
            <p>Get The Look is named as a fourth method on the device, bundle, and refill descriptions. No further steps were published.</p>
          </article>
          {app?.note ? <p>{app.note}</p> : null}
        </div>
      </section>

      <section className="section" id="app">
        <div className="frame narrow">
          <p className="kicker">The Rouge Sur Mesure app</p>
          <h2 className="title">Phone requirements</h2>
          {app ? (
            <>
              <p>{app.ios}</p>
              <p>{app.android}</p>
              <p>{app.bluetooth}</p>
              <p>{app.methods}</p>
              {app.iosUrl ? <p><a href={app.iosUrl}>App Store</a></p> : <p>An App Store link has not been added.</p>}
              {app.androidUrl ? <p><a href={app.androidUrl}>Google Play</a></p> : <p>A Google Play link has not been added.</p>}
            </>
          ) : <p>Information coming soon</p>}
        </div>
      </section>

      <section className="section">
        <div className="frame narrow">
          <p className="kicker">Formula</p>
          <h2 className="title">What the pages call it</h2>
          <p>Official pages describe a creamy velvet liquid lipstick with a velvet matte finish, also called liquid velvet, and list ultra-pigmented among the product keywords.</p>
        </div>
      </section>

      <section className="section">
        <div className="frame narrow">
          <p className="kicker">Application</p>
          <h2 className="title">After the shade is dispensed</h2>
          <ol className="story-list">
            <li>Mix the dispensed formula with the included retractable lip brush.</li>
            <li>Use the brush tip to line the lips.</li>
            <li>Glide the brush across the lips.</li>
          </ol>
        </div>
      </section>

      <section className="section" id="refills">
        <div className="frame narrow">
          <p className="kicker">Refills</p>
          <h2 className="title">Restock an existing setup</h2>
          <p>Individual cartridges are for a trio you already use. They are not a way to build a new combination.</p>
          <p>Sold on their own: {refills.map((cartridge) => `${cartridge.code}${cartridge.name ? ` ${cartridge.name}` : ""}`).join(", ")}.</p>
          <p>The app can warn when formula is low. A spent cartridge is released by pressing the black button near the opening under the device.</p>
          <p><Link href="/refills">Restock now</Link></p>
        </div>
      </section>

      <section className="section">
        <div className="frame">
          <p className="kicker">Which product do you need?</p>
          <h2 className="title">Device, trio, refill, or bundle</h2>
          <div className="compare-grid">
            <article className="notice">
              <h3>Device</h3>
              <p>For someone starting with the creator. Includes 3 complimentary cartridge sets — 9 cartridges total. Additional trios are separate products.</p>
              <p><Link href="/product/rouge-sur-mesure">Shop the device</Link></p>
            </article>
            <article className="notice">
              <h3>Cartridge trio</h3>
              <p>For someone who already has the device and needs one supported set of three.</p>
              <p><Link href="/shop?type=cartridge_trio">Shop trios</Link></p>
            </article>
            <article className="notice">
              <h3>Individual refill</h3>
              <p>For replacing one cartridge inside a trio you already use.</p>
              <p><Link href="/product/cartridge-refill">Shop a refill</Link></p>
            </article>
            <article className="notice">
              <h3>Bundle</h3>
              <p>The device plus one trio of your choice. Price is set on this shop.</p>
              <p><Link href="/product/rouge-sur-mesure-bundle">Shop the bundle</Link></p>
            </article>
          </div>
          <h2 className="title">New to Rouge Sur Mesure?</h2>
          <ol className="story-list">
            <li><Link href="/product/rouge-sur-mesure">Get the device</Link></li>
            <li><Link href="/shop?type=cartridge_trio">Choose a trio</Link></li>
            <li><Link href="#app">Download the app</Link></li>
            <li><Link href="#create">Create a shade</Link></li>
            <li><Link href="#how">Apply</Link></li>
            <li><Link href="#refills">Restock</Link></li>
          </ol>
          <h2 className="title">Already own the device?</h2>
          <p><Link href="/shop?type=cartridge_trio">Shop a cartridge family</Link> or <Link href="/product/cartridge-refill">shop a refill</Link>.</p>
        </div>
      </section>

      <section className="section">
        <div className="frame narrow">
          <p className="kicker">Ingredients</p>
          <h2 className="title">By cartridge code</h2>
          <p>Lists follow the cartridge trio page, one code at a time. The refill page labels some lists by color family instead of code, so those family labels are not shown as if they covered every cartridge.</p>
          {families.flatMap((family) => family.cartridges).filter((cartridge) => cartridge.ingredients).map((cartridge) => (
            <details key={cartridge.id}>
              <summary>{cartridge.code}{cartridge.name ? ` — ${cartridge.name}` : ""}</summary>
              <p>{cartridge.ingredients}</p>
            </details>
          ))}
        </div>
      </section>

      {related.length ? (
        <section className="section">
          <div className="frame narrow">
            <p className="kicker">Supporting products</p>
            <h2 className="title">Often added with this</h2>
            <div className="related-grid">
              {related.map((item) => (
                <article key={item.id}>
                  {item.images[0] ? (
                    <Image src={item.images[0].src} alt={item.images[0].alt || item.name} width={640} height={800} />
                  ) : null}
                  <h3>{item.name}</h3>
                  <p><Money usd={item.price} /></p>
                  <Link className="btn btn-ghost" href={`/product/${item.slug}`}>
                    View product
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section" id="reviews">
        <div className="frame narrow">
          <p className="kicker">Reviews</p>
          <h2 className="title">{reviews.length ? `${rating} from ${reviews.length} published ${reviews.length === 1 ? "review" : "reviews"}` : "Reviews"}</h2>
          {!reviews.length ? <p>No published reviews yet. Reviews are written by customers of this shop and approved before they appear.</p> : null}
          {reviews.map((review) => (
            <article key={review.id}>
              <p>{review.name} · {review.rating}/5 · Verified with a paid order</p>
              {review.title ? <h3>{review.title}</h3> : null}
              <p>{review.comment}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="faq">
        <div className="frame narrow">
          <p className="kicker">FAQ</p>
          <h2 className="title">Questions</h2>
          {faqs.map((faq) => (
            <details key={faq.id}>
              <summary>{faq.question}</summary>
              <p>{isBundle ? bundleFaqAnswer(faq.question, faq.answer) : faq.answer}</p>
            </details>
          ))}
          <p><Link href="/contact">Support</Link></p>
        </div>
      </section>
    </div>
  );
}
