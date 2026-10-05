"use client";

import { Media } from "@/components/media";
import { product, shadeNotes } from "@/lib/product";

const facts = [
  {
    title: "Description",
    body: "Rouge Sur Mesure is a custom lip color creator. The device, a supported cartridge trio, and the official companion app are used together. This purchase includes 3 complimentary cartridge sets — 9 cartridges total — and a retractable lip brush.",
  },
  {
    title: "Keywords",
    body: "Custom lip color creator. PERSO. Liquid velvet. Removable cartridges. Shade palette, shade match, YSL shade stylist, and Get The Look.",
  },
  {
    title: "Type",
    body: "A device that dispenses a custom liquid lipstick. Color is made only inside one of the seven supported cartridge trios.",
  },
  {
    title: "What it is",
    body: "A personalized lip color creator. The device, a supported trio, and the official app are separate parts of the same experience.",
  },
  {
    title: "What it does",
    body: "It dispenses a custom shade from the cartridges you insert. The official pages describe a creamy velvet liquid lipstick with a liquid velvet finish, and list ultra-pigmented among the keywords.",
  },
  {
    title: "Benefits",
    body: "You choose a shade in the official app, then carry that color with the device. Cartridges are removable and interchangeable inside a supported trio.",
  },
  {
    title: "App compatibility",
    body: "iOS 13 or later on iPhone 6S or newer. Android 8.0 or later. Bluetooth 4.2. Store links are not configured on this shop yet.",
  },
  {
    title: "How to apply",
    body: "Turn the device on, remove the caps, and slide the base until the three cartridges click into their chambers. The app recognizes them and starts priming. After the formula is dispensed, mix it with the included retractable lip brush, line with the tip, then glide across the lips.",
  },
  {
    title: "Ingredients",
    body: "Ingredient lists are published by cartridge code. Open the list for the code you are using. This shop does not add ingredients that were not published for that code.",
  },
];

export function ProductFacts() {
  const familyNames = shadeNotes.map((family) => family.name);
  const familyList = `${familyNames.slice(0, -1).join(", ")}, and ${familyNames.at(-1)}`;

  return (
    <section className="section" id="details">
      <div className="frame narrow">
        <div className="device-facts">
          <p className="kicker">Product information</p>
          <h2 className="title">Details</h2>
          {facts.map((fact) => (
            <details key={fact.title}>
              <summary>{fact.title}</summary>
              <p>{fact.body}</p>
            </details>
          ))}
        </div>
        <div className="device-intro">
          <div>
            <p className="kicker">Product information</p>
            <h2>Rouge Sur Mesure</h2>
            <p>{product.description}</p>
          </div>
          <Media
            src={product.images.finished.src}
            alt={product.images.finished.alt}
            position={product.images.finished.position}
            ratio="ratio-square"
            fit="contain"
            shot={{ width: 1024, height: 1024 }}
            sizes="(max-width: 767px) 100vw, 720px"
          />
          <div>
            <p className="kicker">What it does</p>
            <h2>A custom shade from the cartridges you insert</h2>
            <p>A device that dispenses a custom liquid lipstick. Color is made only inside one of the seven supported cartridge trios.</p>
          </div>
          <div>
            <p className="kicker">Cartridge system</p>
            <h2>Device, trio, and app</h2>
            <p>The device, a supported trio, and the official app are separate parts of the same experience. This purchase includes 3 complimentary cartridge sets — 9 cartridges total.</p>
            <ol className="device-formula">
              <li>Device</li>
              <li>Supported cartridge trio</li>
              <li>Official companion app</li>
            </ol>
            <p className="device-result">Custom lip color creation</p>
            <p>Turn the device on, remove the caps, and slide the base until the three cartridges click into their chambers. The app recognizes them.</p>
          </div>
          <div>
            <p className="kicker">Cartridge families</p>
            <h2>One trio at a time</h2>
            <p>The supported families are {familyList}.</p>
            <p><a href="#colors">See the seven supported trios</a></p>
          </div>
        </div>
      </div>
    </section>
  );
}
