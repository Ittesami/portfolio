"use client";

import { useCallback, useEffect, useState } from "react";
import { api, prettyDate, shiftDate, todayStr } from "../api";
import Spinner from "../Spinner";
import WorkoutLogger, { planDayToDraft, workoutToDraft } from "./WorkoutLogger";
import ExerciseVideo from "./ExerciseVideo";

// Remembers which view (plan or progress) you last used, in this browser only.
const VIEW_KEY = "fitness-view";

const short = (d) => prettyDate(d, { weekday: "short", day: "numeric", month: "short" });

function fmtSet(e, s) {
  if (e.type === "timed") {
    const m = Math.floor(s.seconds / 60);
    const sec = s.seconds % 60;
    const t = m ? `${m}m${sec ? ` ${sec}s` : ""}` : `${sec}s`;
    return s.distance ? `${t} · ${s.distance} km` : t;
  }
  return s.weight ? `${s.reps} × ${s.weight} kg` : `${s.reps} reps`;
}

// On Sundays the useful week is the one starting tomorrow.
function defaultWeekDay() {
  const t = todayStr();
  return new Date(`${t}T12:00:00`).getDay() === 0 ? shiftDate(t, 1) : t;
}

function PlanDay({ day, done, today, onLog, exercisesById, onVideoChange }) {
  return (
    <li className={`tile plan-day${day.rest ? " rest" : ""}${day.date === today ? " is-today" : ""}`}>
      <div className="row">
        <p className="label">{short(day.date)}</p>
        {done && <span className="badge accent">Logged</span>}
      </div>
      <h3>{day.title}</h3>
      <p className="muted small">{day.focus}</p>
      {!day.rest && (
        <>
          {day.warmup && (
            <p className="small">
              <strong>Warm-up:</strong> {day.warmup}
            </p>
          )}
          <ol className="plan-exercises">
            {day.exercises.map((x, i) => (
              <li key={i}>
                <span className="plan-ex-name">{x.name}</span>
                <span className="plan-ex-dose">
                  {x.sets} × {x.target}
                  {x.restSeconds ? ` · rest ${x.restSeconds}s` : ""}
                </span>
                {x.load && <span className="plan-ex-load">{x.load}</span>}
                {x.notes && <span className="muted small">{x.notes}</span>}
                <ExerciseVideo exercise={exercisesById.get(x.exerciseId)} name={x.name} onVideoChange={onVideoChange} />
              </li>
            ))}
          </ol>
          {day.cooldown && (
            <p className="small">
              <strong>Cool-down:</strong> {day.cooldown}
            </p>
          )}
          <button type="button" className="btn small" onClick={() => onLog(day)}>
            {done ? "Log another session" : "Log this workout"}
          </button>
        </>
      )}
    </li>
  );
}

