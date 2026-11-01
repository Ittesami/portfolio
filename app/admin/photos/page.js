import PhotoAdmin from "@/components/PhotoAdmin";

export const metadata = {
  title: "Photo admin · Ittehad Rahman",
  robots: { index: false, follow: false },
};

export default function PhotoAdminPage() {
  return (
    <div className="wrap">
      <header className="block-head photos-head">
        <p className="kicker">Admin</p>
        <h1 className="page-title">Photo details</h1>
        <p className="muted">
          Add photos by putting them in <code>public/photos</code>. Here you can give each one an optional title, date and
          description. Changes show on the site straight away.
        </p>
      </header>
      <PhotoAdmin />
    </div>
  );
}
