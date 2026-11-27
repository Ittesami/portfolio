import { redirect } from "next/navigation";
import { DAILY_APP_URL } from "@/lib/daily-app";

// Moved to the Daily app. The old page is kept below, commented out.
export default async function MovedToDaily() {
  redirect(`${DAILY_APP_URL}/study`);
}

/*
import StudyOverview from "@/components/admin/study/StudyOverview";

export const metadata = { title: "Study · Daily" };

export default function StudyPage() {
  return (
    <>
      <h1 className="page-title small-title">Study</h1>
      <p className="muted page-intro">Your courses and how far you are in each. Tick things off as you go.</p>
      <StudyOverview />
    </>
  );
}
*/
