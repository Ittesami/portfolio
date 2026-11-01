"use client";

import { useState } from "react";
import { api } from "../api";
import Spinner from "../Spinner";
import ExercisePicker from "./ExercisePicker";

const emptySet = (type, prev) =>
  type === "timed"
    ? { min: prev?.min ?? "", sec: prev?.sec ?? "", distance: "" }
    : { reps: prev?.reps ?? "", weight: prev?.weight ?? "" };

// Converts a stored workout into editable form state.
export function workoutToDraft(w) {
  return {
    id: w.id,
    date: w.date,
    notes: w.notes ?? "",
    entries: w.entries.map((e) => ({
      key: `${e.exerciseId}-${Math.random()}`,
      exerciseId: e.exerciseId,
      name: e.name,
      type: e.type,
      sets: e.sets.map((s) =>
        e.type === "timed"
          ? { min: String(Math.floor(s.seconds / 60)), sec: String(s.seconds % 60), distance: s.distance ?? "" }
          : { reps: String(s.reps), weight: s.weight ?? "" },
      ),
    })),
  };
}

// Pre-fills the logger from a planned day: its exercises, set counts and any
// load written as a number of kg.
export function planDayToDraft(day, library) {
  const byId = new Map(library.map((e) => [e.id, e]));
  return {
    id: null,
    date: day.date,
    notes: "",
    entries: day.exercises
      .filter((x) => byId.has(x.exerciseId))
      .map((x) => {
        const ex = byId.get(x.exerciseId);
        const kg = /^(\d+(?:\.\d+)?)\s*kg$/i.exec(x.load?.trim() ?? "")?.[1] ?? "";
        return {
          key: `${ex.id}-${Math.random()}`,
          exerciseId: ex.id,
          name: ex.name,
          type: ex.type,
          sets: Array.from({ length: Math.max(1, Math.min(x.sets, 10)) }, () =>
            ex.type === "timed" ? emptySet("timed") : { reps: "", weight: kg },
          ),
        };
      }),
  };
}

