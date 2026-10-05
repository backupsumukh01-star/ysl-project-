"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, api } from "@/lib/api-client";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") || "");
    setPending(true);
    setMessage("");
    try {
      await api("/api/auth/password-reset/confirm", { method: "POST", body: JSON.stringify({ token, password }) });
      router.push("/account");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "The password was not saved.");
      setPending(false);
    }
  }

  return (
    <>
      <p className="kicker">Account</p>
      <h1>Choose a new password</h1>
      {token ? (
        <form onSubmit={onSubmit} className="stack-form">
          <label className="field">
            <span>New password</span>
            <input name="password" type="password" autoComplete="new-password" minLength={8} required />
          </label>
          <button className="btn btn-gold" type="submit" disabled={pending}>
            {pending ? "Saving" : "Save password"}
          </button>
          {message ? <p className="notice">{message}</p> : null}
        </form>
      ) : (
        <p className="lede">Open the reset link from your email. It expires after one hour.</p>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading</p>}>
      <ResetForm />
    </Suspense>
  );
}
