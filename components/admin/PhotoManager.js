"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import Spinner from "./Spinner";

const MAX_EDGE = 2400; // px on the long side
const TARGET_BYTES = 3.5 * 1024 * 1024;

// Shrinks a photo in the browser so uploads stay under the server's 4 MB limit.
async function shrink(file) {
  if (file.type === "image/gif") return file;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`Couldn't read ${file.name}. Try exporting it as a JPG first.`);
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= TARGET_BYTES && file.type === "image/jpeg") return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  for (const quality of [0.88, 0.8, 0.7, 0.6]) {
    const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (blob && blob.size <= TARGET_BYTES) {
      return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
    }
  }
  throw new Error(`${file.name} is too large even after shrinking.`);
}

function Uploader({ onUploaded }) {
  const input = useRef(null);
  const [state, setState] = useState({ busy: false, done: 0, total: 0, errors: [] });

  async function upload(files) {
    const list = [...files];
    if (!list.length) return;
    setState({ busy: true, done: 0, total: list.length, errors: [] });
    const errors = [];
    for (const [i, file] of list.entries()) {
      try {
        const form = new FormData();
        form.append("file", await shrink(file));
        await api("/api/admin/photos", { method: "POST", form });
      } catch (err) {
        errors.push(err.message);
      }
      setState((s) => ({ ...s, done: i + 1 }));
    }
    setState({ busy: false, done: list.length, total: list.length, errors });
    if (input.current) input.current.value = "";
    onUploaded();
  }

  return (
    <div className="tile uploader">
      <p className="label">Add photos</p>
      <p className="muted">Pick one or more. They're resized for the web and appear on the site straight away.</p>
      <div className="form-foot">
        <button
          className="btn primary"
          type="button"
          onClick={() => input.current?.click()}
          disabled={state.busy}
          aria-busy={state.busy}
        >
          {state.busy && <Spinner />}
          {state.busy ? `Uploading ${Math.min(state.done + 1, state.total)} of ${state.total}…` : "Choose photos"}
        </button>
        {!state.busy && state.total > 0 && state.errors.length === 0 && (
          <p className="form-status">
            Uploaded {state.total} photo{state.total > 1 ? "s" : ""}
          </p>
        )}
      </div>
      {state.errors.map((e) => (
        <p key={e} className="form-status err">
          {e}
        </p>
      ))}
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => upload(e.target.files)}
      />
    </div>
  );
}

function PhotoRow({ photo, isProfile, onChanged }) {
  const [form, setForm] = useState({ title: photo.title, date: photo.date, description: photo.description });
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState({ text: "", error: false });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setMsg({ text: "", error: false });
  };

  async function run(kind, fn, okText) {
    setBusy(kind);
    setMsg({ text: "", error: false });
    try {
      await fn();
      if (okText) setMsg({ text: okText, error: false });
      if (kind !== "save") onChanged();
    } catch (err) {
      setMsg({ text: err.message, error: true });
    } finally {
      setBusy("");
    }
  }

  const url = `/api/admin/photos/${encodeURIComponent(photo.id)}`;
  const patch = (body) => api(url, { method: "PATCH", body });

  return (
    <li className={`tile admin-row${photo.hidden ? " is-hidden" : ""}`}>
      <a className="admin-thumb" href={photo.src} target="_blank" rel="noreferrer">
        {/* Plain img: small thumbnails don't need the optimiser. */}
        <img src={photo.src} alt="" loading="lazy" />
      </a>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          run("save", () => patch(form), "Saved");
        }}
      >
        <div className="badges">
          <span className="badge">{photo.kind === "upload" ? "Uploaded" : "In code folder"}</span>
          {photo.hidden && <span className="badge warn">Hidden</span>}
          {isProfile && <span className="badge accent">Profile picture</span>}
          {photo.kind === "folder" && <span className="label file-name">{photo.file}</span>}
        </div>
        <div className="row">
          <label>
            Title <span className="opt">optional</span>
            <input value={form.title} onChange={set("title")} maxLength={120} placeholder="Sunrise over Pokhara" />
          </label>
          <label>
            Date <span className="opt">optional</span>
            <input type="date" value={form.date} onChange={set("date")} />
          </label>
        </div>
        <label>
          Description <span className="opt">optional</span>
          <textarea
            value={form.description}
            onChange={set("description")}
            maxLength={1000}
            placeholder="Where it was, what was happening"
          />
        </label>
        <div className="form-foot">
          <button className="btn primary" type="submit" disabled={Boolean(busy)} aria-busy={busy === "save"}>
            {busy === "save" && <Spinner />}
            {busy === "save" ? "Saving…" : "Save"}
          </button>
          <button
            className="btn"
            type="button"
            disabled={Boolean(busy)}
            aria-busy={busy === "hide"}
            onClick={() => run("hide", () => patch({ hidden: !photo.hidden }))}
          >
            {busy === "hide" && <Spinner />}
            {photo.hidden ? "Show on site" : "Hide from site"}
          </button>
          {!isProfile && (
            <button
              className="btn"
              type="button"
              disabled={Boolean(busy)}
              aria-busy={busy === "avatar"}
              onClick={() => run("avatar", () => patch({ avatar: true }))}
            >
              {busy === "avatar" && <Spinner />}
              Use as profile picture
            </button>
          )}
          {photo.kind === "upload" &&
            (confirmDelete ? (
              <>
                <button
                  className="btn danger"
                  type="button"
                  disabled={Boolean(busy)}
                  aria-busy={busy === "delete"}
                  onClick={() => run("delete", () => api(url, { method: "DELETE" }))}
                >
                  {busy === "delete" && <Spinner />}
                  Delete for good
                </button>
                <button className="text-btn" type="button" onClick={() => setConfirmDelete(false)}>
                  Keep
                </button>
              </>
            ) : (
              <button className="text-btn" type="button" onClick={() => setConfirmDelete(true)}>
                Delete
              </button>
            ))}
          {msg.text && <p className={`form-status${msg.error ? " err" : ""}`}>{msg.text}</p>}
        </div>
      </form>
    </li>
  );
}

export default function PhotoManager() {
  const [photos, setPhotos] = useState(null);
  const [error, setError] = useState("");

  const load = () =>
    api("/api/admin/photos")
      .then((d) => setPhotos(d.photos))
      .catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Uploader onUploaded={load} />
      {error && <p className="form-status err">{error}</p>}
      {photos === null && !error && (
        <div className="inline-loading" role="status" aria-label="Loading photos">
          <span className="spinner" />
        </div>
      )}
      {photos?.length === 0 && <p className="empty muted">No photos yet. Add some above.</p>}
      {photos?.length > 0 && (
        <ul className="admin-list">
          {photos.map((ph) => (
            <PhotoRow
              key={`${ph.id}:${ph.hidden}:${ph.avatar}`}
              photo={ph}
              isProfile={ph.avatar || (!photos.some((x) => x.avatar) && ph.avatarFile)}
              onChanged={load}
            />
          ))}
        </ul>
      )}
    </>
  );
}
