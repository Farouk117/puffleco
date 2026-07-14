"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong sending your message.");
        return;
      }
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Something went wrong sending your message.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-[2rem] border-2 border-brand-royal-gold/30 bg-white/90 p-8 text-center">
        <span className="sticker bg-brand-royal-gold text-white">Message sent</span>
        <h2 className="font-display mt-5 text-2xl font-black">Thanks for reaching out!</h2>
        <p className="mt-3 text-stone-600">We&apos;ll get back to you as soon as we can.</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="btn-ghost mt-6"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-[2rem] border-2 border-brand-line/40 bg-white/90 p-6 sm:p-8">
      <label className="text-sm font-bold text-stone-600">
        Your name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-2xl border-2 border-brand-line/40 bg-white p-3 font-medium text-brand-ink outline-none focus:border-brand-coral"
          placeholder="Ada Obi"
        />
      </label>
      <label className="text-sm font-bold text-stone-600">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-2xl border-2 border-brand-line/40 bg-white p-3 font-medium text-brand-ink outline-none focus:border-brand-coral"
          placeholder="you@example.com"
        />
      </label>
      <label className="text-sm font-bold text-stone-600">
        Message
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-2xl border-2 border-brand-line/40 bg-white p-3 font-medium text-brand-ink outline-none focus:border-brand-coral"
          placeholder="How can we help?"
        />
      </label>
      {error ? <p className="text-sm font-bold text-brand-coral-dark">{error}</p> : null}
      <button type="submit" disabled={submitting} className="btn-brand justify-center disabled:opacity-60">
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
