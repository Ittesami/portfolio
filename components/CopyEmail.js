"use client";

import { useRef, useState } from "react";

export default function CopyEmail({ email }) {
  const codeRef = useRef(null);
  const [label, setLabel] = useState("Copy email");

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setLabel("Copied");
    } catch {
      const range = document.createRange();
      range.selectNodeContents(codeRef.current);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      setLabel("Selected, press Ctrl+C");
    }
    setTimeout(() => setLabel("Copy email"), 2200);
  }

  return (
    <div className="mail">
      <code ref={codeRef}>{email}</code>
      <button className="btn primary" type="button" onClick={copy}>
        {label}
      </button>
    </div>
  );
}
