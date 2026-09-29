import { validateSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { GroupService } from "@/services/group.service";
import { 
  getReportSummary, 
  getActivityReport, 
  getGroupSummaryReport, 
  getPaymentReport 
} from "@/services/report.service";
import { getDefaultReportFilters, reportFilterSchema } from "@/lib/validation/report";
import { ReportFilters } from "@/components/reports/report-filters";
import { ReportSummary } from "@/components/reports/report-summary";
import { ActivityReport } from "@/components/reports/activity-report";
import { GroupSummary } from "@/components/reports/group-summary";
import { PaymentReport } from "@/components/reports/payment-report";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { ClipboardList, Printer, LayoutGrid } from "lucide-react";
import Link from "next/link";

export default async function ReportsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const sessionData = await validateSession();

  if (!sessionData) {
    redirect("/login");
  }

  const defaultFilters = getDefaultReportFilters();

  const rawFilters = {
    startDate: typeof searchParams.startDate === "string" ? searchParams.startDate : defaultFilters.startDate,
    endDate: typeof searchParams.endDate === "string" ? searchParams.endDate : defaultFilters.endDate,
    status: typeof searchParams.status === "string" ? searchParams.status : defaultFilters.status,
    groupId: typeof searchParams.groupId === "string" ? searchParams.groupId : defaultFilters.groupId,
    page: typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : defaultFilters.page,
  };

  const parsedParams = reportFilterSchema.safeParse(rawFilters);
  const filters = parsedParams.success ? parsedParams.data : defaultFilters;

  const [
    groupsData,
    summaryData,
    activityData,
    groupSummaryData,
    paymentData
  ] = await Promise.all([
    GroupService.getGroups(),
    getReportSummary(filters),
    getActivityReport(filters),
    getGroupSummaryReport(filters),
    getPaymentReport(filters),
  ]);

  const isCancelledMode = filters.status === "cancelled";

  return (
    <div className="page-surface p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Laporan Kegiatan</h1>
            <p className="text-sm text-slate-500">Pantau kehadiran dan uang pengganti kerja gotong royong.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/laporan/cetak-kehadiran"
            className="btn-secondary gap-2 py-2 px-3 text-sm"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Rekap Kehadiran</span>
          </Link>
          <Link
            href="/laporan/cetak-jadwal"
            className="btn-secondary gap-2 py-2 px-3 text-sm"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Cetak PDF</span>
          </Link>
          <ExportCsvButton />
        </div>
      </div>

      <ReportFilters groups={groupsData.map(g => ({ id: g.id, name: g.name, sequenceNo: g.sequenceNo }))} />

      {!parsedParams.success && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          Parameter filter tidak valid, menggunakan default.
        </div>
      )}

      <ReportSummary data={summaryData} isCancelledMode={isCancelledMode} />
      
      <GroupSummary data={groupSummaryData} />

      <ActivityReport data={activityData.data} />
      
      <PaymentReport data={paymentData.data} />

    </div>
  );
}
