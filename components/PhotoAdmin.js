"use client";

import { useEffect, useState } from "react";

const TOKEN_KEY = "photo-admin-token";

function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

function PhotoRow({ photo, token }) {
  const [form, setForm] = useState({ title: photo.title, date: photo.date, description: photo.description });
  const [state, setState] = useState({ status: "idle", message: "" });

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (state.status !== "saving") setState({ status: "idle", message: "" });
  };

  async function save(e) {
    e.preventDefault();
    setState({ status: "saving", message: "" });
    try {
      const res = await fetch("/api/photos", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ file: photo.file, ...form }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(res.status === 401 ? "Wrong admin token." : data.error || "Couldn't save.");
      setState({ status: "saved", message: "Saved" });
    } catch (err) {
      setState({ status: "error", message: err.message });
    }
  }

  return (
    <li className="tile admin-row">
      <a className="admin-thumb" href={photo.src} target="_blank" rel="noreferrer">
        {/* Plain img: thumbnails here don't need the optimiser. */}
        <img src={photo.src} alt="" loading="lazy" />
      </a>
      <form className="form" onSubmit={save}>
        <p className="label file-name">{photo.file}</p>
        <div className="row">
          <label>
            Title
            <input value={form.title} onChange={update("title")} maxLength={120} placeholder="Sunrise over Pokhara" />
          </label>
          <label>
            Date
            <input type="date" value={form.date} onChange={update("date")} />
          </label>
        </div>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={update("description")}
            maxLength={1000}
            placeholder="Optional: where it was, what was happening"
          />
        </label>
        <div className="form-foot">
          <button className="btn" type="submit" disabled={state.status === "saving"} aria-busy={state.status === "saving"}>
            {state.status === "saving" && <span className="spinner" aria-hidden="true" />}
            {state.status === "saving" ? "Saving…" : "Save"}
          </button>
          {state.message && (
            <p className={`form-status${state.status === "error" ? " err" : ""}`} role="status">
              {state.message}
            </p>
          )}
        </div>
      </form>
    </li>
  );
}

export default function PhotoAdmin() {
  const [token, setToken] = useState("");
  const [photos, setPhotos] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setToken(readToken());
    fetch("/api/photos", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos ?? []))
      .catch(() => setError("Couldn't load photos."));
  }, []);

  function onToken(e) {
    setToken(e.target.value);
    try {
      sessionStorage.setItem(TOKEN_KEY, e.target.value);
    } catch {}
  }

  return (
    <>
      <div className="tile admin-token">
        <label className="form">
          <span>Admin token</span>
          <input type="password" value={token} onChange={onToken} autoComplete="off" placeholder="ADMIN_TOKEN from .env.local" />
        </label>
        <p className="muted">Kept in this browser tab only.</p>
      </div>

      {error && <p className="form-status err">{error}</p>}
      {photos === null && !error && (
        <div className="page-loading" role="status" aria-label="Loading photos">
          <span className="spinner big-spinner" />
        </div>
      )}
      {photos?.length === 0 && (
        <div className="tile empty-state">
          <p className="big">No photos yet.</p>
          <p className="muted">
            Put images in <code>public/photos</code>, then reload this page.
          </p>
        </div>
      )}
      {photos?.length > 0 && (
        <ul className="admin-list">
          {photos.map((ph) => (
            <PhotoRow key={ph.file} photo={ph} token={token} />
          ))}
        </ul>
      )}
    </>
  );
}
