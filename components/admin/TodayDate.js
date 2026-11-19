"use client";

import { useEffect, useState } from "react";

// The date in your own time zone (rendered in the browser, so it never shows the
// server's date around midnight).
export default function TodayDate() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    setLabel(new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }));
  }, []);
  return <p className="page-date">{label || " "}</p>;
}
