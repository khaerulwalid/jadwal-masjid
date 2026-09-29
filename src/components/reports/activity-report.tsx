import Link from "next/link";
import { formatDisplayDate } from "@/lib/date";
import { formatIDR } from "@/lib/money";

type ScheduleGroup = {
  name: string;
};

type ScheduleStat = {
  total: number;
  present: number;
  paid: number;
  absent: number;
  pending: number;
  totalPayment: number;
};

type ActivityItem = {
  id: string;
  workDate: string;
  status: string;
  groups: ScheduleGroup[];
  stats: ScheduleStat;
};

interface ActivityReportProps {
  data: ActivityItem[];
}

export function ActivityReport({ data }: ActivityReportProps) {
  if (!data || data.length === 0) {
    return (
      <div className="app-card p-6 text-center text-slate-500 mb-6">
        Tidak ada data kegiatan pada periode yang dipilih.
      </div>
    );
  }

  return (
    <div className="app-card mb-6 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-900">Daftar Kegiatan</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium">
            <tr>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Kelompok</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Total</th>
              <th className="px-4 py-3 text-center text-green-700">Hadir</th>
              <th className="px-4 py-3 text-center text-teal-700">Bayar</th>
              <th className="px-4 py-3 text-center text-red-700">Tidak Hadir</th>
              <th className="px-4 py-3 text-center text-amber-700">Pending</th>
              <th className="px-4 py-3 text-right">Pembayaran</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((schedule) => (
              <tr key={schedule.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-slate-900 font-medium">
                  {formatDisplayDate(schedule.workDate)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                  {schedule.groups.map((g) => g.name).join(" + ") || "-"}
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${schedule.status === "scheduled" ? "status-scheduled" : schedule.status === "completed" ? "status-active" : "status-danger"}`}>
                    {schedule.status === "scheduled" ? "Terjadwal" : schedule.status === "completed" ? "Selesai" : "Dibatalkan"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-medium text-slate-900">{schedule.stats.total}</td>
                <td className="px-4 py-3 text-center text-green-600">{schedule.stats.present}</td>
                <td className="px-4 py-3 text-center text-teal-600">{schedule.stats.paid}</td>
                <td className="px-4 py-3 text-center text-red-600">{schedule.stats.absent}</td>
                <td className="px-4 py-3 text-center text-amber-600">{schedule.stats.pending}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">{formatIDR(schedule.stats.totalPayment)}</td>
                <td className="px-4 py-3 text-center">
                  <Link href={`/jadwal/${schedule.id}`} className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold">
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
