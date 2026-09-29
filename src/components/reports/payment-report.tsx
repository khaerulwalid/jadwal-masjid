import Link from "next/link";
import { formatDisplayDate } from "@/lib/date";
import { formatIDR } from "@/lib/money";

type PaymentItem = {
  id: string;
  workDate: string;
  residentName: string;
  groupName: string;
  paymentAmount: number;
  paymentDate: string | null;
  notes: string | null;
  scheduleId: string;
};

interface PaymentReportProps {
  data: PaymentItem[];
}

export function PaymentReport({ data }: PaymentReportProps) {
  if (!data || data.length === 0) {
    return (
      <div className="app-card p-6 text-center text-slate-500 mb-6">
        Tidak ada data pembayaran pengganti kerja pada periode yang dipilih.
      </div>
    );
  }

  return (
    <div className="app-card mb-6 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-900">Pengganti Kerja dengan Uang</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium">
            <tr>
              <th className="px-4 py-3">Tanggal Kegiatan</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Kelompok</th>
              <th className="px-4 py-3">Nominal</th>
              <th className="px-4 py-3">Tanggal Bayar</th>
              <th className="px-4 py-3">Catatan</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                  {formatDisplayDate(payment.workDate)}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {payment.residentName}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {payment.groupName}
                </td>
                <td className="px-4 py-3 font-semibold text-teal-700 whitespace-nowrap">
                  {formatIDR(payment.paymentAmount)}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {payment.paymentDate ? formatDisplayDate(payment.paymentDate) : "-"}
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-xs truncate" title={payment.notes || ""}>
                  {payment.notes || "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <Link href={`/jadwal/${payment.scheduleId}`} className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold">
                    Jadwal
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
