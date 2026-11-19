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
        Photos on your public Photography page. Title, date and description are optional; the tick on a photo puts it
        on the home page, and &ldquo;Album&rdquo; moves it into a trip.
      </p>
      <PhotoManager albums={albums} />
    </>
  );
}
