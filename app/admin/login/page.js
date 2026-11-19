import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { isLoggedIn } from "@/lib/auth";

export const metadata = { title: "Log in · Daily" };

export default async function LoginPage() {
  if (await isLoggedIn()) redirect("/admin");
  return (
    <div className="wrap admin login-wrap">
      <div className="tile login-card">
        <p className="mark" aria-hidden="true">
          Daily
          <i />
        </p>
        <h1 className="page-title small-title">Welcome back</h1>
        <p className="muted">Log in to your to-dos, prayers, fitness and study.</p>
        <LoginForm />
      </div>
    </div>
  );
}
