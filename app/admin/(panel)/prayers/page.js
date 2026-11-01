import PrayerTracker from "@/components/admin/PrayerTracker";

export const metadata = { title: "Prayers · Daily" };

export default function PrayersPage() {
  return (
    <>
      <h1 className="page-title small-title">Prayers</h1>
      <PrayerTracker />
    </>
  );
}
