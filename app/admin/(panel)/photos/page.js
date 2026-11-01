import PhotoManager from "@/components/admin/PhotoManager";

export const metadata = { title: "Photos · Daily" };

export default function PhotosAdminPage() {
  return (
    <>
      <h1 className="page-title small-title">Photos</h1>
      <p className="muted page-intro">
        Upload, edit, hide or delete the photos on your public Photography page. Title, date and description are all
        optional. Photos in the code's <code>public/photos</code> folder show here too.
      </p>
      <PhotoManager />
    </>
  );
}
