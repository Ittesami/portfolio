"use client";

import { useCallback, useEffect, useState } from "react";
import { api, nowHHMM, prettyDate, shiftDate, todayStr } from "../api";
import Spinner from "../Spinner";
import { MEAL_PLAN, describeItem, mealMacros, nutritionTargets, planMacros } from "@/lib/nutrition";
import { describeEstimate, estimateMeal, mealNumbers } from "@/lib/food-estimate";

const r = (n) => Math.round(n);
const fmt = (n) => Math.round(n).toLocaleString("en-GB");

function Targets({ profile }) {
  const t = nutritionTargets(profile);
  const tiles = [
    ["Calories", `${t.kcal.toLocaleString("en-GB")}`, "kcal a day", `About 400 above the ~${t.maintenance.toLocaleString("en-GB")} you burn`],
    ["Protein", `${t.protein} g`, "a day", "2 g per kg of body weight"],
    ["Carbs", `${t.carbs} g`, "a day", "Rice, bread, fruit: your training fuel"],
    ["Fat", `${t.fat} g`, "a day", "About a quarter of your calories"],
  ];
  return (
    <section className="fit-section">
      <h2 className="section-title">Daily targets</h2>
      <div className="macro-grid">
        {tiles.map(([label, value, unit, hint]) => (
          <div className="tile macro-tile" key={label}>
            <p className="label">{label}</p>
            <p className="macro-value">
              {value} <span className="muted small">{unit}</span>
            </p>
            <p className="muted small">{hint}</p>
          </div>
        ))}
      </div>
      <p className="muted small">
        Based on {t.weight} kg, {profile.heightCm} cm, age {t.age} and about four training days a week (change these in
        your profile under Progress). If your weight doesn&apos;t go up over two weeks, add about 200 kcal a day.
      </p>
    </section>
  );
}

