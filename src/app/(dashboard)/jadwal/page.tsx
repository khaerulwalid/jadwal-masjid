import Link from "next/link";
import ScheduleList from "@/components/schedules/schedule-list";
import { ScheduleService } from "@/services/schedule.service";

import { requireAdmin } from "@/lib/auth/session";

export default async function JadwalPage() {
  await requireAdmin();
  const schedules = await ScheduleService.getSchedules();

  return (
    <div className="page-surface p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Jadwal Gotong Royong</h1>
          <p className="text-sm text-slate-600 mt-1">Kelola jadwal kegiatan dan lihat daftar peserta.</p>
        </div>
        <Link
          href="/jadwal/tambah"
          className="btn-primary py-2 px-4"
        >
          Buat Jadwal Baru
        </Link>
      </div>

      <ScheduleList schedules={schedules} />
    </div>
  );
}
