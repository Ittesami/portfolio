// Small stroke icon set, drawn on a 24px grid and inheriting the text colour.
const PATHS = {
  arrow: <path d="M7 17 17 7M8 7h9v9" />,
  back: <path d="M19 12H5m6-6-6 6 6 6" />,
  pin: (
    <>
      <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  camera: (
    <>
      <path d="M3 8h4l2-3h6l2 3h4v12H3z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  book: <path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3.5 3.5 3.5 14.5 0 18M12 3c-3.5 3.5-3.5 14.5 0 18" />
    </>
  ),
  paddle: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="m14.5 14.5 5.5 5.5" />
      <circle cx="19" cy="5" r="1.6" />
    </>
  ),
  gamepad: (
    <>
      <path d="M6 9h12a4 4 0 0 1 3.8 5.3l-1 3a2 2 0 0 1-3.4.6L15 16H9l-2.4 1.9a2 2 0 0 1-3.4-.6l-1-3A4 4 0 0 1 6 9z" />
      <path d="M8 11.5v3M6.5 13h3" />
      <circle cx="15.5" cy="12" r=".6" />
      <circle cx="17.5" cy="14" r=".6" />
    </>
  ),
  download: <path d="M12 4v11m-5-5 5 5 5-5M5 20h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  code: <path d="m8 8-4 4 4 4m8-8 4 4-4 4" />,
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5h6v2M3 12h18" />
    </>
  ),
  cap: <path d="m2 9 10-5 10 5-10 5zm4 2v5c3 2 9 2 12 0v-5" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" />
    </>
  ),
  // Daily (admin) navigation
  home: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />,
  list: <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />,
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  dumbbell: <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />,
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.3" />
      <circle cx="12" cy="12" r="1.3" />
      <circle cx="18.5" cy="12" r="1.3" />
    </>
  ),
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  logout: <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l-4-4 4-4M6 12h10" />,
};

export default function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="icon"
    >
      {PATHS[name]}
    </svg>
  );
}
