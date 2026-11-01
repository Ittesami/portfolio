import PhotoManager from "@/components/admin/PhotoManager";
import { getAlbums } from "@/lib/travel";

export const metadata = { title: "Photos · Daily" };
export const dynamic = "force-dynamic";

export default async function PhotosAdminPage() {
  const albums = (await getAlbums()).map(({ slug, title }) => ({ slug, title }));
  return (
    <>
      <h1 className="page-title small-title">Photos</h1>
      <p className="muted page-intro">
        Photos for your public Photography page. Upload, edit, hide or delete them; title, date and description are all
        optional. To put a photo in a travel album, pick the trip under &ldquo;Album&rdquo; (or upload it from the
        Travel tab). Photos in the code&apos;s <code>public/photos</code> folder show here too.
      </p>
      <PhotoManager albums={albums} />
    </>
  );
}
