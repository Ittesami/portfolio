"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingLink from "@/components/LoadingLink";
import { api } from "../api";
import Spinner from "../Spinner";
import Quiz from "./Quiz";
import { TYPE_LABELS } from "./StudyOverview";

const TYPE_NAME = { lesson: "Lesson", problem: "Problem", project: "Project", task: "Task", practice: "Quiz", exam: "Exam" };
const ADDABLE = ["lesson", "problem", "project", "task", "exam"];
const pct = (done, total) => (total ? Math.round((done / total) * 100) : 0);

function ItemForm({ initial, submitLabel, onSubmit, onCancel, quizItem = false }) {
  const [form, setForm] = useState({ title: "", type: "lesson", link: "", difficulty: "", detail: "", ...initial });
  const [state, setState] = useState({ busy: false, error: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: "" });
    try {
      await onSubmit(form);
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  }

  return (
    <form className="form item-form" onSubmit={submit}>
      <label>
        Title
        <input value={form.title} onChange={set("title")} maxLength={200} required autoFocus placeholder="Two Sum" />
      </label>
      {!quizItem && (
        <>
          <div className="item-form-row">
            <label>
              Type
              <select value={form.type} onChange={set("type")}>
                {ADDABLE.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_NAME[t]}
                  </option>
                ))}
              </select>
            </label>
            {form.type === "problem" && (
              <label>
                Difficulty
                <select value={form.difficulty} onChange={set("difficulty")}>
                  <option value="">–</option>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </label>
            )}
          </div>
          <label>
            <span className="field-label">
              Link <span className="opt">optional</span>
            </span>
            <input type="url" inputMode="url" value={form.link} onChange={set("link")} maxLength={500} placeholder="https://leetcode.com/problems/two-sum/" />
          </label>
          <label>
            <span className="field-label">
              Details <span className="opt">optional</span>
            </span>
            <input value={form.detail} onChange={set("detail")} maxLength={500} />
          </label>
        </>
      )}
      <div className="form-foot">
        <button className="btn primary" type="submit" disabled={state.busy} aria-busy={state.busy}>
          {state.busy && <Spinner />} {submitLabel}
        </button>
        <button className="btn" type="button" onClick={onCancel}>
          Cancel
        </button>
        {state.error && <p className="form-status err">{state.error}</p>}
      </div>
    </form>
  );
}

