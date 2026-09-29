import { formatIDR } from "@/lib/money";

type GroupItem = {
  id: string;
  name: string;
  sequenceNo: number;
  scheduleCount: number;
  totalParticipants: number;
  present: number;
  paid: number;
  absent: number;
  pending: number;
  attendanceRate: number;
  totalPayment: number;
};

interface GroupSummaryProps {
  data: GroupItem[];
}

export function GroupSummary({ data }: GroupSummaryProps) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="app-card mb-6 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-900">Ringkasan Kelompok</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium">
            <tr>
              <th className="px-4 py-3">Kelompok</th>
              <th className="px-4 py-3 text-center">Kegiatan</th>
              <th className="px-4 py-3 text-center">Total Peserta</th>
              <th className="px-4 py-3 text-center text-green-700">Hadir</th>
              <th className="px-4 py-3 text-center text-teal-700">Bayar</th>
              <th className="px-4 py-3 text-center text-red-700">Tidak Hadir</th>
              <th className="px-4 py-3 text-center text-amber-700">Pending</th>
              <th className="px-4 py-3 text-center font-bold">Tingkat Kehadiran</th>
              <th className="px-4 py-3 text-right">Total Pengganti</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((group) => (
              <tr key={group.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                  {group.sequenceNo}. {group.name}
                </td>
                <td className="px-4 py-3 text-center font-medium">{group.scheduleCount}</td>
                <td className="px-4 py-3 text-center text-slate-500">{group.totalParticipants}</td>
                <td className="px-4 py-3 text-center text-green-600">{group.present}</td>
                <td className="px-4 py-3 text-center text-teal-600">{group.paid}</td>
                <td className="px-4 py-3 text-center text-red-600">{group.absent}</td>
                <td className="px-4 py-3 text-center text-amber-600">{group.pending}</td>
                <td className="px-4 py-3 text-center font-semibold text-emerald-700">{group.attendanceRate}%</td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">{formatIDR(group.totalPayment)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
