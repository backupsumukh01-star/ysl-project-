"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

type Ticket = { id: string; number: string; subject: string; status: string; createdAt: string };

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<{ tickets: Ticket[] }>("/api/support")
      .then((result) => setTickets(result.tickets))
      .catch(() => {
        setTickets([]);
        setMessage("Sign in to see your support requests.");
      });
  }, []);

  return (
    <>
      <h1>Support</h1>
      {message ? <p>{message}</p> : null}
      {tickets && !tickets.length && !message ? <p>No requests yet.</p> : null}
      {tickets?.map((ticket) => (
        <article className="notice" key={ticket.id}>
          <p>{ticket.number}</p>
          <p>{ticket.subject}</p>
          <p>{ticket.status}</p>
        </article>
      ))}
    </>
  );
}
