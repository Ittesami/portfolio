"use client";

import Link, { useLinkStatus } from "next/link";

// Shows a spinner inside the link from click until the next page has loaded.
function Pending() {
  const { pending } = useLinkStatus();
  return pending ? <span className="spinner" role="status" aria-label="Loading" /> : null;
}

export default function LoadingLink({ children, ...props }) {
  return (
    <Link {...props}>
      {children}
      <Pending />
    </Link>
  );
}
