import TodoList from "@/components/admin/TodoList";
import PrayerTracker from "@/components/admin/PrayerTracker";
import FitnessToday from "@/components/admin/fitness/FitnessToday";
import StudyToday from "@/components/admin/study/StudyToday";
import TodayDate from "@/components/admin/TodayDate";

export const metadata = { title: "Today · Daily" };

// Ordered by how time-sensitive things are: prayers, then what's due, then training and study.
export default function TodayPage() {
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title small-title">Today</h1>
          <TodayDate />
        </div>
      </div>
      <div className="dash">
        <div className="dash-col">
          <section aria-labelledby="today-prayers">
            <h2 id="today-prayers" className="section-title">
              Prayers
            </h2>
            <PrayerTracker compact />
          </section>
        </div>
        <div className="dash-col">
          <section aria-labelledby="today-todos">
            <h2 id="today-todos" className="section-title">
              Due today
            </h2>
            <div className="tile">
              <TodoList compact />
            </div>
          </section>
          <section aria-labelledby="today-next" className="dash-col">
            <h2 id="today-next" className="section-title">
              Training and study
            </h2>
            <FitnessToday />
            <StudyToday />
          </section>
        </div>
      </div>
    </>
  );
}
