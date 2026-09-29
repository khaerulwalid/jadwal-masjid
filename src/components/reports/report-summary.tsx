import { formatIDR } from "@/lib/money";

interface ReportSummaryProps {
  data: {
    scheduleCount: number;
    totalParticipants: number;
    present: number;
    paid: number;
    absent: number;
    pending: number;
    totalPayment: number;
    attendanceRate: number;
  };
  isCancelledMode?: boolean;
}

export function ReportSummary({ data, isCancelledMode = false }: ReportSummaryProps) {
  return (
    <div className="space-y-4 mb-6">
      {isCancelledMode && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm font-medium">
          Menampilkan data jadwal yang dibatalkan.
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="app-card p-4 text-center">
          <span className="block text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Jumlah Kegiatan</span>
          <span className="font-semibold text-slate-900 text-2xl">{data.scheduleCount}</span>
        </div>
        
        <div className="app-card p-4 text-center border-emerald-200 border-2">
          <span className="block text-emerald-700 text-xs font-medium uppercase tracking-wider mb-1">Tingkat Kehadiran</span>
          <span className="font-bold text-emerald-700 text-2xl">{data.attendanceRate}%</span>
        </div>

        <div className="app-card p-4 text-center bg-rose-50 border border-rose-100">
          <span className="block text-rose-700 text-xs font-medium uppercase tracking-wider mb-1">Total Pengganti Kerja</span>
          <span className="font-semibold text-rose-900 text-xl">{formatIDR(data.totalPayment)}</span>
        </div>

        <div className="app-card p-4 text-center">
          <span className="block text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Total Peserta Terjadwal</span>
          <span className="font-semibold text-slate-900 text-2xl">{data.totalParticipants}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="app-card p-3 flex items-center justify-between border-l-4 border-l-green-500">
          <span className="text-sm font-medium text-slate-700">Hadir</span>
          <span className="font-bold text-slate-900">{data.present}</span>
        </div>
        <div className="app-card p-3 flex items-center justify-between border-l-4 border-l-teal-500">
          <span className="text-sm font-medium text-slate-700">Bayar Pengganti</span>
          <span className="font-bold text-slate-900">{data.paid}</span>
        </div>
        <div className="app-card p-3 flex items-center justify-between border-l-4 border-l-red-500">
          <span className="text-sm font-medium text-slate-700">Tidak Hadir</span>
          <span className="font-bold text-slate-900">{data.absent}</span>
        </div>
        <div className="app-card p-3 flex items-center justify-between border-l-4 border-l-amber-500">
          <span className="text-sm font-medium text-slate-700">Belum Dicatat</span>
          <span className="font-bold text-slate-900">{data.pending}</span>
        </div>
      </div>
    </div>
  );
}
