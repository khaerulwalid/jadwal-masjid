import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { logoutAction } from "@/actions/auth.actions";
import { LogOut, Mosque } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <nav className="app-nav sticky top-0 z-10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-800 text-amber-200">
                  <Mosque className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="block font-bold text-lg leading-5 text-emerald-900">SGR Masjid</span>
                  <span className="hidden text-xs text-emerald-700 sm:block">Gotong Royong</span>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-transparent text-slate-600 hover:border-amber-300 hover:text-emerald-800 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold"
                >
                  Dashboard
                </Link>
                <Link
                  href="/masyarakat"
                  className="border-transparent text-slate-600 hover:border-amber-300 hover:text-emerald-800 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold"
                >
                  Masyarakat
                </Link>
                <Link
                  href="/kelompok"
                  className="border-transparent text-slate-600 hover:border-amber-300 hover:text-emerald-800 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold"
                >
                  Kelompok
                </Link>
                <Link
                  href="/jadwal"
                  className="border-transparent text-slate-600 hover:border-amber-300 hover:text-emerald-800 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold"
                >
                  Jadwal
                </Link>
                <Link
                  href="/pengaturan/rotasi"
                  className="border-transparent text-slate-600 hover:border-amber-300 hover:text-emerald-800 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold"
                >
                  Pengaturan
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="btn-secondary gap-2 py-1.5 px-3 text-sm"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className="sm:hidden border-t border-emerald-900/10">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/dashboard"
              className="bg-emerald-50 border-emerald-700 text-emerald-900 block pl-3 pr-4 py-2 border-l-4 text-base font-semibold"
            >
              Dashboard
            </Link>
            <Link
              href="/masyarakat"
              className="border-transparent text-slate-600 hover:bg-emerald-50 hover:border-amber-300 hover:text-emerald-800 block pl-3 pr-4 py-2 border-l-4 text-base font-semibold"
            >
              Masyarakat
            </Link>
            <Link
              href="/kelompok"
              className="border-transparent text-slate-600 hover:bg-emerald-50 hover:border-amber-300 hover:text-emerald-800 block pl-3 pr-4 py-2 border-l-4 text-base font-semibold"
            >
              Kelompok
            </Link>
            <Link
              href="/jadwal"
              className="border-transparent text-slate-600 hover:bg-emerald-50 hover:border-amber-300 hover:text-emerald-800 block pl-3 pr-4 py-2 border-l-4 text-base font-semibold"
            >
              Jadwal
            </Link>
            <Link
              href="/pengaturan/rotasi"
              className="border-transparent text-slate-600 hover:bg-emerald-50 hover:border-amber-300 hover:text-emerald-800 block pl-3 pr-4 py-2 border-l-4 text-base font-semibold"
            >
              Pengaturan
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