export default function WorkoutLogger({ draft, setDraft, library, onLibraryChange, onSaved, onCancel }) {
  const [picking, setPicking] = useState(draft.entries.length === 0);
  const [state, setState] = useState({ busy: false, error: "" });

  const update = (fn) => setDraft((d) => fn(structuredClone(d)));
  const setField = (i, j, k) => (e) =>
    update((d) => {
      d.entries[i].sets[j][k] = e.target.value;
      return d;
    });

  function addExercise(ex) {
    update((d) => {
      d.entries.push({
        key: `${ex.id}-${Math.random()}`,
        exerciseId: ex.id,
        name: ex.name,
        type: ex.type,
        sets: ex.type === "timed" ? [emptySet("timed")] : [emptySet("strength"), emptySet("strength"), emptySet("strength")],
      });
      return d;
    });
    setPicking(false);
  }

  async function save(e) {
    e.preventDefault();
    if (!draft.entries.length) return setState({ busy: false, error: "Add at least one exercise." });
    const entries = draft.entries.map((en) => ({
      exerciseId: en.exerciseId,
      sets: en.sets
        .filter((s) => (en.type === "timed" ? s.min !== "" || s.sec !== "" : s.reps !== ""))
        .map((s) =>
          en.type === "timed"
            ? { seconds: Number(s.min || 0) * 60 + Number(s.sec || 0), distance: s.distance === "" ? null : Number(s.distance) }
            : { reps: Number(s.reps), weight: s.weight === "" ? null : Number(s.weight) },
        ),
    }));
    const empty = draft.entries.find((en, i) => entries[i].sets.length === 0);
    if (empty) return setState({ busy: false, error: `Fill in at least one set for ${empty.name}, or remove it.` });

    setState({ busy: true, error: "" });
    try {
      const body = { date: draft.date, notes: draft.notes, entries };
      const { workout } = draft.id
        ? await api(`/api/admin/fitness/workouts/${draft.id}`, { method: "PUT", body })
        : await api("/api/admin/fitness/workouts", { method: "POST", body });
      setState({ busy: false, error: "" });
      onSaved(workout);
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  }

  return (
    <form className="form logger" onSubmit={save}>
      <div className="row">
        <label>
          Date
          <input
            type="date"
            value={draft.date}
            onChange={(e) => update((d) => ({ ...d, date: e.target.value }))}
            required
          />
        </label>
      </div>

      {draft.entries.map((en, i) => (
        <fieldset key={en.key} className="entry">
          <legend>
            <strong>{en.name}</strong>
            <button
              type="button"
              className="text-btn"
              onClick={() =>
                update((d) => {
                  d.entries.splice(i, 1);
                  return d;
                })
              }
            >
              Remove
            </button>
          </legend>
          <div className={`set-grid ${en.type}`}>
            <span className="set-head">Set</span>
            {en.type === "timed" ? (
              <>
                <span className="set-head">Min</span>
                <span className="set-head">Sec</span>
                <span className="set-head">Km (optional)</span>
              </>
            ) : (
              <>
                <span className="set-head">Reps</span>
                <span className="set-head">Kg (optional)</span>
              </>
            )}
            <span />
            {en.sets.map((s, j) => (
              <div className="set-row" key={j}>
                <span className="set-no">{j + 1}</span>
                {en.type === "timed" ? (
                  <>
                    <input type="number" inputMode="numeric" min="0" value={s.min} onChange={setField(i, j, "min")} aria-label={`Set ${j + 1} minutes`} />
                    <input type="number" inputMode="numeric" min="0" max="59" value={s.sec} onChange={setField(i, j, "sec")} aria-label={`Set ${j + 1} seconds`} />
                    <input type="number" inputMode="decimal" min="0" step="0.01" value={s.distance} onChange={setField(i, j, "distance")} aria-label={`Set ${j + 1} distance in km`} />
                  </>
                ) : (
                  <>
                    <input type="number" inputMode="numeric" min="1" value={s.reps} onChange={setField(i, j, "reps")} aria-label={`Set ${j + 1} reps`} />
                    <input type="number" inputMode="decimal" min="0" step="0.5" value={s.weight} onChange={setField(i, j, "weight")} aria-label={`Set ${j + 1} kg`} />
                  </>
                )}
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Remove set ${j + 1}`}
                  onClick={() =>
                    update((d) => {
                      d.entries[i].sets.splice(j, 1);
                      return d;
                    })
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="text-btn"
            onClick={() =>
              update((d) => {
                const sets = d.entries[i].sets;
                sets.push(emptySet(en.type, sets[sets.length - 1]));
                return d;
              })
            }
          >
            + Add set
          </button>
        </fieldset>
      ))}

      {picking ? (
        <div className="tile picker-tile">
          <ExercisePicker library={library} onPick={addExercise} onLibraryChange={onLibraryChange} />
          {draft.entries.length > 0 && (
            <button type="button" className="text-btn" onClick={() => setPicking(false)}>
              Close
            </button>
          )}
        </div>
      ) : (
        <button type="button" className="btn" onClick={() => setPicking(true)}>
          + Add exercise
        </button>
      )}

      <label>
        Notes <span className="opt">optional</span>
        <textarea
          value={draft.notes}
          onChange={(e) => update((d) => ({ ...d, notes: e.target.value }))}
          maxLength={2000}
          placeholder="How it felt, anything that hurt, what to change"
        />
      </label>

      <div className="form-foot">
        <button className="btn primary" type="submit" disabled={state.busy} aria-busy={state.busy}>
          {state.busy && <Spinner />}
          {state.busy ? "Saving…" : draft.id ? "Save changes" : "Save workout"}
        </button>
        <button className="btn" type="button" onClick={onCancel}>
          Cancel
        </button>
        {state.error && <p className="form-status err">{state.error}</p>}
      </div>
    </form>
  );
}
