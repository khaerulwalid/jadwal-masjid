import { validateSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { RotationService } from "@/services/rotation.service";
import { ScheduleService } from "@/services/schedule.service";
import Link from "next/link";
import { CalendarCheck, MoonStar } from "lucide-react";

export default async function DashboardPage() {
  const sessionData = await validateSession();

  if (!sessionData) {
    redirect("/login");
  }

  const { user } = sessionData;
  const rotationState = await RotationService.getRotationState();
  const todaySchedule = await ScheduleService.getTodaySchedule();

  return (
    <div className="page-surface p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8 rounded-lg border border-emerald-900/10 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 p-6 text-white shadow-xl shadow-emerald-950/10">
        <p className="inline-flex items-center gap-2 rounded-md border border-amber-200/25 bg-white/10 px-3 py-1 text-sm text-amber-100">
          <MoonStar className="h-4 w-4" aria-hidden="true" />
          Dashboard pengurus
        </p>
        <h1 className="mt-4 text-2xl font-bold md:text-3xl">Sistem Gotong Royong Masjid</h1>
        <p className="mt-2 text-emerald-50">Selamat datang, <span className="font-semibold text-amber-100">{user.name}</span></p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="app-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-slate-950">Jadwal Hari Ini</h2>
          </div>
          {todaySchedule ? (
            <div className="space-y-4">
              <div>
                <span className="text-sm font-semibold text-slate-950 block">{todaySchedule.groupNames || "-"}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                  <span className="block text-slate-500 text-xs">Total</span>
                  <span className="font-semibold text-slate-900">{todaySchedule.participantCount}</span>
                </div>
                <div className="bg-green-50 rounded-md p-2 border border-green-200">
                  <span className="block text-green-700 text-xs">Hadir</span>
                  <span className="font-semibold text-green-700">{todaySchedule.presentCount}</span>
                </div>
                <div className="bg-teal-50 rounded-md p-2 border border-teal-200">
                  <span className="block text-teal-700 text-xs">Bayar</span>
                  <span className="font-semibold text-teal-700">{todaySchedule.paidCount}</span>
                </div>
                <div className="bg-red-50 rounded-md p-2 border border-red-200">
                  <span className="block text-red-700 text-xs">Tidak Hadir</span>
                  <span className="font-semibold text-red-700">{todaySchedule.absentCount}</span>
                </div>
                <div className="bg-amber-50 rounded-md p-2 border border-amber-200 col-span-2">
                  <span className="block text-amber-700 text-xs">Belum Dicatat</span>
                  <span className="font-semibold text-amber-700">{todaySchedule.pendingCount}</span>
                </div>
              </div>

              <div>
                <span className="text-sm text-slate-500 block">Status</span>
                <span className={`inline-flex px-2 py-1 mt-1 text-xs font-semibold rounded-full ${todaySchedule.status === "scheduled" ? "status-scheduled" : todaySchedule.status === "completed" ? "status-active" : "status-danger"}`}>
                  {todaySchedule.status === "scheduled" ? "Terjadwal" : todaySchedule.status === "completed" ? "Selesai" : "Dibatalkan"}
                </span>
              </div>
              <div className="pt-3">
                <Link href={`/jadwal/${todaySchedule.id}`} className="btn-primary w-full py-2 px-4 text-sm">
                  {todaySchedule.status === "scheduled" ? "Catat Kehadiran" : "Lihat Detail"}
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Belum ada jadwal gotong royong hari ini.</p>
              <div className="pt-3">
                <Link href="/jadwal/tambah" className="btn-primary py-2 px-4 text-sm">
                  Buat Jadwal
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="app-card p-6">
          <h2 className="text-lg font-semibold text-slate-950 mb-4">Informasi Rotasi</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-slate-500 block">Status Rotasi</span>
              <span className={`inline-flex px-2 py-1 mt-1 text-xs font-semibold rounded-full ${!rotationState.isPaused ? "status-active" : "status-paused"}`}>
                {!rotationState.isPaused ? "Aktif" : "Dijeda"}
              </span>
            </div>
            <div>
              <span className="text-sm text-slate-500 block">Kelompok Berikutnya</span>
              <span className="text-sm font-semibold text-slate-950 mt-1 block">
                {rotationState.nextGroup ? `${rotationState.nextGroup.sequenceNo}. ${rotationState.nextGroup.name}` : "Belum ditentukan"}
              </span>
            </div>
            <div className="pt-3">
              <Link href="/pengaturan/rotasi" className="link-primary text-sm">
                Atur Rotasi &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
