"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "./Spinner";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [state, setState] = useState({ busy: false, error: "" });

  async function submit(e) {
    e.preventDefault();
    if (!password) return setState({ busy: false, error: "Enter your password." });
    setState({ busy: true, error: "" });
    let res;
    try {
      res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
    } catch {
      return setState({ busy: false, error: "Couldn't reach the server. Check your connection." });
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setState({ busy: false, error: data.error || "Couldn't log in." });
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form className="form login-form" onSubmit={submit}>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (state.error) setState({ busy: false, error: "" });
          }}
          autoComplete="current-password"
          autoFocus
        />
      </label>
      <button className="btn primary" type="submit" disabled={state.busy} aria-busy={state.busy}>
        {state.busy && <Spinner />}
        {state.busy ? "Logging in…" : "Log in"}
      </button>
      {state.error && (
        <p className="form-status err" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
