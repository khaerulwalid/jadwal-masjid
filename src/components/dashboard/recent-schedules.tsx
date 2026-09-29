import Link from "next/link";
import { formatDisplayDate } from "@/lib/date";

type ScheduleStat = {
  total: number;
  present: number;
  paid: number;
  absent: number;
  pending: number;
};

type ScheduleGroup = {
  name: string;
};

type ScheduleItem = {
  id: string;
  workDate: string;
  status: string;
  groups: ScheduleGroup[];
  stats: ScheduleStat;
};

export function RecentSchedules({ schedules }: { schedules: ScheduleItem[] }) {
  if (schedules.length === 0) {
    return (
      <div className="app-card p-6">
        <h2 className="text-lg font-semibold text-slate-950 mb-4">Jadwal Terbaru</h2>
        <p className="text-sm text-slate-500">Belum ada data jadwal kegiatan.</p>
      </div>
    );
  }

  return (
    <div className="app-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-950">Jadwal Terbaru</h2>
        <Link href="/jadwal" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          Lihat Semua &rarr;
        </Link>
      </div>
      
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <Link key={schedule.id} href={`/jadwal/${schedule.id}`} className="block group">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 group-hover:bg-slate-50 group-hover:border-emerald-200 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-slate-900">{formatDisplayDate(schedule.workDate)}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {schedule.groups.map((g) => g.name).join(" + ") || "-"}
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${schedule.status === "scheduled" ? "status-scheduled" : schedule.status === "completed" ? "status-active" : "status-danger"}`}>
                  {schedule.status === "scheduled" ? "Terjadwal" : schedule.status === "completed" ? "Selesai" : "Dibatalkan"}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-600">
                  <strong className="text-slate-900">{schedule.stats.total}</strong> Peserta
                </span>
                <span className="text-green-600">
                  <strong className="text-green-700">{schedule.stats.present}</strong> Hadir
                </span>
                <span className="text-teal-600">
                  <strong className="text-teal-700">{schedule.stats.paid}</strong> Bayar
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
