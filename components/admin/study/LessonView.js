"use client";

import { useEffect, useState } from "react";
import LoadingLink from "@/components/LoadingLink";
import { api } from "../api";
import Spinner from "../Spinner";
import Markdown from "./Markdown";

// Reading page for one lesson: the notes, then mark it done, your own notes, the
// module's problems to practise, and previous/next lesson.
export default function LessonView({ slug, itemId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState({ text: "", error: false });

  useEffect(() => {
    let alive = true;
    setData(null);
    setError("");
    setMsg({ text: "", error: false });
    api(`/api/admin/study/${slug}/lesson?item=${encodeURIComponent(itemId)}`)
      .then(async (d) => {
        if (!alive) return;
        setData(d);
        setNote(d.progress?.note ?? "");
        window.scrollTo(0, 0);
        // Opening a lesson you haven't started marks it as in progress.
        if (!d.progress && d.content) {
          const { progress } = await api(`/api/admin/study/${slug}/progress`, { method: "PUT", body: { item: itemId, status: "doing" } });
          if (alive) setData((x) => ({ ...x, progress }));
        }
      })
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, [slug, itemId]);

  async function save(id, body, kind, ok) {
    setBusy(kind);
    setMsg({ text: "", error: false });
    try {
      const { progress } = await api(`/api/admin/study/${slug}/progress`, { method: "PUT", body: { item: id, ...body } });
      setData((d) => ({
        ...d,
        progress: id === itemId ? progress : d.progress,
        module: { ...d.module, items: d.module.items.map((i) => (i.id === id ? { ...i, status: progress?.status ?? "todo" } : i)) },
      }));
      if (ok) setMsg({ text: ok, error: false });
    } catch (err) {
      setMsg({ text: err.message, error: true });
    } finally {
      setBusy("");
    }
  }

  const back = (
    <LoadingLink className="back-link small" href={`/admin/study/${slug}`}>
      ← {data?.course.title ?? "Course"}
    </LoadingLink>
  );

  if (error)
    return (
      <>
        {back}
        <p className="form-status err">{error}</p>
      </>
    );
  if (!data)
    return (
      <div className="inline-loading" role="status" aria-label="Loading lesson">
        <span className="spinner" />
      </div>
    );

  const done = data.progress?.status === "done";
  const practice = data.module.items.filter((i) => i.type !== "lesson");

  return (
    <article className={`lesson accent-${data.course.accent}`}>
      {back}
      <p className="label">
        {data.module.title}
        {data.position && ` · lesson ${data.position.n} of ${data.position.of}`}
      </p>
      <h1 className="page-title small-title lesson-title">{data.item.title}</h1>
      <div className="lesson-status">
        <span className={`badge ${done ? "accent" : ""}`}>{done ? "Done" : data.progress?.status === "doing" ? "In progress" : "Not started"}</span>
      </div>

      {data.content ? (
        <div className="tile lesson-body">
          <Markdown text={data.content} />
        </div>
      ) : (
        <p className="empty muted">There are no notes for this item yet.</p>
      )}

      <div className="tile lesson-actions">
        <button
          type="button"
          className={`btn ${done ? "" : "primary"}`}
          disabled={Boolean(busy)}
          aria-busy={busy === "done"}
          onClick={() => save(itemId, { status: done ? "doing" : "done" }, "done", done ? "" : "Marked as done")}
        >
          {busy === "done" && <Spinner />}
          {done ? "Mark as not done" : "✓ Mark as done"}
        </button>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            save(itemId, { note }, "note", "Note saved");
          }}
        >
          <label>
            <span className="field-label">
              Your notes <span className="opt">optional</span>
            </span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} rows={3} placeholder="What clicked, what to revisit" />
          </label>
          <div className="form-foot">
            <button type="submit" className="btn small" disabled={Boolean(busy)}>
              {busy === "note" && <Spinner />} Save note
            </button>
          </div>
        </form>
        {msg.text && <p className={`form-status${msg.error ? " err" : ""}`}>{msg.text}</p>}
      </div>

      {practice.length > 0 && (
        <section className="tile lesson-practice">
          <p className="label">Practise this module</p>
          <ul className="study-items">
            {practice.map((p) => {
              const pDone = p.status === "done";
              return (
                <li key={p.id} className={`study-item status-${p.status}`}>
                  <div className="study-item-main">
                    <button
                      type="button"
                      className="study-check"
                      role="checkbox"
                      aria-checked={pDone}
                      aria-label={pDone ? `Mark "${p.title}" as not done` : `Mark "${p.title}" as done`}
                      disabled={busy === p.id}
                      onClick={() => save(p.id, { status: pDone ? "todo" : "done" }, p.id)}
                    >
                      {busy === p.id ? <Spinner /> : pDone ? "✓" : ""}
                    </button>
                    <div className="study-item-text">
                      {p.link ? (
                        <a href={p.link} target="_blank" rel="noreferrer" className="study-item-title">
                          {p.title} <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        <span className="study-item-title">{p.title}</span>
                      )}
                      {p.difficulty && (
                        <span className="study-item-meta">
                          <span className={`chip-mini diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="muted small">Add notes, scores or mark problems in progress from the course page.</p>
        </section>
      )}

      <nav className="lesson-nav" aria-label="Lessons">
        {data.prev ? (
          <LoadingLink className="tile lesson-nav-link" href={`/admin/study/${slug}/${data.prev.id}`}>
            <span className="label">← Previous</span>
            <span>{data.prev.title}</span>
          </LoadingLink>
        ) : (
          <span />
        )}
        {data.next ? (
          <LoadingLink className="tile lesson-nav-link next" href={`/admin/study/${slug}/${data.next.id}`}>
            <span className="label">Next →</span>
            <span>{data.next.title}</span>
          </LoadingLink>
        ) : (
          <LoadingLink className="tile lesson-nav-link next" href={`/admin/study/${slug}`}>
            <span className="label">Finished</span>
            <span>Back to the course</span>
          </LoadingLink>
        )}
      </nav>
    </article>
  );
}