function Plan({ data, today, onLog, onGenerate, generating, genError, library, onVideoChange }) {
  const exercisesById = new Map(library.exercises.map((e) => [e.id, e]));
  const plan = data.plan;
  const loggedDates = new Set(data.weekWorkouts.map((w) => w.date));
  return (
    <section className="fit-section">
      <div className="row section-row">
        <h2 className="section-title">Plan</h2>
        <button
          type="button"
          className="btn small primary"
          onClick={onGenerate}
          disabled={generating}
          aria-busy={generating}
          title={data.claudeReady ? "" : "Needs ANTHROPIC_API_KEY"}
        >
          {generating && <Spinner />}
          {generating ? "Claude is planning… (about a minute)" : plan ? "Re-plan with Claude" : "Plan this week with Claude"}
        </button>
      </div>
      {genError && <p className="form-status err">{genError}</p>}
      {!data.claudeReady && !plan && (
        <p className="muted small">Add ANTHROPIC_API_KEY to your environment variables to let Claude write plans.</p>
      )}

      {!plan ? (
        <div className="tile empty-state">
          <p className="big">No plan for this week yet.</p>
          <p className="muted">
            Ask Claude to write one. It looks at the last four weeks you logged, your profile and your body weight.
          </p>
        </div>
      ) : (
        <>
          <div className="tile plan-review">
            <p className="label">
              {plan.source === "claude" ? "Claude's review" : "Coach's notes"} · {prettyDate(data.dates[0], { day: "numeric", month: "short" })} –{" "}
              {prettyDate(data.dates[6], { day: "numeric", month: "short" })}
            </p>
            <p>{plan.review?.summary}</p>
            <p className="big small-big">{plan.weekSummary}</p>
            {plan.review?.highlights?.length > 0 && (
              <>
                <p className="label">Highlights</p>
                <ul className="bullets">
                  {plan.review.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </>
            )}
            {plan.review?.adjustments?.length > 0 && (
              <>
                <p className="label">This week</p>
                <ul className="bullets">
                  {plan.review.adjustments.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <ul className="plan-days">
            {plan.days.map((d) => (
              <PlanDay
                key={d.date}
                day={d}
                done={loggedDates.has(d.date)}
                today={today}
                onLog={onLog}
                exercisesById={exercisesById}
                onVideoChange={onVideoChange}
              />
            ))}
          </ul>
          <div className="plan-tips">
            {plan.progressionRules?.length > 0 && (
              <div className="tile">
                <p className="label">How to progress</p>
                <ul className="bullets">
                  {plan.progressionRules.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {plan.recoveryTips?.length > 0 && (
              <div className="tile">
                <p className="label">Recovery</p>
                <ul className="bullets">
                  {plan.recoveryTips.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function WorkoutCard({ w, onEdit, onDeleted }) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    try {
      await api(`/api/admin/fitness/workouts/${w.id}`, { method: "DELETE" });
      onDeleted(w.id);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <li className="workout">
      <div className="row">
        <strong>{short(w.date)}</strong>
        <div className="todo-actions">
          {confirm ? (
            <>
              <button type="button" className="text-btn danger" onClick={remove} disabled={busy}>
                {busy && <Spinner />} Delete
              </button>
              <button type="button" className="text-btn" onClick={() => setConfirm(false)}>
                Keep
              </button>
            </>
          ) : (
            <>
              <button type="button" className="text-btn" onClick={() => onEdit(w)}>
                Edit
              </button>
              <button type="button" className="text-btn" onClick={() => setConfirm(true)}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      <ul className="workout-entries">
        {w.entries.map((e, i) => (
          <li key={i}>
            <span>{e.name}</span>
            <span className="muted small">{e.sets.map((s) => fmtSet(e, s)).join(", ")}</span>
          </li>
        ))}
      </ul>
      {w.notes && <p className="muted small">{w.notes}</p>}
      {error && <p className="form-status err">{error}</p>}
    </li>
  );
}

function Progress({ data, onWeightSaved }) {
  const [form, setForm] = useState({ date: todayStr(), kg: "" });
  const [state, setState] = useState({ busy: false, error: "", ok: false });
  const maxVol = Math.max(1, ...data.weeks.map((w) => w.volume));

  async function save(e) {
    e.preventDefault();
    setState({ busy: true, error: "", ok: false });
    try {
      await api("/api/admin/fitness/bodyweight", { method: "PUT", body: form });
      setState({ busy: false, error: "", ok: true });
      setForm((f) => ({ ...f, kg: "" }));
      onWeightSaved();
    } catch (err) {
      setState({ busy: false, error: err.message, ok: false });
    }
  }

  const bw = data.bodyweights;
  const change = bw.length > 1 ? Math.round((bw[0].kg - bw[bw.length - 1].kg) * 10) / 10 : null;

  return (
    <section className="fit-section">
      <h2 className="section-title">Progress</h2>
      <div className="progress-grid">
        <div className="tile">
          <p className="label">Body weight</p>
          <p className="big">
            {bw[0] ? `${bw[0].kg} kg` : `${data.profile.weightKg} kg`}
            {change !== null && (
              <span className={`trend ${change >= 0 ? "up" : "down"}`}>
                {change >= 0 ? "+" : ""}
                {change} kg since {short(bw[bw.length - 1].date)}
              </span>
            )}
          </p>
          <form className="form inline-form" onSubmit={save}>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} aria-label="Date" />
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="30"
              max="300"
              placeholder="kg"
              value={form.kg}
              onChange={(e) => setForm((f) => ({ ...f, kg: e.target.value }))}
              aria-label="Weight in kg"
            />
            <button className="btn small" type="submit" disabled={state.busy} aria-busy={state.busy}>
              {state.busy && <Spinner />}
              {state.busy ? "Saving…" : "Log weight"}
            </button>
          </form>
          {state.ok && <p className="form-status">Saved</p>}
          {state.error && <p className="form-status err">{state.error}</p>}
          {bw.length > 0 && (
            <ul className="weight-list">
              {bw.slice(0, 6).map((b) => (
                <li key={b.date}>
                  <span className="muted small">{short(b.date)}</span> {b.kg} kg
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tile">
          <p className="label">Last 8 weeks</p>
          <ul className="week-bars">
            {data.weeks.map((w) => (
              <li key={w.weekStart} title={`${w.sessions} sessions, ${w.sets} sets, ${w.volume} kg lifted, ${w.minutes} min timed`}>
                <span className="muted small">{prettyDate(w.weekStart, { day: "numeric", month: "short" })}</span>
                <span className="bar-track">
                  <span className="bar" style={{ width: `${(w.volume / maxVol) * 100}%` }} />
                </span>
                <span className="small">
                  {w.sessions} × · {w.volume.toLocaleString("en-GB")} kg
                </span>
              </li>
            ))}
          </ul>
          <p className="muted small">Sessions and total kg lifted (reps × weight) per week.</p>
        </div>

        <div className="tile">
          <p className="label">Best sets</p>
          {data.bests.length === 0 ? (
            <p className="muted">Your best set for each exercise will show here once you log workouts.</p>
          ) : (
            <ul className="workout-entries">
              {data.bests.map((b) => (
                <li key={b.exerciseId}>
                  <span>{b.name}</span>
                  <span className="muted small">
                    {fmtSet({ type: b.type }, b.best)} · {short(b.best.date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ProfileForm({ profile, onSaved }) {
  const [form, setForm] = useState(profile);
  const [state, setState] = useState({ busy: false, error: "", ok: false });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setState({ busy: true, error: "", ok: false });
    try {
      await api("/api/admin/fitness/profile", { method: "PUT", body: form });
      setState({ busy: false, error: "", ok: true });
      onSaved();
    } catch (err) {
      setState({ busy: false, error: err.message, ok: false });
    }
  }

  return (
    <details className="tile fit-profile">
      <summary>
        Your profile <span className="muted small">· what Claude plans around</span>
      </summary>
      <form className="form" onSubmit={save}>
        <div className="row">
          <label>
            Height (cm)
            <input type="number" value={form.heightCm} onChange={set("heightCm")} min="100" max="250" />
          </label>
          <label>
            Weight (kg)
            <input type="number" step="0.1" value={form.weightKg} onChange={set("weightKg")} min="30" max="300" />
          </label>
        </div>
        <div className="row">
          <label>
            Goal
            <input value={form.goal} onChange={set("goal")} maxLength={200} />
          </label>
          <label>
            Training days per week
            <input type="number" value={form.daysPerWeek} onChange={set("daysPerWeek")} min="1" max="7" />
          </label>
        </div>
        <div className="row">
          <label>
            Experience
            <input value={form.experience} onChange={set("experience")} maxLength={100} />
          </label>
          <label>
            Equipment
            <input value={form.equipment} onChange={set("equipment")} maxLength={200} />
          </label>
        </div>
        <label>
          <span className="field-label">Notes for Claude <span className="opt">optional</span></span>
          <textarea
            value={form.notes}
            onChange={set("notes")}
            maxLength={1000}
            placeholder="Injuries, preferred days, things you enjoy or want to avoid"
          />
        </label>
        <div className="form-foot">
          <button className="btn" type="submit" disabled={state.busy} aria-busy={state.busy}>
            {state.busy && <Spinner />}
            {state.busy ? "Saving…" : "Save profile"}
          </button>
          {state.ok && <p className="form-status">Saved</p>}
          {state.error && <p className="form-status err">{state.error}</p>}
        </div>
      </form>
    </details>
  );
}

export default function FitnessTracker() {
  const [today, setToday] = useState("");
  const [week, setWeek] = useState("");
  const [data, setData] = useState(null);
  const [library, setLibrary] = useState(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null);
  const [gen, setGen] = useState({ busy: false, error: "" });
  const [view, setView] = useState("plan");

  const load = useCallback(async (w) => {
    try {
      setData(await api(`/api/admin/fitness/overview?week=${w}`));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    setToday(todayStr());
    setWeek(defaultWeekDay());
    try {
      if (localStorage.getItem(VIEW_KEY) === "progress") setView("progress");
    } catch {}
    api("/api/admin/fitness/exercises")
      .then(setLibrary)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (week) load(week);
  }, [week, load]);

  async function generate() {
    setGen({ busy: true, error: "" });
    try {
      await api("/api/admin/fitness/plans/generate", { method: "POST", body: { week, today: todayStr() } });
      await load(week);
      setGen({ busy: false, error: "" });
    } catch (err) {
      setGen({ busy: false, error: err.message });
    }
  }

  function switchView(next) {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {}
  }

  function openLogger(next) {
    setDraft(next);
    switchView("progress");
    requestAnimationFrame(() => document.getElementById("logger")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  const ready = data && library && data.weekStart;
  const setVideo = (id, video) =>
    setLibrary((l) => ({ ...l, exercises: l.exercises.map((e) => (e.id === id ? { ...e, video } : e)) }));

  return (
    <div className="fitness">
      <div className="view-switch" role="tablist" aria-label="Fitness view">
        {[
          ["plan", "Plan"],
          ["progress", "Progress"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={view === key}
            className={view === key ? "on" : ""}
            onClick={() => switchView(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "plan" && (
        <div className="week-nav tile">
          <button type="button" className="btn small" onClick={() => setWeek(shiftDate(week, -7))} aria-label="Previous week">
            ←
          </button>
          <div className="week-label">
            <p className="label">Week</p>
            <p className="big">
              {data?.dates ? `${short(data.dates[0])} – ${short(data.dates[6])}` : " "}
            </p>
          </div>
          <button type="button" className="btn small" onClick={() => setWeek(shiftDate(week, 7))} aria-label="Next week">
            →
          </button>
        </div>
      )}

      {error && <p className="form-status err">{error}</p>}
      {!ready && !error && (
        <div className="inline-loading" role="status" aria-label="Loading fitness">
          <span className="spinner" />
        </div>
      )}

      {ready && view === "plan" && (
        <Plan
          data={data}
          today={today}
          generating={gen.busy}
          genError={gen.error}
          onGenerate={generate}
          onLog={(day) => openLogger(planDayToDraft(day, library.exercises))}
          library={library}
          onVideoChange={setVideo}
        />
      )}

      {ready && view === "progress" && (
        <>
          <section className="fit-section" id="logger">
            <div className="row section-row">
              <h2 className="section-title">{draft?.id ? "Edit workout" : "Log a workout"}</h2>
              {!draft && (
                <button
                  type="button"
                  className="btn small"
                  onClick={() => openLogger({ id: null, date: today, notes: "", entries: [] })}
                >
                  + New workout
                </button>
              )}
            </div>
            {draft ? (
              <div className="tile">
                <WorkoutLogger
                  key={draft.id ?? draft.date}
                  draft={draft}
                  setDraft={setDraft}
                  library={library}
                  onLibraryChange={(exercises) => setLibrary((l) => ({ ...l, exercises }))}
                  onVideoChange={setVideo}
                  onCancel={() => setDraft(null)}
                  onSaved={() => {
                    setDraft(null);
                    load(week);
                  }}
                />
              </div>
            ) : (
              <p className="muted small">
                Start a new workout here, or use "Log this workout" on a day in the Plan view to pre-fill it.
              </p>
            )}
          </section>

          <section className="fit-section">
            <h2 className="section-title">Recent workouts</h2>
            {data.recentWorkouts.length === 0 ? (
              <p className="muted">Nothing logged yet.</p>
            ) : (
              <ul className="tile workouts">
                {data.recentWorkouts.map((w) => (
                  <WorkoutCard
                    key={w.id}
                    w={w}
                    onEdit={(wk) => openLogger(workoutToDraft(wk))}
                    onDeleted={() => load(week)}
                  />
                ))}
              </ul>
            )}
          </section>

          <Progress data={data} onWeightSaved={() => load(week)} />
          <ProfileForm key={JSON.stringify(data.profile)} profile={data.profile} onSaved={() => load(week)} />
        </>
      )}
    </div>
  );
}
