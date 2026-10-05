"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api-client";
import { trackContact } from "@/lib/analytics/meta";

type Ticket = { id: string; number: string; subject: string; status: string; createdAt: string };
type SessionUser = { email: string; name: string; phone: string };

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  function loadTickets() {
    api<{ tickets: Ticket[] }>("/api/support")
      .then((result) => setTickets(result.tickets))
      .catch(() => setTickets([]));
  }

  useEffect(() => {
    api<{ user: SessionUser | null }>("/api/auth/session")
      .then((result) => setUser(result.user))
      .catch(() => setUser(null));
    loadTickets();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const data = new FormData(event.currentTarget);
    const subject = String(data.get("subject") || "");
    const body = String(data.get("message") || "");
    setPending(true);
    setMessage("");
    try {
      const result = await api<{ number: string; id: string }>("/api/support", {
        method: "POST",
        body: JSON.stringify({
          name: user.name || user.email,
          email: user.email,
          phone: user.phone || "",
          orderRef: String(data.get("order") || ""),
          subject,
          message: body,
        }),
      });
      trackContact(result.id);
      event.currentTarget.reset();
      setMessage("Sent. We'll reply to your email.");
      loadTickets();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "The message was not sent.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <h1>Support</h1>
      <p className="lede">Write about an order or anything else. We reply by email only.</p>
      {user === undefined ? <p>Loading.</p> : user ? (
        <form className="stack-form" onSubmit={onSubmit}>
          <p>{user.email}</p>
          <label className="field">
            <span>Order number</span>
            <input name="order" placeholder="Optional" />
          </label>
          <label className="field">
            <span>Subject</span>
            <input name="subject" required minLength={3} />
          </label>
          <label className="field">
            <span>Message</span>
            <textarea name="message" rows={5} required minLength={8} />
          </label>
          <button className="btn btn-gold" type="submit" disabled={pending}>
            {pending ? "Sending" : "Send"}
          </button>
        </form>
      ) : (
        <p>Sign in to send a request from this page.</p>
      )}
      {message ? <p className="form-note">{message}</p> : null}
      <h2>Your requests</h2>
      {tickets && !tickets.length ? <p>No requests yet.</p> : null}
      {tickets?.length ? (
        <div className="support-list">
          {tickets.map((ticket) => (
            <article key={ticket.id}>
              <strong>{ticket.subject}</strong>
              <p>{ticket.number}</p>
              <p>{ticket.status}</p>
              <p>{new Date(ticket.createdAt).toLocaleDateString()}</p>
            </article>
          ))}
        </div>
      ) : null}
    </>
  );
}
