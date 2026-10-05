import type { Metadata } from "next";
import { UserManual } from "@/components/user-manual";
import "./manual.css";

export const metadata: Metadata = {
  title: "User manual",
  description: "User manual for Rouge Sur Mesure: setup, cartridges, the companion app, cleaning, and care.",
  alternates: { canonical: "/manual" },
};

export default function ManualPage() {
  return (
    <main id="main" className="page quiet-page manual-page">
      <UserManual />
    </main>
  );
}
