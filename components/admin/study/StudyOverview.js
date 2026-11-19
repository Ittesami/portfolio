"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingLink from "@/components/LoadingLink";
import { api, shiftDate, todayStr } from "../api";
import Spinner from "../Spinner";

export const TYPE_LABELS = { lesson: "Lessons", problem: "Problems", project: "Projects", task: "Tasks", practice: "Quizzes", exam: "Exams" };
const pct = (done, total) => (total ? Math.round((done / total) * 100) : 0);

// Days in a row (ending today or yesterday) with at least one item done.
function streak(days) {
  const set = new Set(days);
  let d = set.has(todayStr()) ? todayStr() : shiftDate(todayStr(), -1);
  let n = 0;
  while (set.has(d)) {
    n++;
    d = shiftDate(d, -1);
  }
  return n;
}

function NewCourse({ onCancel }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", short: "", accent: "green" });
  const [state, setState] = useState({ busy: false, error: "" });

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: "" });
    try {
      const { slug } = await api("/api/admin/study", { method: "POST", body: form });
      router.push(`/admin/study/${slug}`);
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  }

  return (
    <form className="tile form" onSubmit={submit}>
      <p className="label">New course</p>
      <label>
        Name
        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={80} placeholder="System Design" autoFocus required />
      </label>
      <label>
        <span className="field-label">
          What it&apos;s for <span className="opt">optional</span>
        </span>
        <input value={form.short} onChange={(e) => setForm((f) => ({ ...f, short: e.target.value }))} maxLength={200} placeholder="Prepare for system design interviews" />
      </label>
      <div className="field-block">
        <span className="field-label">Colour</span>
        <div className="accent-picker">
          {["blue", "amber", "violet", "green", "rose"].map((a) => (
            <button
              key={a}
              type="button"
              className={`accent-dot accent-${a}${form.accent === a ? " on" : ""}`}
              aria-label={a}
              aria-pressed={form.accent === a}
              onClick={() => setForm((f) => ({ ...f, accent: a }))}
            />
          ))}
        </div>
      </div>
      <div className="form-foot">
        <button className="btn primary" type="submit" disabled={state.busy} aria-busy={state.busy}>
          {state.busy && <Spinner />} Create course
        </button>
        <button className="btn" type="button" onClick={onCancel}>
          Cancel
        </button>
        {state.error && <p role="status" className="form-status err">{state.error}</p>}
      </div>
    </form>
  );
}

export default function StudyOverview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api("/api/admin/study")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p role="status" className="form-status err">{error}</p>;
  if (!data)
    return (
      <div className="inline-loading" role="status" aria-label="Loading courses">
        <span className="spinner" />
      </div>
    );

  const doneDays = data.recent.map((r) => todayStr(new Date(r.doneAt)));
  const week = data.recent.filter((r) => todayStr(new Date(r.doneAt)) > shiftDate(todayStr(), -7)).length;
  const totals = data.courses.reduce((a, c) => ({ done: a.done + c.done, total: a.total + c.total }), { done: 0, total: 0 });
  const titleOf = Object.fromEntries(data.courses.map((c) => [c.slug, c.title]));

  return (
    <>
      <div className="study-stats">
        <div className="tile">
          <p className="label">Done this week</p>
          <p className="macro-value">{week}</p>
        </div>
        <div className="tile">
          <p className="label">Streak</p>
          <p className="macro-value">
            {streak(doneDays)} <span className="muted small">days</span>
          </p>
        </div>
        <div className="tile">
          <p className="label">All courses</p>
          <p className="macro-value">
            {totals.done} <span className="muted small">/ {totals.total}</span>
          </p>
        </div>
      </div>

      <div className="row section-row">
        <h2 className="section-title">Courses</h2>
        {!adding && (
          <button type="button" className="btn small primary" onClick={() => setAdding(true)}>
            + New course
          </button>
        )}
      </div>
      {adding && <NewCourse onCancel={() => setAdding(false)} />}

      <ul className="course-list">
        {data.courses.map((c) => (
          <li key={c.slug}>
            <LoadingLink href={`/admin/study/${c.slug}`} className={`tile course-card accent-${c.accent}`}>
              <div className="row">
                <h3>{c.title}</h3>
                <span className="course-pct">{pct(c.done, c.total)}%</span>
              </div>
              {c.short && <p className="muted small">{c.short}</p>}
              <span className="bar-track">
                <span className="bar course-bar" style={{ width: `${pct(c.done, c.total)}%` }} />
              </span>
              <p className="small course-counts">
                {Object.entries(c.byType)
                  .map(([type, t]) => `${TYPE_LABELS[type] ?? type} ${t.done}/${t.total}`)
                  .join(" · ") || "No items yet"}
              </p>
              {c.next && (
                <p className="small course-next">
                  <span className="muted">Next:</span> {c.next.title}
                </p>
              )}
            </LoadingLink>
          </li>
        ))}
      </ul>

      {data.recent.length > 0 && (
        <section className="fit-section">
          <h2 className="section-title">Recently done</h2>
          <ul className="tile recent-list">
            {data.recent.slice(0, 10).map((r) => (
              <li key={`${r.course}:${r.item}`}>
                <span>{r.title}</span>
                <span className="muted small">
                  {titleOf[r.course]} · {new Date(r.doneAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
