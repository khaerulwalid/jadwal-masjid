import { validateSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getAttendanceMatrixByGroup } from "@/services/report.service";
import { GroupService } from "@/services/group.service";
import { getCurrentLocalDate, formatDisplayDate } from "@/lib/date";
import { AttendanceMatrixClient } from "@/components/reports/attendance-matrix-client";
import { AttendanceMatrixTable } from "@/components/reports/attendance-matrix-table";
import { LayoutGrid, Printer } from "lucide-react";
import Link from "next/link";

export default async function CetakKehadiranPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const session = await validateSession();
  if (!session) redirect("/login");

  const today = getCurrentLocalDate();
  const firstOfMonth = today.slice(0, 7) + "-01";

  const start = (Array.isArray(searchParams.start) ? searchParams.start[0] : searchParams.start) || firstOfMonth;
  const end   = (Array.isArray(searchParams.end)   ? searchParams.end[0]   : searchParams.end)   || today;
  const groupId = Array.isArray(searchParams.groupId) ? searchParams.groupId[0] : searchParams.groupId;

  const [matrixData, groupsData] = await Promise.all([
    getAttendanceMatrixByGroup(start, end, groupId || undefined),
    GroupService.getGroups(),
  ]);

  return (
    <div className="p-4 md:p-8 max-w-full mx-auto bg-slate-50 min-h-screen print:bg-white print:p-0 print:max-w-none">
      {/* Header — hidden on print */}
      <div className="mb-6 print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Rekap Kehadiran per Kelompok</h1>
            <p className="text-sm text-slate-500">
              ✓ = Hadir &nbsp;·&nbsp; $ = Bayar Pengganti &nbsp;·&nbsp; ✗ = Tidak Hadir (klik untuk isi alasan)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undefined} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm print:hidden" id="print-btn"
            // We need client-side print, handled via a tiny inline script or through the client component
          >
            <Printer className="w-4 h-4" /> Cetak PDF
          </button>
          <Link href="/laporan" className="btn-secondary px-4 py-2 text-sm">← Kembali</Link>
        </div>
      </div>

      {/* Filter (client) */}
      <AttendanceMatrixClient groups={groupsData.map(g => ({ id: g.id, name: g.name }))} />

      {/* Print Header — visible only on print */}
      <div className="hidden print:block text-center mb-5 border-b-2 border-slate-800 pb-3">
        <h2 className="text-lg font-bold uppercase tracking-wide">Rekapitulasi Kehadiran Gotong Royong</h2>
        <p className="text-sm text-slate-600 mt-1">
          Periode: {formatDisplayDate(start)} — {formatDisplayDate(end)}
          {groupId && matrixData.length > 0 ? ` | Kelompok: ${matrixData[0]?.group?.name}` : ""}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">✓ = Hadir &nbsp; $ = Bayar Pengganti &nbsp; ✗ = Tidak Hadir</p>
      </div>

      {/* Matrix Table (client for interactivity) */}
      <AttendanceMatrixTable data={matrixData} />

      {/* Print button script */}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          var btn = document.getElementById('print-btn');
          if (btn) btn.addEventListener('click', function() { window.print(); });
        });
      ` }} />
    </div>
  );
}
