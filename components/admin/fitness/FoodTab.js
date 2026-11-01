"use client";

import { useCallback, useEffect, useState } from "react";
import { api, nowHHMM, prettyDate, shiftDate, todayStr } from "../api";
import Spinner from "../Spinner";
import { MEAL_PLAN, describeItem, mealMacros, nutritionTargets, planMacros } from "@/lib/nutrition";

const r = (n) => Math.round(n);

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

function MealForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial);
  const [state, setState] = useState({ busy: false, error: "" });

  async function submit(e) {
    e.preventDefault();
    if (!form.text.trim()) return setState({ busy: false, error: "Write what you had." });
    setState({ busy: true, error: "" });
    try {
      await onSubmit(form);
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
          <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} required />
        </label>
        <label>
          What you had
          <textarea
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            maxLength={1000}
            placeholder="2 cups rice, chicken curry, 1 glass of milk"
            autoFocus
          />
        </label>
      </div>
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
          initial={{ time: meal.time, text: meal.text }}
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
      <p className="meal-text">{meal.text}</p>
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

function FoodLog() {
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

        {adding && (
          <MealForm
            key={date}
            initial={{ time: date === today ? nowHHMM() : "13:00", text: "" }}
            submitLabel="Add"
            onCancel={() => setAdding(false)}
            onSubmit={async (form) => {
              const { meal } = await api("/api/admin/fitness/meals", { method: "POST", body: { ...form, date } });
              setMeals((list) => sortByTime([...(list ?? []), meal]));
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
                  key={m.id}
                  meal={m}
                  onSaved={(saved) => setMeals((list) => sortByTime(list.map((x) => (x.id === saved.id ? saved : x))))}
                  onDeleted={(id) => setMeals((list) => list.filter((x) => x.id !== id))}
                />
              ))}
            </ul>
          ))
        )}
      </div>
      <p className="muted small">Write it the way you&apos;d say it. Claude reads this log when it plans your next week.</p>
    </section>
  );
}

export default function FoodTab({ profile }) {
  return (
    <>
      <FoodLog />
      <Targets profile={profile} />
      <ExampleDay />
    </>
  );
}
