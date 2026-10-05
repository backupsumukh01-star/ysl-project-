import type { Metadata } from "next";
import { PageBack } from "@/components/page-back";
import { FaqList } from "@/components/faq-list";
import "../quiet.css";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Questions about Rouge Sur Mesure. Unconfirmed details are marked as such.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <main id="main" className="page quiet-page faq-page">
      <PageBack href="/shop">All products</PageBack>
      <p className="kicker">FAQ</p>
      <h1>Before you decide.</h1>
      <p className="lede">Answers follow the published product facts.</p>
      <FaqList />
    </main>
  );
}
