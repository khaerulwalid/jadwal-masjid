import Link from "next/link";
import { ResidentService } from "@/services/resident.service";
import { GroupService } from "@/services/group.service";
import { notFound } from "next/navigation";
import ResidentStatusAction from "@/components/residents/resident-status-action";
import { formatDisplayDate } from "@/lib/date";
import { formatIDR } from "@/lib/money";
import { Printer } from "lucide-react";

export default async function DetailMasyarakatPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const resident = await ResidentService.getResidentById(params.id);

  if (!resident) {
    notFound();
  }

  // Fetch group data
  const activeGroup = await GroupService.getResidentActiveGroup(resident.id);
  const history = await GroupService.getResidentMembershipHistory(resident.id);
  const attendanceSummary = await ResidentService.getResidentAttendanceSummary(resident.id);
  const attendanceHistory = await ResidentService.getResidentAttendanceHistory(resident.id);

  // Locale Indonesia formatting for createdAt
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Makassar",
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Masyarakat</h1>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/masyarakat/${resident.id}/cetak`}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak PDF
          </Link>
          <Link
            href={`/masyarakat/${resident.id}/edit`}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md"
          >
            Edit
          </Link>
          <ResidentStatusAction id={resident.id} isActive={resident.isActive} />
          <Link
            href="/masyarakat"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md"
          >
            Kembali
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Informasi Profil</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Data pribadi dan status keanggotaan.</p>
          </div>
          <span
            className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
              resident.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {resident.isActive ? "Aktif" : "Nonaktif"}
          </span>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nama Lengkap</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{resident.name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nomor HP</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{resident.phone || "-"}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Alamat</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{resident.address || "-"}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Kelompok</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {activeGroup ? (
                  <div>
                    <Link href={`/kelompok/${activeGroup.groupId}`} className="text-blue-600 font-medium hover:underline">
                      {activeGroup.groupName}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      Tanggal bergabung: {formatDisplayDate(activeGroup.joinedAt)}
                    </p>
                  </div>
                ) : (
                  <span className="italic text-gray-400">Belum memiliki kelompok</span>
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Tanggal Dibuat</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(resident.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Riwayat Kelompok</h3>
          <p className="mt-1 text-sm text-gray-500">Catatan keanggotaan kelompok gotong royong.</p>
        </div>
        
        {history.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Masyarakat ini belum pernah memiliki riwayat kelompok.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {history.map((record) => (
              <li key={record.membershipId} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">{record.groupName}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    {!record.leftAt ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Aktif Sekarang
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Selesai
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {formatDisplayDate(record.joinedAt)} &mdash; {record.leftAt ? formatDisplayDate(record.leftAt) : "Sekarang"}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Riwayat Gotong Royong</h3>
          <p className="mt-1 text-sm text-gray-500">Ringkasan dan histori 10 kehadiran terbaru.</p>
        </div>
        
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm">
              <span className="block text-xs font-medium text-slate-500 uppercase">Total Terjadwal</span>
              <span className="text-xl font-bold text-slate-900 mt-1">{attendanceSummary.scheduled}</span>
            </div>
            <div className="bg-white p-3 rounded-md border border-green-200 shadow-sm">
              <span className="block text-xs font-medium text-green-700 uppercase">Hadir</span>
              <span className="text-xl font-bold text-green-700 mt-1">{attendanceSummary.present}</span>
            </div>
            <div className="bg-white p-3 rounded-md border border-teal-200 shadow-sm">
              <span className="block text-xs font-medium text-teal-700 uppercase">Bayar</span>
              <span className="text-xl font-bold text-teal-700 mt-1">{attendanceSummary.paid}</span>
            </div>
            <div className="bg-white p-3 rounded-md border border-red-200 shadow-sm">
              <span className="block text-xs font-medium text-red-700 uppercase">Tidak Hadir</span>
              <span className="text-xl font-bold text-red-700 mt-1">{attendanceSummary.absent}</span>
            </div>
          </div>
        </div>

        {attendanceHistory.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Belum ada data kehadiran gotong royong.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Kelompok</th>
                  <th className="px-4 py-3">Status Jadwal</th>
                  <th className="px-4 py-3 text-center">Kehadiran</th>
                  <th className="px-4 py-3 text-right">Nominal Pengganti</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceHistory.map((att, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                      {formatDisplayDate(att.workDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{att.groupName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${att.status === "scheduled" ? "status-scheduled" : att.status === "completed" ? "status-active" : "status-danger"}`}>
                        {att.status === "scheduled" ? "Terjadwal" : att.status === "completed" ? "Selesai" : "Dibatalkan"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${att.attendanceStatus === 'present' ? 'bg-green-100 text-green-800' : att.attendanceStatus === 'paid' ? 'bg-teal-100 text-teal-800' : att.attendanceStatus === 'absent' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                        {att.attendanceStatus === 'present' ? 'Hadir' : att.attendanceStatus === 'paid' ? 'Bayar' : att.attendanceStatus === 'absent' ? 'Tidak Hadir' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {att.attendanceStatus === 'paid' ? formatIDR(Number(att.paymentAmount)) : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link href={`/jadwal/${att.scheduleId}`} className="text-emerald-600 hover:text-emerald-800 font-semibold text-xs">
                        Lihat Jadwal
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
