import TeachingTracker from "@/components/admin/teaching/TeachingTracker";

export const metadata = { title: "Teaching · Daily" };

export default function TeachingPage() {
  return (
    <>
      <h1 className="page-title small-title">Teaching</h1>
      <p className="muted page-intro">Your students and weekly classes. Mark each class as attended, cancelled or rescheduled, and note what you taught.</p>
      <TeachingTracker />
    </>
  );
}
