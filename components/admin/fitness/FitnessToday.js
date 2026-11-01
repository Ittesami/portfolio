"use client";

import { useEffect, useState } from "react";
import LoadingLink from "@/components/LoadingLink";
import Icon from "@/components/Icon";
import { api, todayStr } from "../api";

// Today page card: what the plan says for today, and whether it's logged.
export default function FitnessToday() {
  const [state, setState] = useState({ loading: true, day: null, logged: false, error: "" });

  useEffect(() => {
    const today = todayStr();
    api(`/api/admin/fitness/overview?week=${today}`)
      .then((d) =>
        setState({
          loading: false,
          day: d.plan?.days.find((x) => x.date === today) ?? null,
          logged: d.weekWorkouts.some((w) => w.date === today),
          error: "",
        }),
      )
      .catch((err) => setState({ loading: false, day: null, logged: false, error: err.message }));
  }, []);

  const { loading, day, logged, error } = state;
  return (
    <LoadingLink className="tile link-tile fitness-today" href="/admin/fitness">
      <Icon name="target" />
      <p className="label">Fitness today</p>
      {loading ? (
        <span className="spinner" aria-label="Loading" />
      ) : error ? (
        <p className="form-status err">{error}</p>
      ) : !day ? (
        <p className="muted">No plan for this week yet. Open Fitness to get one.</p>
      ) : day.rest ? (
        <p>
          <strong>Rest day.</strong> <span className="muted">{day.focus}</span>
        </p>
      ) : (
        <p>
          <strong>{day.title}</strong> · {day.exercises.length} exercises
          {logged ? " · logged ✓" : ""}
          <span className="muted small"> · {day.exercises.map((x) => x.name).join(", ")}</span>
        </p>
      )}
    </LoadingLink>
  );
}
