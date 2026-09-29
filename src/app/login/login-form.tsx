"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth.actions";
import { useFormStatus } from "react-dom";
import { KeyRound, LogIn, MoonStar, Mosque, ShieldCheck, UserRound } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-950/20 transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
    >
      <LogIn className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
      {pending ? "Memproses..." : "Masuk"}
    </button>
  );
}

export default function LoginForm() {
  const [state, action] = useActionState(loginAction, null);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fbf4] text-slate-900">
      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(30deg, #047857 12%, transparent 12.5%, transparent 87%, #047857 87.5%, #047857), linear-gradient(150deg, #047857 12%, transparent 12.5%, transparent 87%, #047857 87.5%, #047857), linear-gradient(30deg, #047857 12%, transparent 12.5%, transparent 87%, #047857 87.5%, #047857), linear-gradient(150deg, #047857 12%, transparent 12.5%, transparent 87%, #047857 87.5%, #047857)",
          backgroundPosition: "0 0, 0 0, 24px 42px, 24px 42px",
          backgroundSize: "48px 84px",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,#047857,#d6a73a,#0f766e)]" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-2xl shadow-emerald-950/10 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative hidden min-h-[620px] bg-emerald-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(214,167,58,0.24) 0 2px, transparent 2px), linear-gradient(135deg, rgba(255,255,255,0.12) 0 1px, transparent 1px)",
                backgroundSize: "28px 28px, 36px 36px",
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-300 text-emerald-950 shadow-lg shadow-black/20">
                  <Mosque className="h-7 w-7" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-amber-200">
                    Nurul Ittihad Sepakat
                  </p>
                  <p className="text-sm text-emerald-100">Sistem Gotong Royong</p>
                </div>
              </div>

              <div className="mt-20 max-w-md">
                <p className="inline-flex items-center gap-2 rounded-md border border-amber-200/30 bg-white/10 px-3 py-1 text-sm text-amber-100">
                  <MoonStar className="h-4 w-4" aria-hidden="true" />
                  Amanah, tertib, dan mudah dipantau
                </p>
                <h1 className="mt-6 text-5xl font-bold leading-tight text-white">
                  Kelola jadwal jamaah dengan tenang.
                </h1>
                <p className="mt-5 text-base leading-7 text-emerald-50">
                  Pantau kelompok, rotasi, dan kehadiran dalam satu ruang kerja yang bersih untuk pengurus masjid.
                </p>
              </div>
            </div>

            <div className="relative grid grid-cols-3 gap-3">
              {["Jamaah", "Kelompok", "Jadwal"].map((item) => (
                <div key={item} className="rounded-md border border-white/15 bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">{item}</p>
                  <p className="mt-2 text-sm font-semibold text-white">Terkelola</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex min-h-screen items-center px-6 py-10 sm:min-h-[620px] sm:px-10 lg:px-14">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-800 text-amber-200">
                  <Mosque className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Nurul Ittihad Sepakat</p>
                  <p className="text-xs text-slate-500">Sistem Gotong Royong</p>
                </div>
              </div>

              <div>
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-md bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100">
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                  Masuk ke dashboard
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Gunakan akun pengurus untuk melanjutkan pengelolaan gotong royong masjid.
                </p>
              </div>

              <form action={action} className="mt-8 space-y-5">
                {state?.error && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {state.error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Username
                    </label>
                    <div className="relative mt-2">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-700" aria-hidden="true" />
                      <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        className="block h-12 w-full rounded-md border border-emerald-900/15 bg-white px-3 pl-11 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-3 focus:ring-emerald-100"
                        placeholder="Masukkan username"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>
                    <div className="relative mt-2">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-700" aria-hidden="true" />
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="block h-12 w-full rounded-md border border-emerald-900/15 bg-white px-3 pl-11 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-3 focus:ring-emerald-100"
                        placeholder="Masukkan password"
                      />
                    </div>
                  </div>
                </div>

                <SubmitButton />
              </form>

              <p className="mt-8 border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
                Sistem internal pengurus masjid.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
