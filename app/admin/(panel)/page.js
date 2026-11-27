// To-do, Prayers, Fitness and Study moved to the Daily app; their sections are commented out below.
// import TodoList from "@/components/admin/TodoList";
// import PrayerTracker from "@/components/admin/PrayerTracker";
// import FitnessToday from "@/components/admin/fitness/FitnessToday";
// import StudyToday from "@/components/admin/study/StudyToday";
import TodayDate from "@/components/admin/TodayDate";
import TeachingToday from "@/components/admin/teaching/TeachingToday";
import { DAILY_APP_URL } from "@/lib/daily-app";

export const metadata = { title: "Today · Daily" };

// Today's classes. Prayers, to-dos, training and study are in the Daily app.
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
        {/*
        <div className="dash-col">
          <section aria-labelledby="today-prayers">
            <h2 id="today-prayers" className="section-title">
              Prayers
            </h2>
            <PrayerTracker compact />
          </section>
        </div>
        */}
        <div className="dash-col">
          {/*
          <section aria-labelledby="today-todos">
            <h2 id="today-todos" className="section-title">
              Due today
            </h2>
            <div className="tile">
              <TodoList compact />
            </div>
          </section>
          */}
          <section aria-labelledby="today-next" className="dash-col">
            <h2 id="today-next" className="section-title">
              Classes
            </h2>
            <TeachingToday />
            {/* <FitnessToday /> */}
            {/* <StudyToday /> */}
          </section>
        </div>
        <div className="dash-col">
          <section aria-labelledby="today-daily">
            <h2 id="today-daily" className="section-title">
              Prayers, to-dos, fitness and study
            </h2>
            <a className="tile link-tile dash-card" href={DAILY_APP_URL} target="_blank" rel="noopener noreferrer">
              <strong>Open the Daily app</strong>
              <span className="muted">Prayers, to-dos, workouts, food, sleep and your courses now live there.</span>
            </a>
          </section>
        </div>
      </div>
    </>
  );
}
