"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api-client";
import { trackContact } from "@/lib/analytics/meta";
import { PageBack } from "@/components/page-back";
import "../quiet.css";

export default function ContactPage() {
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [whatsapp, setWhatsapp] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    api<{ whatsapp: string }>("/api/storefront").then((result) => setWhatsapp(result.whatsapp || "")).catch(() => setWhatsapp(""));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Record<string, string> = {};
    const email = String(data.get("email") || "");
    const message = String(data.get("message") || "");
    const name = String(data.get("name") || "");
    const subject = String(data.get("subject") || "");
    if (!name.trim()) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email.";
    if (subject.trim().length < 3) next.subject = "Enter a subject.";
    if (message.trim().length < 8) next.message = "Write a short message.";
    setErrors(next);
    if (Object.keys(next).length) {
      setNote("");
      setNoteError(false);
      return;
    }
    const form = event.currentTarget;
    setPending(true);
    try {
      const result = await api<{ number: string; id: string }>("/api/support", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          phone: String(data.get("phone") || ""),
          orderRef: String(data.get("order") || ""),
          subject,
          message,
        }),
      });
      trackContact(result.id);
      setNote("Sent. We'll reply to the email you entered.");
      setNoteError(false);
      form.reset();
    } catch (error) {
      setNote(error instanceof ApiError ? error.message : "Message not sent. Try the form again.");
      setNoteError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <main id="main" className="page quiet-page contact-page">
      <PageBack href="/shop">All products</PageBack>
      <p className="kicker">Contact</p>
      <h1>Write to us.</h1>
      {whatsapp ? <p><a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}>WhatsApp support</a></p> : null}
      <form onSubmit={onSubmit} noValidate style={{ maxWidth: 560, marginTop: 24 }}>
        <label className="field">
          <span>Name</span>
          <input name="name" autoComplete="name" aria-invalid={Boolean(errors.name)} />
          {errors.name ? <small className="error">{errors.name}</small> : null}
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} />
          {errors.email ? <small className="error">{errors.email}</small> : null}
        </label>
        <label className="field">
          <span>Phone</span>
          <input name="phone" autoComplete="tel" />
        </label>
        <label className="field">
          <span>Order number</span>
          <input name="order" />
        </label>
        <label className="field">
          <span>Subject</span>
          <input name="subject" aria-invalid={Boolean(errors.subject)} />
          {errors.subject ? <small className="error">{errors.subject}</small> : null}
        </label>
        <label className="field">
          <span>Message</span>
          <textarea name="message" rows={5} aria-invalid={Boolean(errors.message)} />
          {errors.message ? <small className="error">{errors.message}</small> : null}
        </label>
        <button className="btn btn-gold" type="submit" disabled={pending}>
          {pending ? "Sending" : "Send"}
        </button>
        {note ? <p className="form-note">{note}</p> : null}
      </form>
    </main>
  );
}
