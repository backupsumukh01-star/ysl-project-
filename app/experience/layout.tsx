import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How it works",
  alternates: { canonical: "/experience" },
};

export default function ExperienceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
