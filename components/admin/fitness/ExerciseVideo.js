"use client";

import { useState } from "react";
import { api } from "../api";
import Spinner from "../Spinner";

const search = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

// "How to do it" for one exercise: the saved form-tutorial video (loaded only
// when you press play), YouTube search links for more videos and Shorts, and a
// way to swap in a video you prefer.
export default function ExerciseVideo({ exercise, name, onVideoChange }) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState("");
  const [state, setState] = useState({ busy: false, error: "" });

  const label = exercise?.name ?? name;
  const video = exercise?.video ?? null;

  async function save(e) {
    e.preventDefault();
    if (!exercise) return;
    setState({ busy: true, error: "" });
    try {
      const { video: next } = await api(`/api/admin/fitness/exercises/${encodeURIComponent(exercise.id)}`, {
        method: "PATCH",
        body: { videoUrl: url },
      });
      onVideoChange?.(exercise.id, next);
      setState({ busy: false, error: "" });
      setEditing(false);
      setPlaying(false);
      setUrl("");
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  }

  return (
    <div className="howto">
      <button type="button" className="howto-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span aria-hidden="true">▶</span> {open ? "Hide how-to" : "How to do it"}
      </button>

      {open && (
        <div className="howto-panel">
          {video ? (
            <>
              <div className="video-frame">
                {playing ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`}
                    title={`${label}: ${video.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <button type="button" className="video-poster" onClick={() => setPlaying(true)} aria-label={`Play: ${video.title}`}>
                    {/* Plain img: YouTube's own thumbnail, no optimiser needed. */}
                    <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" />
                    <span className="play-badge" aria-hidden="true">▶</span>
                  </button>
                )}
              </div>
              <p className="small video-meta">
                <strong>{video.title}</strong>
                {video.channel && <span className="muted"> · {video.channel}</span>}
              </p>
            </>
          ) : (
            <p className="muted small">No saved video yet. Try the searches below, then save one you like.</p>
          )}

          <div className="howto-links">
            {video && (
              <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer">
                Open on YouTube ↗
              </a>
            )}
            <a href={search(`${label} proper form tutorial`)} target="_blank" rel="noreferrer">
              More videos ↗
            </a>
            <a href={search(`${label} form #shorts`)} target="_blank" rel="noreferrer">
              Shorts ↗
            </a>
            {exercise && !editing && (
              <button type="button" className="text-btn" onClick={() => setEditing(true)}>
                {video ? "Change video" : "Add a video"}
              </button>
            )}
          </div>

          {editing && (
            <form className="form inline-form video-form" onSubmit={save}>
              <input
                type="url"
                inputMode="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (state.error) setState({ busy: false, error: "" });
                }}
                placeholder="Paste a YouTube or Shorts link"
                aria-label="YouTube link"
              />
              <button className="btn small" type="submit" disabled={state.busy || !url.trim()} aria-busy={state.busy}>
                {state.busy && <Spinner />}
                {state.busy ? "Checking…" : "Save"}
              </button>
              <button className="text-btn" type="button" onClick={() => setEditing(false)}>
                Cancel
              </button>
              {state.error && <p className="form-status err">{state.error}</p>}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
