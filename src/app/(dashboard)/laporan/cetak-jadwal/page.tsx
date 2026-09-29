import { requireAdmin, validateSession } from "@/lib/auth/session";
import { ScheduleService } from "@/services/schedule.service";
import { formatDisplayDate, getCurrentLocalDate } from "@/lib/date";
import { PrintScheduleClient } from "@/components/reports/print-schedule-client";
import { redirect } from "next/navigation";

export default async function CetakJadwalPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const sessionData = await validateSession();

  if (!sessionData) {
    redirect("/login");
  }

  // default filter: today to 7 days from now if not specified
  const todayStr = getCurrentLocalDate();
  
  let start = Array.isArray(searchParams.start) ? searchParams.start[0] : searchParams.start;
  let end = Array.isArray(searchParams.end) ? searchParams.end[0] : searchParams.end;

  if (!start) start = todayStr;
  if (!end) {
    // 7 days from start
    const startDate = new Date(start);
    startDate.setDate(startDate.getDate() + 7);
    end = startDate.toISOString().split('T')[0];
  }

  const schedules = await ScheduleService.getPrintSchedules(start, end);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto bg-slate-50 min-h-screen print:bg-white print:p-0">
      <div className="mb-6 print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cetak Jadwal</h1>
          <p className="text-sm text-gray-500">Buat laporan cetak PDF jadwal gotong royong.</p>
        </div>
      </div>

      <PrintScheduleClient />

      {/* The Printable Area */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
        <div className="text-center mb-8 border-b pb-6 border-slate-800">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-900">Jadwal Gotong Royong</h2>
          <p className="text-slate-600 mt-2 font-medium">Periode: {formatDisplayDate(start)} &mdash; {formatDisplayDate(end)}</p>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            Tidak ada jadwal gotong royong pada rentang tanggal ini.
          </div>
        ) : (
          <div className="space-y-10">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="break-inside-avoid">
                <div className="bg-slate-100 print:bg-slate-100/50 p-3 mb-4 rounded-md border border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{formatDisplayDate(schedule.workDate)}</h3>
                    <p className="text-sm text-slate-600">
                      Kelompok: {schedule.groups.map(g => g.name).join(" + ")}
                    </p>
                  </div>
                  {schedule.title && (
                    <div className="text-sm bg-white px-3 py-1 rounded shadow-sm border border-slate-200 font-medium text-slate-700">
                      {schedule.title}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {schedule.groups.map((group) => {
                    const groupMembers = schedule.participants.filter(p => p.groupName === group.name);
                    
                    return (
                      <div key={group.id} className="border border-slate-200 rounded-md overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 font-semibold text-sm text-slate-800">
                          {group.name} ({groupMembers.length} Orang)
                        </div>
                        <ul className="divide-y divide-slate-100">
                          {groupMembers.length > 0 ? (
                            groupMembers.map((member, idx) => (
                              <li key={idx} className="px-3 py-2 text-sm text-slate-700">
                                {idx + 1}. {member.residentName}
                              </li>
                            ))
                          ) : (
                            <li className="px-3 py-2 text-sm text-slate-400 italic">Tidak ada anggota</li>
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
