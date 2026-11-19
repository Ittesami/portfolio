import PrayerTracker from "@/components/admin/PrayerTracker";

export const metadata = { title: "Prayers · Daily" };

export default function PrayersPage() {
  return (
    <>
      <h1 className="page-title small-title">Prayers</h1>
      <p className="muted page-intro">Today&apos;s times for your location, and how you&apos;re keeping up this week.</p>
      <PrayerTracker />
    </>
  );
}
