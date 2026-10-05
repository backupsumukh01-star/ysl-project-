"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { VerifyScreen } from "@/components/account-ui";

function Verify() {
  const email = useSearchParams().get("email") || "";
  return <VerifyScreen email={email} />;
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading</p>}>
      <Verify />
    </Suspense>
  );
}