function ItemRow({ slug, moduleId, item, progress, first, last, onProgress, onCourse }) {
  const p = progress ?? { status: "todo", note: "", score: null, best: null, attempts: 0 };
  const done = p.status === "done";
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const [note, setNote] = useState(p.note ?? "");
  const [score, setScore] = useState(p.score ?? "");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState({ text: "", error: false });

  async function run(kind, fn, ok) {
    setBusy(kind);
    setMsg({ text: "", error: false });
    try {
      await fn();
      if (ok) setMsg({ text: ok, error: false });
    } catch (err) {
      setMsg({ text: err.message, error: true });
    } finally {
      setBusy("");
    }
  }
  const save = (body) => api(`/api/admin/study/${slug}/progress`, { method: "PUT", body: { item: item.id, ...body } }).then((r) => onProgress(item.id, r.progress));
  const edit = (body) => api(`/api/admin/study/${slug}`, { method: "PATCH", body: { module: moduleId, itemId: item.id, ...body } }).then((r) => onCourse(r.course));

  if (editing) {
    return (
      <li className="study-item editing">
        <ItemForm
          initial={{ title: item.title, type: item.type, link: item.link ?? "", difficulty: item.difficulty ?? "", detail: item.detail ?? "" }}
          quizItem={item.type === "practice"}
          submitLabel="Save"
          onCancel={() => setEditing(false)}
          onSubmit={async (form) => {
            await edit({ op: "updateItem", item: form });
            setEditing(false);
          }}
        />
      </li>
    );
  }

  const meta = [
    item.type !== "lesson" && TYPE_NAME[item.type],
    item.difficulty,
    item.type === "practice" && p.best != null && `Best ${p.best}% · ${p.attempts} ${p.attempts === 1 ? "try" : "tries"}`,
    item.type === "exam" && p.score != null && `Score ${p.score}%`,
    p.status === "doing" && "In progress",
  ].filter(Boolean);

  return (
    <li className={`study-item status-${p.status}${open ? " open" : ""}`}>
      <div className="study-item-main">
        <button
          type="button"
          className="study-check"
          role="checkbox"
          aria-checked={done}
          aria-label={done ? `Mark "${item.title}" as not done` : `Mark "${item.title}" as done`}
          disabled={busy === "check"}
          onClick={() => run("check", () => save({ status: done ? "todo" : "done" }))}
        >
          {busy === "check" ? <Spinner /> : done ? "✓" : ""}
        </button>
        <div className="study-item-text">
          {item.link ? (
            <a href={item.link} target="_blank" rel="noreferrer" className="study-item-title">
              {item.title} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className="study-item-title">{item.title}</span>
          )}
          {meta.length > 0 && (
            <span className="study-item-meta">
              {meta.map((m) => (
                <span key={m} className={`chip-mini${["Easy", "Medium", "Hard"].includes(m) ? ` diff-${m.toLowerCase()}` : ""}`}>
                  {m}
                </span>
              ))}
            </span>
          )}
          {item.detail && <span className="muted small">{item.detail}</span>}
          {p.note && !open && <span className="muted small study-note">📝 {p.note}</span>}
        </div>
        <div className="study-item-actions">
          {item.type === "practice" && (
            <button type="button" className="btn small" onClick={() => setQuiz((q) => !q)}>
              {quiz ? "Hide" : p.attempts ? "Retake" : "Start"}
            </button>
          )}
          <button type="button" className="text-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? "Less" : "More"}
          </button>
        </div>
      </div>

      {quiz && (
        <Quiz
          slug={slug}
          item={item}
          onDone={(progressNext) => onProgress(item.id, progressNext)}
          onClose={() => setQuiz(false)}
        />
      )}

      {open && (
        <div className="study-item-more">
          <div className="form-foot">
            {p.status !== "doing" && !done && (
              <button type="button" className="btn small" disabled={Boolean(busy)} onClick={() => run("doing", () => save({ status: "doing" }))}>
                {busy === "doing" && <Spinner />} Mark in progress
              </button>
            )}
            {p.status === "doing" && (
              <button type="button" className="btn small" disabled={Boolean(busy)} onClick={() => run("doing", () => save({ status: "todo" }))}>
                {busy === "doing" && <Spinner />} Not started
              </button>
            )}
            <button type="button" className="btn small" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button type="button" className="btn small" disabled={first || Boolean(busy)} onClick={() => run("move", () => edit({ op: "moveItem", dir: -1 }))} aria-label="Move up">
              ↑
            </button>
            <button type="button" className="btn small" disabled={last || Boolean(busy)} onClick={() => run("move", () => edit({ op: "moveItem", dir: 1 }))} aria-label="Move down">
              ↓
            </button>
            {confirm ? (
              <>
                <button type="button" className="btn small danger" disabled={Boolean(busy)} onClick={() => run("delete", () => edit({ op: "deleteItem" }))}>
                  {busy === "delete" && <Spinner />} Delete for good
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
          </div>
          {item.type === "exam" && (
            <form
              className="form inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                run("score", () => save({ score }), "Score saved");
              }}
            >
              <input type="number" inputMode="numeric" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} placeholder="Score %" aria-label="Score in percent" />
              <button type="submit" className="btn small" disabled={Boolean(busy)}>
                {busy === "score" && <Spinner />} Save score
              </button>
            </form>
          )}
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              run("note", () => save({ note }), "Note saved");
            }}
          >
            <label>
              <span className="field-label">
                Notes <span className="opt">optional</span>
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={2000}
                rows={3}
                placeholder={item.type === "problem" ? "Approach, complexity, what tripped you up" : "What to remember"}
              />
            </label>
            <div className="form-foot">
              <button type="submit" className="btn small" disabled={Boolean(busy)}>
                {busy === "note" && <Spinner />} Save note
              </button>
            </div>
          </form>
        </div>
      )}
      {msg.text && <p className={`form-status${msg.error ? " err" : ""}`}>{msg.text}</p>}
    </li>
  );
}

