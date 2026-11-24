import { redirect } from "next/navigation";
import { DAILY_APP_URL } from "@/lib/daily-app";

// Moved to the Daily app. The old page is kept below, commented out.
export default function MovedToDaily() {
  redirect(`${DAILY_APP_URL}/todos`);
}

/*
import TodoList from "@/components/admin/TodoList";

export const metadata = { title: "To-do · Daily" };

export default function TodosPage() {
  return (
    <>
      <h1 className="page-title small-title">To-do</h1>
      <p className="muted page-intro">Everything you need to do, with a date when it matters.</p>
      <div className="tile">
        <TodoList />
      </div>
    </>
  );
}
*/
