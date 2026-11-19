"use client";

import { useEffect, useState } from "react";
import { todayStr } from "../api";
import Spinner from "../Spinner";

// Download (or copy, or share) your fitness log as one file to give an AI for a new plan.
// The note you type is remembered in this browser only. Standing rules (like which days
// you can train) belong in your profile notes, which the export always includes.
const NOTE_KEY = "fitness-export-note-v2";
const DEFAULT_NOTE = "";

export default function ExportPanel() {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(14);
  const [format, setFormat] = useState("md");
  const [note, setNote] = useState(DEFAULT_NOTE);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState({ text: "", error: false });
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTE_KEY);
      if (saved !== null) setNote(saved);
    } catch {}
    try {
      setCanShare(Boolean(navigator.canShare?.({ files: [new File(["x"], "x.md", { type: "text/markdown" })] })));
    } catch {}
  }, []);

  function saveNote(value) {
    setNote(value);
    try {
      localStorage.setItem(NOTE_KEY, value);
    } catch {}
  }

  // Fetches the export and returns { text, name, type }.
  async function fetchExport() {
    const q = new URLSearchParams({ to: todayStr(), days: String(days), format, notes: note });
    const res = await fetch(`/api/admin/fitness/export?${q}`, { cache: "no-store" });
    if (res.status === 401) {
      window.location.href = "/admin/login";
      throw new Error("Please log in again.");
    }
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Couldn't build the export. Try again.");
    const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? `fitness.${format}`;
    return { text: await res.text(), name, type: format === "json" ? "application/json" : "text/markdown" };
  }

  async function run(kind, fn, okText) {
    setBusy(kind);
    setMsg({ text: "", error: false });
    try {
      await fn();
      if (okText) setMsg({ text: okText, error: false });
    } catch (err) {
      if (err?.name !== "AbortError") setMsg({ text: err.message, error: true });
    } finally {
      setBusy("");
    }
  }

  const download = () =>
    run("download", async () => {
      const { text, name, type } = await fetchExport();
      const url = URL.createObjectURL(new Blob([text], { type }));
      const a = Object.assign(document.createElement("a"), { href: url, download: name });
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "Downloaded");

  const copy = () =>
    run("copy", async () => {
      const { text } = await fetchExport();
      await navigator.clipboard.writeText(text);
    }, "Copied. Paste it into your AI chat.");

  const share = () =>
    run("share", async () => {
      const { text, name, type } = await fetchExport();
      await navigator.share({ files: [new File([text], name, { type })], title: "My fitness log" });
    });

  if (!open) {
    return (
      <button type="button" className="btn small export-open" onClick={() => setOpen(true)}>
        Export for AI
      </button>
    );
  }

  return (
    <div className="tile export-panel">
      <div className="row">
        <p className="label">Export for AI</p>
        <button type="button" className="text-btn" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
      <p className="muted small">
        One file with your workouts, food (with calorie estimates), sleep, body weight and the plan you followed. The text
        version starts with a request for next week&apos;s plan, so you can send it to any AI chat as it is.
      </p>
      <div className="export-options">
        <div className="field-block">
          <span className="field-label">Period</span>
          <div className="seg" role="group" aria-label="Period">
            {[7, 14, 28].map((n) => (
              <button key={n} type="button" className={`seg-btn${days === n ? " on" : ""}`} aria-pressed={days === n} onClick={() => setDays(n)}>
                {n} days
              </button>
            ))}
          </div>
        </div>
        <div className="field-block">
          <span className="field-label">Format</span>
          <div className="seg" role="group" aria-label="Format">
            {[
              ["md", "Text (.md)"],
              ["json", "Data (.json)"],
            ].map(([key, label]) => (
              <button key={key} type="button" className={`seg-btn${format === key ? " on" : ""}`} aria-pressed={format === key} onClick={() => setFormat(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {format === "md" && (
        <label className="form">
          <span className="field-label">
            Anything else the AI should know <span className="opt">optional</span>
          </span>
          <textarea value={note} onChange={(e) => saveNote(e.target.value)} maxLength={500} rows={2} />
        </label>
      )}
      <div className="form-foot">
        <button type="button" className="btn primary" disabled={Boolean(busy)} aria-busy={busy === "download"} onClick={download}>
          {busy === "download" && <Spinner />} Download
        </button>
        <button type="button" className="btn" disabled={Boolean(busy)} aria-busy={busy === "copy"} onClick={copy}>
          {busy === "copy" && <Spinner />} Copy
        </button>
        {canShare && (
          <button type="button" className="btn" disabled={Boolean(busy)} aria-busy={busy === "share"} onClick={share}>
            {busy === "share" && <Spinner />} Share
          </button>
        )}
        {msg.text && <p role="status" className={`form-status${msg.error ? " err" : ""}`}>{msg.text}</p>}
      </div>
    </div>
  );
}
