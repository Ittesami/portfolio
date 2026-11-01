"use client";

import { useMemo, useState } from "react";
import { api } from "../api";
import Spinner from "../Spinner";

function NewExerciseForm({ initialName, categories, equipment, onCreated, onCancel }) {
  const [form, setForm] = useState({ name: initialName, category: "", equipment: "Other", type: "strength" });
  const [state, setState] = useState({ busy: false, error: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    if (!form.name.trim()) return setState({ busy: false, error: "Give the exercise a name." });
    if (!form.category) return setState({ busy: false, error: "Pick a muscle group." });
    setState({ busy: true, error: "" });
    try {
      const { exercise } = await api("/api/admin/fitness/exercises", { method: "POST", body: form });
      onCreated(exercise);
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  }

  return (
    <form className="form new-exercise" onSubmit={save}>
      <p className="label">New exercise</p>
      <label>
        Name
        <input value={form.name} onChange={set("name")} maxLength={80} placeholder="Cable Y-raise" />
      </label>
      <div className="row">
        <label>
          Muscle group
          <select value={form.category} onChange={set("category")}>
            <option value="">Choose…</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Equipment
          <select value={form.equipment} onChange={set("equipment")}>
            {equipment.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <fieldset className="radio-row">
        <legend>How do you log it?</legend>
        <label>
          <input type="radio" name="type" value="strength" checked={form.type === "strength"} onChange={set("type")} /> Sets
          and reps
        </label>
        <label>
          <input type="radio" name="type" value="timed" checked={form.type === "timed"} onChange={set("type")} /> Time
          (and distance)
        </label>
      </fieldset>
      <div className="form-foot">
        <button className="btn primary" type="submit" disabled={state.busy} aria-busy={state.busy}>
          {state.busy && <Spinner />}
          {state.busy ? "Adding…" : "Add to library"}
        </button>
        <button className="btn" type="button" onClick={onCancel}>
          Cancel
        </button>
        {state.error && <p className="form-status err">{state.error}</p>}
      </div>
    </form>
  );
}

export default function ExercisePicker({ library, onPick, onLibraryChange }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [creating, setCreating] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return library.exercises
      .filter((e) => (!category || e.category === category) && (!q || e.name.toLowerCase().includes(q)))
      .slice(0, 40);
  }, [library.exercises, query, category]);

  if (creating) {
    return (
      <NewExerciseForm
        initialName={query}
        categories={library.categories}
        equipment={library.equipment}
        onCancel={() => setCreating(false)}
        onCreated={(ex) => {
          onLibraryChange([...library.exercises, ex].sort((a, b) => a.name.localeCompare(b.name)));
          onPick(ex);
          setCreating(false);
          setQuery("");
        }}
      />
    );
  }

  return (
    <div className="picker">
      <div className="picker-controls">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises"
          aria-label="Search exercises"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Muscle group">
          <option value="">All muscle groups</option>
          {library.categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <ul className="picker-list" role="listbox" aria-label="Exercises">
        {results.map((e) => (
          <li key={e.id}>
            <button type="button" onClick={() => onPick(e)}>
              <span>{e.name}</span>
              <span className="muted small">
                {e.category} · {e.equipment}
                {e.type === "timed" ? " · timed" : ""}
                {e.custom ? " · yours" : ""}
              </span>
            </button>
          </li>
        ))}
        {results.length === 0 && <li className="muted small picker-empty">No matches.</li>}
      </ul>
      <button type="button" className="text-btn" onClick={() => setCreating(true)}>
        + Can't find it? Add a new exercise
      </button>
    </div>
  );
}
