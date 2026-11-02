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
