import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { isLoggedIn } from "@/lib/auth";

// Every panel page requires a login. The APIs check again on their own.
export default async function PanelLayout({ children }) {
  if (!(await isLoggedIn())) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
