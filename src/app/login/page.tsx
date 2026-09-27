import { validateSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const session = await validateSession();

  if (session) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
