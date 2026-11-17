import CourseView from "@/components/admin/study/CourseView";

export const metadata = { title: "Study · Daily" };

export default async function CoursePage({ params }) {
  const { slug } = await params;
  return <CourseView slug={slug} />;
}
