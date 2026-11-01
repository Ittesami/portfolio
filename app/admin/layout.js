// Everything under /admin is private: keep it out of search engines.
export const metadata = {
  title: "Daily · Ittehad Rahman",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return children;
}
