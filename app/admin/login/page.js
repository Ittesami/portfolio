import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { isLoggedIn } from "@/lib/auth";

export const metadata = { title: "Log in · Daily" };

export default async function LoginPage() {
  if (await isLoggedIn()) redirect("/admin");
  return (
    <div className="wrap login-wrap">
      <div className="tile login-card">
        <p className="kicker">Private</p>
        <h1 className="page-title small-title">Log in</h1>
        <p className="muted">Your to-dos, prayers, fitness and photos.</p>
        <LoginForm />
      </div>
    </div>
  );
}
