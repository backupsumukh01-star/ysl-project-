import { PrivacyChoices } from "@/components/consent-banner";
import { FooterMenus } from "@/components/footer-menus";
import { siteConfig } from "@/lib/config";
import { getSettings } from "@/lib/settings";

const groups = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/product/rouge-sur-mesure", label: "Device" },
      { href: "/shop#cartridges", label: "Cartridges" },
      { href: "/product/cartridge-refill", label: "Refills" },
    ],
  },
  {
    title: "Discover",
    links: [
      { href: "/manual", label: "How to use" },
      { href: "/app", label: "App" },
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
      { href: "/account", label: "Account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/risk-disclosure", label: "Risk disclosure" },
    ],
  },
];

export async function Footer() {
  const settings = await getSettings();
  const year = new Date().getFullYear();
  const socials = Object.entries(siteConfig.social).filter(([, href]) => href.trim());
  const whatsappDigits = siteConfig.whatsapp.replace(/\D/g, "");
  const chatHref = siteConfig.referenceContacts.chatHref.trim();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <p className="footer-name">{siteConfig.siteName}</p>
            <p>Color, made personal.</p>
          </div>
          <FooterMenus groups={groups} />
        </div>
        <div className="footer-base">
          <div className="footer-note">
            <p>Sold by {settings.sellerName}. {settings.shippingMessage} {settings.returnsMessage}</p>
            <p>Payment is completed at checkout in Razorpay&apos;s secure window. Adding this to your bag does not charge you.</p>
          </div>
          {socials.length ? (
            <p className="footer-social">
              {socials.map(([name, href]) => (
                <a key={name} href={href}>
                  {name}
                </a>
              ))}
            </p>
          ) : null}
          {whatsappDigits || chatHref ? (
            <p className="footer-social">
              {whatsappDigits ? <a href={`https://wa.me/${whatsappDigits}`}>WhatsApp</a> : null}
              {chatHref ? <a href={chatHref}>Live chat</a> : null}
            </p>
          ) : null}
          <p>
            © {year} {siteConfig.siteName}. All rights reserved.
          </p>
          <p>Yves Saint Laurent and related trademarks are the property of their respective owner.</p>
          <p>
            <PrivacyChoices />
          </p>
        </div>
      </div>
    </footer>
  );
}
