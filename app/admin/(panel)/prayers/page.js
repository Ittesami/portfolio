import { redirect } from "next/navigation";
import { DAILY_APP_URL } from "@/lib/daily-app";

// Moved to the Daily app. The old page is kept below, commented out.
export default function MovedToDaily() {
  redirect(`${DAILY_APP_URL}/prayers`);
}

/*
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
*/
