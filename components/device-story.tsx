import Link from "next/link";
import { StoreBadges } from "@/components/store-badges";

export function DeviceStory() {
  return (
    <div className="device-story">
      <section className="section pdp-steps" id="how" aria-labelledby="how-title">
        <h2 id="how-title">How it works</h2>
        <ol>
          <li>
            <span>01</span>
            <h3>Get your device</h3>
            <p>The latest lip technology powered by PERSO to dress your lips your way.</p>
            <p>Includes 3 complimentary cartridge sets — 9 cartridges total.</p>
          </li>
          <li>
            <span>02</span>
            <h3>Select your cartridge trio</h3>
            <p>Select a cartridge trio to dress your lips with a creamy velvet formula across red, nude, pink, or orange families.</p>
          </li>
          <li id="app">
            <span>03</span>
            <h3>Download the app</h3>
            <p>Design and share your custom shades with our exclusive app features on iOS and Android.</p>
            <StoreBadges />
            <Link className="btn btn-gold story-check" href="/experience">Check how it works</Link>
          </li>
        </ol>
      </section>
    </div>
  );
}
