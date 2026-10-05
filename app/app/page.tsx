import type { Metadata } from "next";
import Link from "next/link";
import { PageBack } from "@/components/page-back";
import { StoreBadges } from "@/components/store-badges";
import "../quiet.css";
import "./app.css";

export const metadata: Metadata = {
  title: "App",
  description: "Download the Rouge Sur Mesure app, pair the device, and create a shade. The full device manual is on How to use.",
  alternates: { canonical: "/app" },
};

export default function AppGuidePage() {
  return (
    <main id="main" className="page quiet-page app-page">
      <PageBack href="/shop">All products</PageBack>
      <p className="kicker">Learn</p>
      <h1>The companion app</h1>
      <p className="lede">
        Shade creation uses the Rouge Sur Mesure app. This website does not run the app. Download it, pair the device, then follow the steps on this page.
      </p>

      <div className="app-guide">
        <section aria-labelledby="app-install">
          <h2 id="app-install">Download and install</h2>
          <p>The user manual lists these minimum phones.</p>
          <div className="app-reqs">
            <div>
              <strong>iPhone</strong>
              <p>Minimum iPhone 6, or a later generation, with iOS 13 or above.</p>
            </div>
            <div>
              <strong>Android</strong>
              <p>Android 8.0 with Bluetooth 4.2 or higher.</p>
            </div>
          </div>
          <p>Download the Rouge Sur Mesure application, available on the App Store or on Google Play.</p>
          <StoreBadges />
          <p>Upon downloading the app, you can create your account or log into an existing YSL Beauty customer account.</p>
        </section>

        <section aria-labelledby="app-use">
          <h2 id="app-use">How to use the app</h2>
          <ol className="app-steps">
            <li>
              <div>
                <h3>Pair</h3>
                <p>Follow the onscreen instructions to pair your device during the onboarding flow.</p>
                <p>To pair another device after the first onboarding, go to the Device Manager. Then select Advanced Settings, Add a New Device, and follow the onscreen instructions.</p>
              </div>
            </li>
            <li>
              <div>
                <h3>Load</h3>
                <p>After pairing, load the three cartridges and close the hatch. Once closed, the application will automatically recognize the cartridges loaded into the device.</p>
                <p>If you load an invalid cartridge combination, the app will recognize a mismatch and ask you to correct it.</p>
              </div>
            </li>
            <li>
              <div>
                <h3>Calibrate</h3>
                <p>Every time a new cartridge or colour universe is loaded, it needs a calibration flow so the formula dispenses accurately. The app shows a pop-up when calibration is required.</p>
                <p>The application tracks the date of the first insertion of each cartridge. The expiration date is 2 years after the opening of the cartridge.</p>
              </div>
            </li>
            <li>
              <div>
                <h3>Create</h3>
                <p>The discovery page shows suggested shades. Color Creator then offers three ways to choose one:</p>
                <ul>
                  <li>Shade Wheel explores the shades the installed cartridge set can make. For virtual try-on, use good lighting, raise the screen brightness, and try on bare lips.</li>
                  <li>Shade Match takes a photo of a real object, then a colour picker selects the colour to match.</li>
                  <li>Shade Stylist combines a skintone and undertone measurement with a photo of you.</li>
                </ul>
                <p>The virtual try-on lets you see the shade before it is made. When you commit, the shade recipe is sent to the device. Open the compact before dispensing so formula does not transfer onto the mirror.</p>
              </div>
            </li>
            <li>
              <div>
                <h3>Dispense</h3>
                <p>In Dispense Settings, a slider sets the default volume. Hold the Create button to choose Trial, 1 application, 2 applications, or 3 applications.</p>
                <p>After dispensing, mix the formula thoroughly with the applicator brush. Use a clean dispensing cup, with no previous formula left in it.</p>
              </div>
            </li>
            <li>
              <div>
                <h3>Save</h3>
                <p>The Shade Closet saves, names, and organises favourite shades. Cartridge Manager shows the fill level and expiration date of each cartridge. Device Manager shows the battery percentage.</p>
                <p>Before travelling, open Device Manager and enable Travel Mode so the device cannot dispense by accident.</p>
              </div>
            </li>
          </ol>
        </section>
      </div>

      <div className="app-end">
        <p>Setup, cartridge loading, cleaning, and the rest of the device instructions are in the user manual.</p>
        <Link className="btn btn-gold" href="/manual">How to use</Link>
      </div>
    </main>
  );
}