function ModuleSection({ slug, mod, progress, open, onToggle, onProgress, onCourse }) {
  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(mod.title);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const done = mod.items.filter((i) => progress[i.id]?.status === "done").length;
  const patch = (body) => api(`/api/admin/study/${slug}`, { method: "PATCH", body: { module: mod.id, ...body } }).then((r) => onCourse(r.course));

  async function run(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`tile study-module${open ? " open" : ""}${mod.items.length && done === mod.items.length ? " complete" : ""}`}>
      <button type="button" className="study-module-head" aria-expanded={open} onClick={onToggle}>
        <span className="study-module-title">{mod.title}</span>
        <span className="small study-module-count">
          {done}/{mod.items.length}
        </span>
        <span className="bar-track study-module-bar">
          <span className="bar" style={{ width: `${pct(done, mod.items.length)}%` }} />
        </span>
      </button>
      {open && (
        <div className="study-module-body">
          {mod.note && <p className="muted small">{mod.note}</p>}
          {mod.items.length === 0 && !adding && <p className="empty muted">Nothing here yet.</p>}
          <ul className="study-items">
            {mod.items.map((item, i) => (
              <ItemRow
                key={`${item.id}:${item.title}:${item.link ?? ""}:${item.type}:${item.difficulty ?? ""}`}
                slug={slug}
                moduleId={mod.id}
                item={item}
                progress={progress[item.id]}
                first={i === 0}
                last={i === mod.items.length - 1}
                onProgress={onProgress}
                onCourse={onCourse}
              />
            ))}
          </ul>
          {adding ? (
            <ItemForm
              initial={{}}
              submitLabel="Add"
              onCancel={() => setAdding(false)}
              onSubmit={async (form) => {
                await patch({ op: "addItem", item: form });
                setAdding(false);
              }}
            />
          ) : renaming ? (
            <form
              className="form inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                run(async () => {
                  await patch({ op: "updateModule", title });
                  setRenaming(false);
                });
              }}
            >
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} aria-label="Module name" autoFocus />
              <button type="submit" className="btn small" disabled={busy}>
                {busy && <Spinner />} Save
              </button>
              <button type="button" className="text-btn" onClick={() => setRenaming(false)}>
                Cancel
              </button>
            </form>
          ) : (
            <div className="form-foot">
              <button type="button" className="btn small" onClick={() => setAdding(true)}>
                + Add item
              </button>
              <button type="button" className="text-btn" onClick={() => setRenaming(true)}>
                Rename
              </button>
              {confirm ? (
                <>
                  <button type="button" className="btn small danger" disabled={busy} onClick={() => run(() => patch({ op: "deleteModule" }))}>
                    {busy && <Spinner />} Delete module and its progress
                  </button>
                  <button type="button" className="text-btn" onClick={() => setConfirm(false)}>
                    Keep
                  </button>
                </>
              ) : (
                <button type="button" className="text-btn" onClick={() => setConfirm(true)}>
                  Delete module
                </button>
              )}
            </div>
          )}
          {error && <p className="form-status err">{error}</p>}
        </div>
      )}
    </section>
  );
}

function CourseSettings({ slug, course, onCourse }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: course.title, short: course.short ?? "" });
  const [moduleTitle, setModuleTitle] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState({ text: "", error: false });

  async function run(kind, fn, ok) {
    setBusy(kind);
    setMsg({ text: "", error: false });
    try {
      await fn();
      if (ok) setMsg({ text: ok, error: false });
    } catch (err) {
      setMsg({ text: err.message, error: true });
    } finally {
      setBusy("");
    }
  }
  const patch = (body) => api(`/api/admin/study/${slug}`, { method: "PATCH", body }).then((r) => onCourse(r.course));

  return (
    <details className="tile plan-more course-settings">
      <summary>
        <span>Edit course</span>
        <span className="muted small">Name, modules, delete</span>
      </summary>
      <div className="plan-more-body">
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            run("course", () => patch({ op: "course", ...form }), "Saved");
          }}
        >
          <label>
            Name
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={80} required />
          </label>
          <label>
            Description
            <input value={form.short} onChange={(e) => setForm((f) => ({ ...f, short: e.target.value }))} maxLength={200} />
          </label>
          <div className="form-foot">
            <button type="submit" className="btn small" disabled={Boolean(busy)}>
              {busy === "course" && <Spinner />} Save
            </button>
          </div>
        </form>
        <form
          className="form inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            run("module", async () => {
              await patch({ op: "addModule", title: moduleTitle });
              setModuleTitle("");
            }, "Module added at the end");
          }}
        >
          <input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} maxLength={100} placeholder="New module name" aria-label="New module name" required />
          <button type="submit" className="btn small" disabled={Boolean(busy)}>
            {busy === "module" && <Spinner />} + Add module
          </button>
        </form>
        <div className="form-foot">
          {confirm ? (
            <>
              <button
                type="button"
                className="btn small danger"
                disabled={Boolean(busy)}
                onClick={() =>
                  run("delete", async () => {
                    await api(`/api/admin/study/${slug}`, { method: "DELETE" });
                    router.push("/admin/study");
                  })
                }
              >
                {busy === "delete" && <Spinner />} Delete course and all progress
              </button>
              <button type="button" className="text-btn" onClick={() => setConfirm(false)}>
                Keep
              </button>
            </>
          ) : (
            <button type="button" className="text-btn danger" onClick={() => setConfirm(true)}>
              Delete this course
            </button>
          )}
        </div>
        {msg.text && <p className={`form-status${msg.error ? " err" : ""}`}>{msg.text}</p>}
      </div>
    </details>
  );
}

