import type { Metadata } from "next";
import { AccountNav } from "@/components/account-nav";
import "../quiet.css";
import "./account.css";

export const metadata: Metadata = {
  title: "Account",
  alternates: { canonical: "/account" },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="page quiet-page account-shell">
      <AccountNav />
      {children}
    </main>
  );
}
