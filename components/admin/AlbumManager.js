"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import Spinner from "./Spinner";
import PhotoManager from "./PhotoManager";

const EMPTY = { title: "", countryCode: "", place: "", startDate: "", endDate: "", description: "" };

function AlbumForm({ initial, countries, submitLabel, busyLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial);
  const [state, setState] = useState({ busy: false, error: "", ok: false });
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setState((s) => ({ ...s, ok: false, error: "" }));
  };

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setState({ busy: false, error: "Give the trip a title.", ok: false });
    if (!form.countryCode) return setState({ busy: false, error: "Pick a country.", ok: false });
    setState({ busy: true, error: "", ok: false });
    try {
      await onSubmit(form);
      setState({ busy: false, error: "", ok: true });
    } catch (err) {
      setState({ busy: false, error: err.message, ok: false });
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="row">
        <label>
          Trip title
          <input value={form.title} onChange={set("title")} maxLength={100} placeholder="Hiking around Pokhara" />
        </label>
        <label>
          Country
          <select value={form.countryCode} onChange={set("countryCode")}>
            <option value="">Choose…</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="row">
        <label>
          <span className="field-label">Place <span className="opt">optional</span></span>
          <input value={form.place} onChange={set("place")} maxLength={100} placeholder="Pokhara" />
        </label>
        <div className="row date-pair">
          <label>
            <span className="field-label">From <span className="opt">optional</span></span>
            <input type="date" value={form.startDate} onChange={set("startDate")} />
          </label>
          <label>
            <span className="field-label">To <span className="opt">optional</span></span>
            <input type="date" value={form.endDate} onChange={set("endDate")} />
          </label>
        </div>
      </div>
      <label>
        <span className="field-label">About the trip <span className="opt">optional</span></span>
        <textarea
          className="tall"
          value={form.description}
          onChange={set("description")}
          maxLength={5000}
          placeholder="Where you went, who with, what it was like. Leave a blank line between paragraphs."
        />
      </label>
      <div className="form-foot">
        <button className="btn primary" type="submit" disabled={state.busy} aria-busy={state.busy}>
          {state.busy && <Spinner />}
          {state.busy ? busyLabel : submitLabel}
        </button>
        {onCancel && (
          <button className="btn" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
        {state.ok && <p className="form-status">Saved</p>}
        {state.error && <p className="form-status err">{state.error}</p>}
      </div>
    </form>
  );
}

function AlbumEditor({ album, albums, countries, onChanged, onDeleted, onClose }) {
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const url = `/api/admin/albums/${encodeURIComponent(album.slug)}`;

  async function remove() {
    setDeleting(true);
    try {
      await api(url, { method: "DELETE" });
      onDeleted();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="album-editor">
      <div className="row section-row">
        <button type="button" className="text-btn" onClick={onClose}>
          ← All trips
        </button>
        <a className="text-btn" href={`/travel/${album.slug}`} target="_blank" rel="noreferrer">
          View on site ↗
        </a>
      </div>

      <div className="tile">
        <p className="label">Trip details</p>
        <AlbumForm
          key={album.slug}
          initial={{
            title: album.title,
            countryCode: album.countryCode,
            place: album.place,
            startDate: album.startDate,
            endDate: album.endDate,
            description: album.description,
          }}
          countries={countries}
          submitLabel="Save trip"
          busyLabel="Saving…"
          onSubmit={async (form) => {
            await api(url, { method: "PATCH", body: form });
            onChanged();
          }}
        />
        <div className="form-foot danger-zone">
          {confirm ? (
            <>
              <button className="btn danger" type="button" onClick={remove} disabled={deleting} aria-busy={deleting}>
                {deleting && <Spinner />}
                Delete trip
              </button>
              <button className="text-btn" type="button" onClick={() => setConfirm(false)}>
                Keep
              </button>
              <p className="muted small">Its photos are kept and move back to the Photos tab.</p>
            </>
          ) : (
            <button className="text-btn danger" type="button" onClick={() => setConfirm(true)}>
              Delete this trip
            </button>
          )}
          {error && <p className="form-status err">{error}</p>}
        </div>
      </div>

      <h2 className="section-title">Photos from this trip</h2>
      <p className="muted small">
        Give each photo a title as a short sentence, like &ldquo;Watching the sun rise over Phewa Lake.&rdquo; Description and
        date are optional.
      </p>
      <PhotoManager
        albumId={album.slug}
        albums={albums}
        coverPhotoId={album.coverPhotoId}
        onSetCover={async (photoId) => {
          await api(url, { method: "PATCH", body: { coverPhotoId: photoId } });
          onChanged();
        }}
        onChanged={onChanged}
      />
    </div>
  );
}

export default function AlbumManager() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(
    () =>
      api("/api/admin/albums")
        .then(setData)
        .catch((err) => setError(err.message)),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="form-status err">{error}</p>;
  if (!data)
    return (
      <div className="inline-loading" role="status" aria-label="Loading trips">
        <span className="spinner" />
      </div>
    );

  const album = data.albums.find((a) => a.slug === selected);
  if (album) {
    return (
      <AlbumEditor
        album={album}
        albums={data.albums}
        countries={data.countries}
        onChanged={load}
        onClose={() => setSelected(null)}
        onDeleted={() => {
          setSelected(null);
          load();
        }}
      />
    );
  }

  return (
    <>
      {creating ? (
        <div className="tile">
          <p className="label">New trip</p>
          <AlbumForm
            initial={EMPTY}
            countries={data.countries}
            submitLabel="Create trip"
            busyLabel="Creating…"
            onCancel={() => setCreating(false)}
            onSubmit={async (form) => {
              const { slug } = await api("/api/admin/albums", { method: "POST", body: form });
              await load();
              setCreating(false);
              setSelected(slug);
            }}
          />
        </div>
      ) : (
        <button type="button" className="btn primary" onClick={() => setCreating(true)}>
          + New trip
        </button>
      )}

      {data.albums.length === 0 ? (
        <p className="empty muted">No trips yet. Create one, then add its photos.</p>
      ) : (
        <ul className="admin-albums">
          {data.albums.map((a) => (
            <li key={a.slug}>
              <button type="button" className="tile admin-album" onClick={() => setSelected(a.slug)}>
                <span className="admin-album-cover">
                  {a.cover ? <img src={a.cover.src} alt="" loading="lazy" /> : null}
                </span>
                <span className="admin-album-text">
                  <strong>{a.title}</strong>
                  <span className="muted small">
                    {[a.place, a.country].filter(Boolean).join(", ")}
                    {a.dates && ` · ${a.dates}`}
                  </span>
                  <span className="small">
                    {a.photoCount} {a.photoCount === 1 ? "photo" : "photos"} · Edit →
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