export default function CourseView({ slug }) {
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({});
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api(`/api/admin/study/${slug}`)
      .then((d) => {
        setCourse(d.course);
        setProgress(d.progress);
        // Open the module you're working on: the first one with something not done.
        const first = d.course.modules.find((m) => m.items.some((i) => d.progress[i.id]?.status !== "done"));
        setOpen(new Set(first ? [first.id] : []));
      })
      .catch((err) => setError(err.message));
  }, [slug]);

  if (error)
    return (
      <>
        <p className="form-status err">{error}</p>
        <LoadingLink className="btn small" href="/admin/study">
          ← All courses
        </LoadingLink>
      </>
    );
  if (!course || !open)
    return (
      <div className="inline-loading" role="status" aria-label="Loading course">
        <span className="spinner" />
      </div>
    );

  const items = course.modules.flatMap((m) => m.items);
  const done = items.filter((i) => progress[i.id]?.status === "done").length;
  const byType = {};
  for (const i of items) {
    byType[i.type] ??= { total: 0, done: 0 };
    byType[i.type].total++;
    if (progress[i.id]?.status === "done") byType[i.type].done++;
  }
  const visible = (i) => filter === "all" || (filter === "done" ? progress[i.id]?.status === "done" : progress[i.id]?.status !== "done");
  const modules = course.modules.map((m) => ({ ...m, items: m.items.filter(visible) })).filter((m) => filter === "all" || m.items.length);
  const toggle = (id) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className={`course-view accent-${course.accent ?? "blue"}`}>
      <LoadingLink className="back-link small" href="/admin/study">
        ← All courses
      </LoadingLink>
      <h1 className="page-title small-title">{course.title}</h1>
      {course.short && <p className="muted page-intro">{course.short}</p>}

      <div className="tile course-head">
        <div className="row">
          <p className="label">Progress</p>
          <p className="course-pct">
            {done} / {items.length} · {pct(done, items.length)}%
          </p>
        </div>
        <span className="bar-track">
          <span className="bar course-bar" style={{ width: `${pct(done, items.length)}%` }} />
        </span>
        <div className="type-counts">
          {Object.entries(byType).map(([type, t]) => (
            <span key={type} className="small">
              <strong>
                {t.done}/{t.total}
              </strong>{" "}
              {TYPE_LABELS[type] ?? type}
            </span>
          ))}
        </div>
      </div>

      <div className="row study-toolbar">
        <div className="seg" role="group" aria-label="Show">
          {[
            ["all", "All"],
            ["todo", "To do"],
            ["done", "Done"],
          ].map(([key, label]) => (
            <button key={key} type="button" className={`seg-btn${filter === key ? " on" : ""}`} aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="text-btn"
          onClick={() => setOpen((s) => (s.size === course.modules.length ? new Set() : new Set(course.modules.map((m) => m.id))))}
        >
          {open.size === course.modules.length ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="study-modules">
        {modules.map((m) => (
          <ModuleSection
            key={`${m.id}:${m.title}`}
            slug={slug}
            mod={m}
            progress={progress}
            open={filter !== "all" || open.has(m.id)}
            onToggle={() => toggle(m.id)}
            onProgress={(id, p) =>
              setProgress((all) => {
                const next = { ...all };
                if (p) next[id] = p;
                else delete next[id];
                return next;
              })
            }
            onCourse={setCourse}
          />
        ))}
        {modules.length === 0 && <p className="empty muted">{filter === "done" ? "Nothing done yet." : "All done. Nice work."}</p>}
      </div>

      <CourseSettings key={`${course.title}:${course.short}`} slug={slug} course={course} onCourse={setCourse} />
    </div>
  );
}
