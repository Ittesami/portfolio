import AlbumManager from "@/components/admin/AlbumManager";

export const metadata = { title: "Travel · Daily" };

export default function TravelAdminPage() {
  return (
    <>
      <h1 className="page-title small-title">Travel</h1>
      <p className="muted page-intro">
        One album per trip, shown on your public Travel page. Each trip&apos;s country is also marked on the map
        automatically.
      </p>
      <div className="travel-admin">
        <AlbumManager />
      </div>
    </>
  );
}
