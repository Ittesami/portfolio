import TodoList from "@/components/admin/TodoList";
import PrayerTracker from "@/components/admin/PrayerTracker";
import FitnessToday from "@/components/admin/fitness/FitnessToday";

export const metadata = { title: "Today · Daily" };

export default function TodayPage() {
  return (
    <>
      <h1 className="page-title small-title">Today</h1>
      <div className="dash">
        <section className="dash-prayers">
          <h2 className="section-title">Prayers</h2>
          <PrayerTracker compact />
        </section>
        <section className="dash-todos">
          <h2 className="section-title">Due today</h2>
          <div className="tile">
            <TodoList compact />
          </div>
        </section>
        <section className="dash-fitness">
          <FitnessToday />
        </section>
      </div>
    </>
  );
}
