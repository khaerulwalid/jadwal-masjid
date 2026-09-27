import { notFound } from "next/navigation";
import { ScheduleService } from "@/services/schedule.service";
import { AttendanceService } from "@/services/attendance.service";
import { formatDisplayDate } from "@/lib/date";
import Link from "next/link";
import CancelScheduleAction from "@/components/schedules/cancel-schedule-action";
import { requireAdmin } from "@/lib/auth/session";
import AttendanceList from "@/components/attendance/attendance-list";
import BulkPresentAction from "@/components/attendance/bulk-present-action";
import CompleteScheduleAction from "@/components/attendance/complete-schedule-action";

export default async function DetailJadwalPage(props: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await props.params;
  const schedule = await ScheduleService.getScheduleById(id);

  if (!schedule) {
    notFound();
  }

  const { attendances, summary } = await AttendanceService.getScheduleAttendanceAndSummary(id);
  const defaultAmount = await AttendanceService.getDefaultPaymentAmount();

  const isScheduled = schedule.status === "scheduled";
  const isCompleted = schedule.status === "completed";
  const isCancelled = schedule.status === "cancelled";

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/jadwal" className="hover:text-gray-900">Jadwal</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-900 font-medium">Kehadiran</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {formatDisplayDate(schedule.workDate)}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {schedule.title || "Jadwal Gotong Royong"} &bull; {schedule.scheduledGroups.map(g => g.name).join(", ")}
            </p>
          </div>
          <span
            className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
              isScheduled
                ? "bg-blue-100 text-blue-800"
                : isCompleted
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {schedule.status}
          </span>
        </div>
        
        {isCompleted && (
          <div className="bg-green-50 px-4 py-3 border-t border-green-200">
            <p className="text-sm text-green-800">Jadwal Selesai pada {schedule.completedAt ? formatDisplayDate(schedule.completedAt) : "-"}. Data kehadiran bersifat read-only.</p>
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 px-4 py-3 border-t border-red-200">
            <p className="text-sm text-red-800">Jadwal Dibatalkan. Data kehadiran bersifat read-only.</p>
          </div>
        )}

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
              <p className="text-xs font-medium text-gray-500 uppercase mt-1">Total</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-2xl font-bold text-green-700">{summary.present}</p>
              <p className="text-xs font-medium text-green-700 uppercase mt-1">Hadir</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-2xl font-bold text-blue-700">{summary.paid}</p>
              <p className="text-xs font-medium text-blue-700 uppercase mt-1">Bayar</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-2xl font-bold text-red-700">{summary.absent}</p>
              <p className="text-xs font-medium text-red-700 uppercase mt-1">Tidak Hadir</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <p className="text-2xl font-bold text-yellow-700">{summary.pending}</p>
              <p className="text-xs font-medium text-yellow-700 uppercase mt-1">Belum Dicatat</p>
            </div>
          </div>

          {isScheduled && (
            <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="w-full sm:w-auto">
                <BulkPresentAction scheduleId={schedule.id} pendingCount={summary.pending} />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <CancelScheduleAction 
                  scheduleId={schedule.id} 
                  buttonClassName="bg-white text-red-700 hover:bg-red-50 font-medium py-2 px-4 rounded-md text-sm border border-red-200 w-full sm:w-auto"
                  buttonText="Batalkan Jadwal"
                />
                <CompleteScheduleAction scheduleId={schedule.id} pendingCount={summary.pending} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Daftar Kehadiran</h3>
        <AttendanceList 
          scheduleId={schedule.id} 
          attendances={attendances} 
          defaultAmount={defaultAmount} 
          isReadonly={!isScheduled}
        />
      </div>
    </div>
  );
}
