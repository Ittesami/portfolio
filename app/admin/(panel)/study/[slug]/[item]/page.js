import { redirect } from "next/navigation";
import { DAILY_APP_URL } from "@/lib/daily-app";

// Moved to the Daily app. The old page is kept below, commented out.
export default async function MovedToDaily({ params }) {
  const { slug, item } = await params;
  redirect(`${DAILY_APP_URL}/study/${encodeURIComponent(slug)}/${encodeURIComponent(item)}`);
}

/*
import LessonView from "@/components/admin/study/LessonView";

export const metadata = { title: "Lesson · Study" };

export default async function LessonPage({ params }) {
  const { slug, item } = await params;
  return <LessonView slug={slug} itemId={item} />;
}
*/
