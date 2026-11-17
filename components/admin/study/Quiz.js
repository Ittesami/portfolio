"use client";

import { useEffect, useState } from "react";
import { api } from "../api";
import Spinner from "../Spinner";

// An in-app practice quiz. Questions arrive without answers; the server marks them.
export default function Quiz({ slug, item, onDone, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    setData(null);
    setAnswers({});
    setResult(null);
    setError("");
    api(`/api/admin/study/${slug}/quiz?item=${encodeURIComponent(item.id)}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [slug, item.id, round]);

  if (error) return <p className="form-status err">{error}</p>;
  if (!data)
    return (
      <div className="inline-loading" role="status" aria-label="Loading questions">
        <span className="spinner" />
      </div>
    );

  const answered = data.questions.filter((q) => (answers[q.id]?.length ?? 0) === q.pick).length;
  const byId = result ? Object.fromEntries(result.results.map((r) => [r.id, r])) : {};

  function choose(q, key) {
    if (result) return;
    setAnswers((a) => {
      const cur = a[q.id] ?? [];
      if (q.pick === 1) return { ...a, [q.id]: [key] };
      const next = cur.includes(key) ? cur.filter((k) => k !== key) : cur.length < q.pick ? [...cur, key] : cur;
      return { ...a, [q.id]: next };
    });
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      // Every question is sent, so a blank counts as wrong, as in the real exam.
      const all = Object.fromEntries(data.questions.map((q) => [q.id, answers[q.id] ?? []]));
      const r = await api(`/api/admin/study/${slug}/quiz`, { method: "POST", body: { item: item.id, answers: all } });
      setResult(r);
      onDone(r.progress);
      requestAnimationFrame(() => document.getElementById(`quiz-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="quiz" id={`quiz-${item.id}`}>
      {result ? (
        <div className={`quiz-result ${result.score >= result.pass ? "pass" : "fail"}`}>
          <p className="macro-value">
            {result.correct} / {result.total} · {result.score}%
          </p>
          <p className="small">
            {result.score >= result.pass
              ? `Passed (${result.pass}%+). Review any you got wrong below.`
              : `Aim for ${result.pass}%+. Reread the notes for the ones you missed, then try again.`}
          </p>
          {result.tips.map((t) => (
            <p key={t.module} className="small">
              <strong>Module {t.module}:</strong> {t.tip}
            </p>
          ))}
        </div>
      ) : (
        data.attempts.length > 0 && (
          <p className="muted small">
            Last attempts: {data.attempts.map((a) => `${Math.round((a.correct / a.total) * 100)}%`).join(", ")}
          </p>
        )
      )}

      <ol className="quiz-questions">
        {data.questions.map((q) => {
          const r = byId[q.id];
          return (
            <li key={q.id} className={r ? (r.correct ? "right" : "wrong") : ""}>
              <p className="quiz-stem">
                {q.stem}
                {q.pick > 1 && !/choose/i.test(q.stem) && <span className="muted"> (Choose {q.pick}.)</span>}
              </p>
              <div className="quiz-options" role={q.pick === 1 ? "radiogroup" : "group"}>
                {q.options.map((o) => {
                  const picked = (answers[q.id] ?? []).includes(o.key);
                  const isAnswer = r?.answer.includes(o.key);
                  return (
                    <button
                      key={o.key}
                      type="button"
                      role={q.pick === 1 ? "radio" : "checkbox"}
                      aria-checked={picked}
                      disabled={Boolean(result)}
                      className={`quiz-option${picked ? " picked" : ""}${r && isAnswer ? " answer" : ""}${r && picked && !isAnswer ? " missed" : ""}`}
                      onClick={() => choose(q, o.key)}
                    >
                      <span className="quiz-key">{o.key}</span>
                      <span>{o.text}</span>
                    </button>
                  );
                })}
              </div>
              {r && !r.correct && <p className="small quiz-correct">Answer: {r.answer.join(", ")}</p>}
            </li>
          );
        })}
      </ol>

      <div className="form-foot quiz-foot">
        {result ? (
          <button type="button" className="btn primary" onClick={() => setRound((n) => n + 1)}>
            {item.quiz?.random ? "New set of questions" : "Try again"}
          </button>
        ) : (
          <button type="button" className="btn primary" disabled={busy || answered === 0} aria-busy={busy} onClick={submit}>
            {busy && <Spinner />} Submit ({answered}/{data.questions.length} answered)
          </button>
        )}
        <button type="button" className="btn" onClick={onClose}>
          Close
        </button>
        {error && <p className="form-status err">{error}</p>}
      </div>
    </div>
  );
}
