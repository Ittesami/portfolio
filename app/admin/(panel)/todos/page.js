import TodoList from "@/components/admin/TodoList";

export const metadata = { title: "To-do · Daily" };

export default function TodosPage() {
  return (
    <>
      <h1 className="page-title small-title">To-do</h1>
      <div className="tile">
        <TodoList />
      </div>
    </>
  );
}
