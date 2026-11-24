import { redirect } from "next/navigation";
import { DAILY_APP_URL } from "@/lib/daily-app";

// Moved to the Daily app. The old page is kept below, commented out.
export default function MovedToDaily() {
  redirect(`${DAILY_APP_URL}/fitness`);
}

/*
import FitnessTracker from "@/components/admin/fitness/FitnessTracker";

export const metadata = { title: "Fitness · Daily" };

export default function FitnessPage() {
  return (
    <>
      <h1 className="page-title small-title">Fitness</h1>
      <p className="muted page-intro">Your plan, workouts, food and sleep in one place.</p>
      <FitnessTracker />
    </>
  );
}
*/
