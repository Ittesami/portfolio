import "./daily.css";

// Everything under /admin is private: keep it out of search engines.
export const metadata = {
  title: "Daily · Ittehad Rahman",
  robots: { index: false, follow: false },
  // "Add to Home Screen" installs Daily with your photo as its icon.
  manifest: "/daily.webmanifest",
  appleWebApp: { capable: true, title: "Daily", statusBarStyle: "default" },
};

export default function AdminRootLayout({ children }) {
  return children;
}