function ExampleDay() {
  const total = planMacros();
  return (
    <section className="fit-section">
      <h2 className="section-title">Example day · no vegetables</h2>
      <div className="tile meal-plan">
        <ul className="meal-list">
          {MEAL_PLAN.map((m) => {
            const mm = mealMacros(m);
            return (
              <li key={m.meal}>
                <span className="meal-time">{m.time}</span>
                <div>
                  <p className="meal-name">{m.meal}</p>
                  <p>{m.items.map(describeItem).join(" · ")}</p>
                  <p className="meal-macros">
                    {r(mm.kcal)} kcal · {r(mm.p)} g protein · {r(mm.c)} g carbs
                  </p>
                  {m.note && <p className="muted small">{m.note}</p>}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="meal-total">
          <strong>Day total</strong> ≈ {r(total.kcal).toLocaleString("en-GB")} kcal · {r(total.p)} g protein · {r(total.c)} g
          carbs · {r(total.f)} g fat
        </p>
        <ul className="bullets small">
          <li>Swap like for like: chicken, beef, mutton or fish; rice for roti, paratha or bread.</li>
          <li>Fruit stands in for vegetables, so have at least two a day for fibre and vitamins.</li>
          <li>Drink 2.5–3 litres of water a day, more on gym days.</li>
          <li>Numbers are estimates for typical portions, not exact measurements.</li>
        </ul>
      </div>
    </section>
  );
}

// "≈ 650 kcal · 35 g protein", or a nudge when the text has nothing it recognises.
function EstimateLine({ meal, text }) {
  const n = mealNumbers(meal ?? { text });
  if (!n) return <p className="meal-est muted">No known foods found. Add the calories yourself under &ldquo;Adjust&rdquo;.</p>;
  return (
    <p className="meal-est">
      <strong>
        {n.manual ? "" : "≈ "}
        {fmt(n.kcal)} kcal · {r(n.p)} g protein
      </strong>
      <span className="muted">{n.manual ? " · your numbers" : n.items.length ? ` · ${describeEstimate(n)}` : ""}</span>
    </p>
  );
}

function MealForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState({ kcal: "", protein: "", ...initial, kcal: initial.kcal ?? "", protein: initial.protein ?? "" });
  const [adjust, setAdjust] = useState(form.kcal !== "" || form.protein !== "");
  const [state, setState] = useState({ busy: false, error: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const est = estimateMeal(form.text);

  async function submit(e) {
    e.preventDefault();
    if (!form.text.trim()) return setState({ busy: false, error: "Write what you had." });
    setState({ busy: true, error: "" });
    try {
      await onSubmit(adjust ? form : { ...form, kcal: "", protein: "" });
      setState({ busy: false, error: "" });
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  }

  return (
    <form className="form meal-form" onSubmit={submit}>
      <div className="meal-form-row">
        <label>
          Time
          <input type="time" value={form.time} onChange={set("time")} required />
        </label>
        <label>
          What you had
          <textarea
            value={form.text}
            onChange={set("text")}
            maxLength={1000}
            placeholder="2 cups rice, 150 g chicken curry, 1 glass of milk"
            autoFocus
          />
        </label>
      </div>
      {form.text.trim() && (
        <div className="meal-preview">
          {est ? (
            <p className="meal-est">
              <strong>
                ≈ {fmt(est.kcal)} kcal · {est.p} g protein
              </strong>
              <span className="muted"> · {describeEstimate(est)}</span>
            </p>
          ) : (
            <p className="meal-est muted">No known foods found yet. Numbers and units help: &ldquo;2 cups rice&rdquo;, &ldquo;150 g chicken&rdquo;.</p>
          )}
          {!adjust && (
            <button type="button" className="text-btn" onClick={() => setAdjust(true)}>
              Adjust
            </button>
          )}
        </div>
      )}
      {adjust && (
        <div className="row meal-adjust">
          <label>
            <span className="field-label">
              Calories <span className="opt">kcal</span>
            </span>
            <input type="number" inputMode="numeric" min="0" max="5000" value={form.kcal} onChange={set("kcal")} placeholder={est ? String(est.kcal) : ""} />
          </label>
          <label>
            <span className="field-label">
              Protein <span className="opt">g</span>
            </span>
            <input type="number" inputMode="numeric" min="0" max="400" value={form.protein} onChange={set("protein")} placeholder={est ? String(est.p) : ""} />
          </label>
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              setAdjust(false);
              setForm((f) => ({ ...f, kcal: "", protein: "" }));
            }}
          >
            Use the estimate
          </button>
        </div>
      )}
      <div className="form-foot">
        <button className="btn primary" type="submit" disabled={state.busy} aria-busy={state.busy}>
          {state.busy && <Spinner />}
          {state.busy ? "Saving…" : submitLabel}
        </button>
        <button className="btn" type="button" onClick={onCancel}>
          Cancel
        </button>
        {state.error && <p className="form-status err">{state.error}</p>}
      </div>
    </form>
  );
}

function MealRow({ meal, onSaved, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (editing) {
    return (
      <li className="meal-entry editing">
        <MealForm
          initial={{ time: meal.time, text: meal.text, kcal: meal.kcal, protein: meal.protein }}
          submitLabel="Save"
          onCancel={() => setEditing(false)}
          onSubmit={async (form) => {
            const { meal: m } = await api(`/api/admin/fitness/meals/${meal.id}`, {
              method: "PUT",
              body: { ...form, date: meal.date },
            });
            onSaved(m);
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className="meal-entry">
      <span className="meal-time">{meal.time}</span>
      <div>
        <p className="meal-text">{meal.text}</p>
        <EstimateLine meal={meal} />
      </div>
      <div className="todo-actions">
        {confirm ? (
          <>
            <button
              type="button"
              className="text-btn danger"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await api(`/api/admin/fitness/meals/${meal.id}`, { method: "DELETE" });
                  onDeleted(meal.id);
                } catch (err) {
                  setError(err.message);
                  setBusy(false);
                }
              }}
            >
              {busy && <Spinner />} Delete
            </button>
            <button type="button" className="text-btn" onClick={() => setConfirm(false)}>
              Keep
            </button>
          </>
        ) : (
          <>
            <button type="button" className="text-btn" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button type="button" className="text-btn" onClick={() => setConfirm(true)}>
              Delete
            </button>
          </>
        )}
      </div>
      {error && <p className="form-status err">{error}</p>}
    </li>
  );
}

// Calories, protein, carbs and fat for a list of meals; `unknown` counts meals with no numbers.
function totals(meals) {
  return meals.reduce(
    (a, m) => {
      const n = mealNumbers(m);
      if (!n) return { ...a, unknown: a.unknown + 1 };
      return { kcal: a.kcal + n.kcal, p: a.p + n.p, c: a.c + n.c, f: a.f + n.f, unknown: a.unknown };
    },
    { kcal: 0, p: 0, c: 0, f: 0, unknown: 0 },
  );
}

// One "eaten / target" bar.
function Meter({ label, value, target, unit }) {
  const pct = target ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div className="meter">
      <div className="meter-row">
        <span className="label">{label}</span>
        <span className="small">
          <strong>{fmt(value)}</strong>
          <span className="muted">
            {" "}
            / {fmt(target)} {unit}
          </span>
        </span>
      </div>
      <span className="bar-track">
        <span className={`bar ${value < target * 0.8 ? "short" : ""}`} style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}

function FoodLog({ targets, onChanged }) {
  const [today, setToday] = useState("");
  const [date, setDate] = useState("");
  const [meals, setMeals] = useState(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async (d) => {
    setMeals(null);
    setError("");
    try {
      setMeals((await api(`/api/admin/fitness/meals?date=${d}`)).meals);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const t = todayStr();
    setToday(t);
    setDate(t);
  }, []);

  useEffect(() => {
    if (date) load(date);
  }, [date, load]);

  const sortByTime = (list) => [...list].sort((a, b) => a.time.localeCompare(b.time));
  const change = (fn) => {
    setMeals(fn);
    onChanged();
  };
  const sum = meals ? totals(meals) : null;

  return (
    <section className="fit-section">
      <div className="row section-row">
        <h2 className="section-title">What I ate</h2>
        {!adding && (
          <button type="button" className="btn small primary" onClick={() => setAdding(true)}>
            + Add
          </button>
        )}
      </div>
      <div className="tile">
        <div className="prayer-head">
          <div>
            <p className="label">{date === today ? "Today" : "Day"}</p>
            <p className="big">{date && prettyDate(date)}</p>
          </div>
          <div className="day-nav">
            <button type="button" className="btn small" onClick={() => setDate(shiftDate(date, -1))} aria-label="Previous day">
              ←
            </button>
            <button type="button" className="btn small" onClick={() => setDate(today)} disabled={date === today}>
              Today
            </button>
            <button
              type="button"
              className="btn small"
              onClick={() => setDate(shiftDate(date, 1))}
              disabled={date >= today}
              aria-label="Next day"
            >
              →
            </button>
          </div>
        </div>

        {sum && meals.length > 0 && (
          <div className="day-meters">
            <Meter label="Calories" value={sum.kcal} target={targets.kcal} unit="kcal" />
            <Meter label="Protein" value={sum.p} target={targets.protein} unit="g" />
          </div>
        )}

        {adding && (
          <MealForm
            key={date}
            initial={{ time: date === today ? nowHHMM() : "13:00", text: "" }}
            submitLabel="Add"
            onCancel={() => setAdding(false)}
            onSubmit={async (form) => {
              const { meal } = await api("/api/admin/fitness/meals", { method: "POST", body: { ...form, date } });
              change((list) => sortByTime([...(list ?? []), meal]));
              setAdding(false);
            }}
          />
        )}

        {error && <p className="form-status err">{error}</p>}
        {meals === null && !error ? (
          <div className="inline-loading" role="status" aria-label="Loading">
            <span className="spinner" />
          </div>
        ) : (
          meals &&
          (meals.length === 0 ? (
            !adding && <p className="empty muted">Nothing logged for this day yet.</p>
          ) : (
            <ul className="meal-entries">
              {meals.map((m) => (
                <MealRow
                  key={`${m.id}:${m.text}:${m.time}:${m.kcal}:${m.protein}`}
                  meal={m}
                  onSaved={(saved) => change((list) => sortByTime(list.map((x) => (x.id === saved.id ? saved : x))))}
                  onDeleted={(id) => change((list) => list.filter((x) => x.id !== id))}
                />
              ))}
            </ul>
          ))
        )}
      </div>
      <p className="muted small">
        Write it the way you&apos;d say it; amounts help (&ldquo;2 cups rice&rdquo;, &ldquo;150 g chicken&rdquo;). Numbers are
        estimates. Use &ldquo;Adjust&rdquo; on a meal when you know better.
      </p>
    </section>
  );
}

// Monday of the week a date falls in.
function mondayOf(date) {
  const day = new Date(`${date}T12:00:00`).getDay();
  return shiftDate(date, -((day + 6) % 7));
}

const WEEKS_SHOWN = 8;

// Day-by-day and week-by-week numbers from the food log.
function Analytics({ targets, version }) {
  const [today, setToday] = useState("");
  const [week, setWeek] = useState("");
  const [meals, setMeals] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = todayStr();
    setToday(t);
    setWeek((w) => w || mondayOf(t));
    api(`/api/admin/fitness/meals?from=${shiftDate(mondayOf(t), -7 * (WEEKS_SHOWN - 1))}&to=${t}`)
      .then((d) => setMeals(d.meals))
      .catch((err) => setError(err.message));
  }, [version]);

  if (error) return <p className="form-status err">{error}</p>;
  if (!meals || !week)
    return (
      <div className="inline-loading" role="status" aria-label="Loading analytics">
        <span className="spinner" />
      </div>
    );

  const byDay = new Map();
  for (const m of meals) byDay.set(m.date, [...(byDay.get(m.date) ?? []), m]);
  const dayStats = (date) => {
    const list = byDay.get(date) ?? [];
    return { date, count: list.length, ...totals(list) };
  };
  const weekStats = (monday) => {
    const days = Array.from({ length: 7 }, (_, i) => dayStats(shiftDate(monday, i)));
    const logged = days.filter((d) => d.count > 0);
    const avg = (k) => (logged.length ? logged.reduce((a, d) => a + d[k], 0) / logged.length : 0);
    return { monday, days, logged: logged.length, kcal: avg("kcal"), p: avg("p"), c: avg("c"), f: avg("f"), total: logged.reduce((a, d) => a + d.kcal, 0) };
  };

  const firstMonday = shiftDate(mondayOf(today), -7 * (WEEKS_SHOWN - 1));
  const current = weekStats(week);
  const allWeeks = Array.from({ length: WEEKS_SHOWN }, (_, i) => weekStats(shiftDate(firstMonday, 7 * i)))
    .filter((w) => w.logged > 0)
    .reverse();
  const loggedDays = [...byDay.keys()].map(dayStats);
  const overall = loggedDays.length
    ? { kcal: loggedDays.reduce((a, d) => a + d.kcal, 0) / loggedDays.length, p: loggedDays.reduce((a, d) => a + d.p, 0) / loggedDays.length }
    : null;
  const scale = Math.max(targets.kcal * 1.1, ...current.days.map((d) => d.kcal));
  const gap = current.logged ? current.kcal - targets.kcal : null;
  const weekLabel = `${prettyDate(week, { day: "numeric", month: "short" })} – ${prettyDate(shiftDate(week, 6), { day: "numeric", month: "short" })}`;

  return (
    <section className="fit-section">
      <h2 className="section-title">Analytics</h2>
      <div className="tile">
        <div className="prayer-head">
          <div>
            <p className="label">{week === mondayOf(today) ? "This week" : "Week"}</p>
            <p className="big">{weekLabel}</p>
          </div>
          <div className="day-nav">
            <button type="button" className="btn small" onClick={() => setWeek(shiftDate(week, -7))} disabled={week <= firstMonday} aria-label="Previous week">
              ←
            </button>
            <button type="button" className="btn small" onClick={() => setWeek(shiftDate(week, 7))} disabled={week >= mondayOf(today)} aria-label="Next week">
              →
            </button>
          </div>
        </div>

        <div className="macro-grid analytics-grid">
          <div className="macro-tile">
            <p className="label">Calories a day</p>
            <p className="macro-value">{current.logged ? fmt(current.kcal) : "–"}</p>
            <p className="muted small">
              {gap === null ? "Nothing logged" : `${gap < 0 ? fmt(-gap) + " below" : fmt(gap) + " above"} your ${fmt(targets.kcal)} target`}
            </p>
          </div>
          <div className="macro-tile">
            <p className="label">Protein a day</p>
            <p className="macro-value">{current.logged ? `${r(current.p)} g` : "–"}</p>
            <p className="muted small">Target {targets.protein} g</p>
          </div>
          <div className="macro-tile">
            <p className="label">Carbs · fat a day</p>
            <p className="macro-value">{current.logged ? `${r(current.c)} · ${r(current.f)} g` : "–"}</p>
            <p className="muted small">
              Targets {targets.carbs} · {targets.fat} g
            </p>
          </div>
          <div className="macro-tile">
            <p className="label">Days logged</p>
            <p className="macro-value">{current.logged} / 7</p>
            <p className="muted small">{fmt(current.total)} kcal in total</p>
          </div>
        </div>

        <p className="label">Day by day</p>
        <ul className="food-days">
          {current.days.map((d) => {
            const future = d.date > today;
            return (
              <li key={d.date} className={future ? "future" : ""}>
                <span className="small food-day-name">
                  {d.date === today ? "Today" : prettyDate(d.date, { weekday: "short", day: "numeric" })}
                </span>
                <span className="bar-track food-bar">
                  <span className={`bar ${d.kcal < targets.kcal * 0.8 ? "short" : ""}`} style={{ width: `${(d.kcal / scale) * 100}%` }} />
                  <span className="target-mark" style={{ left: `${(targets.kcal / scale) * 100}%` }} aria-hidden="true" />
                </span>
                <span className="small food-day-num">
                  {d.count ? (
                    <>
                      <strong>{fmt(d.kcal)}</strong> kcal · {r(d.p)} g P
                    </>
                  ) : (
                    <span className="muted">{future ? "" : "Not logged"}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="muted small">
          The line on each bar is your daily target. Bars turn amber below 80% of it. Averages count only the days you logged.
        </p>
      </div>

      {allWeeks.length > 0 && (
        <div className="tile">
          <p className="label">Week by week</p>
          <ul className="food-weeks">
            {allWeeks.map((w) => (
              <li key={w.monday}>
                <button type="button" className={`food-week${w.monday === week ? " on" : ""}`} onClick={() => setWeek(w.monday)}>
                  <span className="small">{prettyDate(w.monday, { day: "numeric", month: "short" })}</span>
                  <span className="small">
                    <strong>{fmt(w.kcal)}</strong> kcal · {r(w.p)} g P
                  </span>
                  <span className="muted small">{w.logged} days</span>
                </button>
              </li>
            ))}
          </ul>
          {overall && (
            <p className="small">
              Since you started logging: <strong>{fmt(overall.kcal)} kcal</strong> and <strong>{r(overall.p)} g protein</strong> a day on average,
              over {loggedDays.length} days.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default function FoodTab({ profile }) {
  const targets = nutritionTargets(profile);
  const [version, setVersion] = useState(0);
  return (
    <>
      <FoodLog targets={targets} onChanged={() => setVersion((v) => v + 1)} />
      <Analytics targets={targets} version={version} />
      <Targets profile={profile} />
      <ExampleDay />
    </>
  );
}
