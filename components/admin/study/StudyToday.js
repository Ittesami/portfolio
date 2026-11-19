"use client";

import { useEffect, useState } from "react";
import LoadingLink from "@/components/LoadingLink";
import Icon from "@/components/Icon";
import { api } from "../api";

// Today page card: the next thing to do in the course you're furthest into.
export default function StudyToday() {
  const [state, setState] = useState({ loading: true, course: null, error: "" });

  useEffect(() => {
    api("/api/admin/study")
      .then((d) => {
        // The course you've started and not finished, with the most done; else the first.
        const active = d.courses.filter((c) => c.next && c.done > 0).sort((a, b) => b.done / b.total - a.done / a.total)[0];
        setState({ loading: false, course: active ?? d.courses.find((c) => c.next) ?? null, error: "" });
      })
      .catch((err) => setState({ loading: false, course: null, error: err.message }));
  }, []);

  const { loading, course, error } = state;
  const pct = course?.total ? Math.round((course.done / course.total) * 100) : 0;

  return (
    <LoadingLink className="tile link-tile dash-card" href={course ? `/admin/study/${course.slug}` : "/admin/study"}>
      <Icon name="book" />
      <p className="label">Study next</p>
      {loading ? (
        <span className="spinner" role="status" aria-label="Loading" />
      ) : error ? (
        <p role="status" className="form-status err">
          {error}
        </p>
      ) : !course ? (
        <p className="muted">Everything's done. Add a new course in Study.</p>
      ) : (
        <>
          <p className="big">{course.next.title}</p>
          <p className="muted small">
            {course.title} · {course.done}/{course.total} done
          </p>
          <span className="bar-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${course.title} progress`}>
            <span className="bar" style={{ width: `${pct}%` }} />
          </span>
        </>
      )}
    </LoadingLink>
  );
}
