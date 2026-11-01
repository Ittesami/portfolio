"use client";

import { useState } from "react";

export default function ContactForm() {
  const [state, setState] = useState({ status: "idle", message: "" });

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setState({ status: "sending", message: "" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please email me instead.");
      form.reset();
      setState({ status: "sent", message: "Thanks, your message is in. I'll reply by email." });
    } catch (err) {
      setState({ status: "error", message: err.message });
    }
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false}>
      <p className="form-intro">Or leave a message here.</p>
      <div className="row">
        <label>
          Name
          <input name="name" required maxLength={100} autoComplete="name" />
        </label>
        <label>
          Email
          <input name="email" type="email" required maxLength={200} autoComplete="email" />
        </label>
      </div>
      <label>
        Message
        <textarea name="message" required minLength={10} maxLength={5000} />
      </label>
      <label className="hp" aria-hidden="true">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="form-foot">
        <button className="btn" type="submit" disabled={state.status === "sending"} aria-busy={state.status === "sending"}>
          {state.status === "sending" && <span className="spinner" aria-hidden="true" />}
          {state.status === "sending" ? "Sending…" : "Send message"}
        </button>
        {state.message && (
          <p className={`form-status${state.status === "error" ? " err" : ""}`} role="status">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
