"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import Spinner from "./Spinner";

// Tells the admin nav to refresh its unread badge.
export const MESSAGES_CHANGED = "admin-messages-changed";
const announce = () => window.dispatchEvent(new Event(MESSAGES_CHANGED));

function when(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageRow({ msg, onChanged, onDeleted }) {
  const [busy, setBusy] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const url = `/api/admin/messages/${msg.id}`;

  async function run(kind, fn) {
    setBusy(kind);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  const setRead = (read) =>
    api(url, { method: "PATCH", body: { read } }).then(({ message }) => {
      onChanged(message);
      announce();
    });

  const reply = `mailto:${msg.email}?subject=${encodeURIComponent("Re: your message on my website")}`;

  return (
    <li className={`tile message${msg.read ? "" : " unread"}`}>
      <div className="message-head">
        <div>
          <p className="message-from">
            {msg.name}
            {!msg.read && <span className="badge accent">New</span>}
          </p>
          <a className="muted small" href={`mailto:${msg.email}`}>
            {msg.email}
          </a>
        </div>
        <p className="muted small">{when(msg.createdAt)}</p>
      </div>
      <p className="message-body">{msg.message}</p>
      <div className="form-foot">
        <a className="btn small primary" href={reply} onClick={() => !msg.read && run("read", () => setRead(true))}>
          Reply by email
        </a>
        <button
          type="button"
          className="btn small"
          disabled={Boolean(busy)}
          aria-busy={busy === "read"}
          onClick={() => run("read", () => setRead(!msg.read))}
        >
          {busy === "read" && <Spinner />}
          {msg.read ? "Mark as unread" : "Mark as read"}
        </button>
        {confirm ? (
          <>
            <button
              type="button"
              className="btn small danger"
              disabled={Boolean(busy)}
              aria-busy={busy === "delete"}
              onClick={() =>
                run("delete", async () => {
                  await api(url, { method: "DELETE" });
                  onDeleted(msg.id);
                  announce();
                })
              }
            >
              {busy === "delete" && <Spinner />}
              Delete for good
            </button>
            <button type="button" className="text-btn" onClick={() => setConfirm(false)}>
              Keep
            </button>
          </>
        ) : (
          <button type="button" className="text-btn" onClick={() => setConfirm(true)}>
            Delete
          </button>
        )}
        {error && <p className="form-status err">{error}</p>}
      </div>
    </li>
  );
}

export default function MessageList() {
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api("/api/admin/messages")
      .then((d) => setMessages(d.messages))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="form-status err">{error}</p>;
  if (!messages)
    return (
      <div className="inline-loading" role="status" aria-label="Loading messages">
        <span className="spinner" />
      </div>
    );

  const unread = messages.filter((m) => !m.read).length;
  const shown = filter === "unread" ? messages.filter((m) => !m.read) : messages;

  return (
    <>
      <div className="message-bar">
        <p className="muted">
          {messages.length} {messages.length === 1 ? "message" : "messages"} · {unread} unread
        </p>
        <div className="seg" role="group" aria-label="Show">
          {[
            ["all", "All"],
            ["unread", "Unread"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`seg-btn${filter === key ? " on" : ""}`}
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? (
        <p className="empty muted">{filter === "unread" ? "No unread messages." : "No messages yet."}</p>
      ) : (
        <ul className="admin-list">
          {shown.map((m) => (
            <MessageRow
              key={m.id}
              msg={m}
              onChanged={(next) => setMessages((list) => list.map((x) => (x.id === next.id ? next : x)))}
              onDeleted={(id) => setMessages((list) => list.filter((x) => x.id !== id))}
            />
          ))}
        </ul>
      )}
    </>
  );
}
