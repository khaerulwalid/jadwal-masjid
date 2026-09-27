import Link from "next/link";
import { formatDisplayDate } from "@/lib/date";
import CancelScheduleAction from "./cancel-schedule-action";

export default function ScheduleList({
  schedules,
}: {
  schedules: {
    id: string;
    workDate: string;
    title: string | null;
    status: string;
    participantCount: number;
    pendingCount: number;
    groupNames: string;
  }[];
}) {
  if (schedules.length === 0) {
    return (
      <div className="app-card p-8 text-center">
        <p className="text-slate-500 mb-4">Belum ada jadwal yang dibuat.</p>
        <Link
          href="/jadwal/tambah"
          className="btn-primary py-2 px-4"
        >
          Buat Jadwal Pertama
        </Link>
      </div>
    );
  }

  return (
    <div className="app-card overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="app-table">
          <thead>
            <tr>
              <th scope="col">
                Tanggal
              </th>
              <th scope="col">
                Kelompok Bertugas
              </th>
              <th scope="col">
                Peserta
              </th>
              <th scope="col">
                Status
              </th>
              <th scope="col" className="text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {schedules.map((schedule) => (
              <tr key={schedule.id} className={schedule.status === "cancelled" ? "bg-slate-50" : ""}>
                <td className="whitespace-nowrap">
                  <div className="text-sm font-bold text-slate-950">{formatDisplayDate(schedule.workDate)}</div>
                  {schedule.title && (
                    <div className="text-xs text-slate-500 max-w-xs truncate">{schedule.title}</div>
                  )}
                </td>
                <td className="text-sm text-slate-500 max-w-xs">
                  <span className="truncate block" title={schedule.groupNames || ""}>
                    {schedule.groupNames || "-"}
                  </span>
                </td>
                <td className="whitespace-nowrap text-sm text-slate-500">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-950">{schedule.participantCount - schedule.pendingCount} / {schedule.participantCount} dicatat</span>
                    {schedule.status === "scheduled" && schedule.pendingCount > 0 && (
                      <span className="text-xs text-amber-600">{schedule.pendingCount} belum dicatat</span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap text-sm text-slate-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      schedule.status === "scheduled"
                        ? "status-scheduled"
                        : schedule.status === "completed"
                        ? "status-active"
                        : "status-danger"
                    }`}
                  >
                    {schedule.status}
                  </span>
                </td>
                <td className="whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <Link href={`/jadwal/${schedule.id}`} className="link-primary">
                    Lihat
                  </Link>
                  {schedule.status === "scheduled" && (
                    <CancelScheduleAction scheduleId={schedule.id} buttonText="Batal" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden divide-y divide-emerald-900/10">
        {schedules.map((schedule) => (
          <div key={schedule.id} className={`p-4 space-y-3 ${schedule.status === "cancelled" ? "bg-slate-50" : ""}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-950">{formatDisplayDate(schedule.workDate)}</p>
                <p className="text-sm text-slate-500 mt-1">{schedule.groupNames || "-"}</p>
                <p className="text-xs text-slate-500 mt-1">
                  <span className="font-medium">{schedule.participantCount - schedule.pendingCount} / {schedule.participantCount}</span> dicatat
                  {schedule.status === "scheduled" && schedule.pendingCount > 0 && ` (${schedule.pendingCount} belum)`}
                </p>
              </div>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  schedule.status === "scheduled"
                    ? "status-scheduled"
                    : schedule.status === "completed"
                    ? "status-active"
                    : "status-danger"
                }`}
              >
                {schedule.status}
              </span>
            </div>
            {schedule.title && (
              <p className="text-xs text-slate-600 italic">&quot;{schedule.title}&quot;</p>
            )}
            <div className="flex justify-end space-x-4 pt-2">
              <Link href={`/jadwal/${schedule.id}`} className="link-primary text-sm">
                Lihat
              </Link>
              {schedule.status === "scheduled" && (
                <CancelScheduleAction scheduleId={schedule.id} buttonText="Batal" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
