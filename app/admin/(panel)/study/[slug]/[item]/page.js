import LessonView from "@/components/admin/study/LessonView";

export const metadata = { title: "Lesson · Study" };

export default async function LessonPage({ params }) {
  const { slug, item } = await params;
  return <LessonView slug={slug} itemId={item} />;
}
