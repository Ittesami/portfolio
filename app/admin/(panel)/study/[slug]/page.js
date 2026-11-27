import { redirect } from "next/navigation";
import { DAILY_APP_URL } from "@/lib/daily-app";

// Moved to the Daily app. The old page is kept below, commented out.
export default async function MovedToDaily({ params }) {
  const { slug } = await params;
  redirect(`${DAILY_APP_URL}/study/${encodeURIComponent(slug)}`);
}

/*
import CourseView from "@/components/admin/study/CourseView";

export const metadata = { title: "Study · Daily" };

export default async function CoursePage({ params }) {
  const { slug } = await params;
  return <CourseView slug={slug} />;
}
*/
