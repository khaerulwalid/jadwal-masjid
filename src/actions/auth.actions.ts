"use server";

import { loginSchema } from "@/lib/validation/auth";
import { AuthService } from "@/services/auth.service";
import { destroySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export async function loginAction(state: { error: string } | null, formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  const parsed = loginSchema.safeParse({ username, password });

  if (!parsed.success) {
    return {
      error: "Username atau password tidak valid.",
    };
  }

  try {
    await AuthService.login(parsed.data);
  } catch (error) {
    // Return generic error message from service
    return {
      error: error instanceof Error ? error.message : "Username atau password salah.",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
