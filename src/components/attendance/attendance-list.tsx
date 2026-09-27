"use client";

import { useState } from "react";
import AttendanceStatusActions from "./attendance-status-actions";
import EditAttendanceDialog from "./edit-attendance-dialog";
import { formatIDR } from "@/lib/money";
import { formatDisplayDate } from "@/lib/date";

export interface AttendanceItem {
  id: string;
  status: string;
  paymentAmount: string | null;
  paymentDate: string | null;
  notes: string | null;
  resident: {
    id: string;
    name: string;
    phone: string | null;
  };
  group: {
    id: string;
    name: string;
    sequenceNo: number;
  };
}

export default function AttendanceList({
  scheduleId,
  attendances,
  defaultAmount,
  isReadonly,
}: {
  scheduleId: string;
  attendances: AttendanceItem[];
  defaultAmount: number;
  isReadonly: boolean;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editAttendance, setEditAttendance] = useState<AttendanceItem | null>(null);

  const filtered = attendances.filter((att) => {
    // Search
    const matchesSearch =
      att.resident.name.toLowerCase().includes(search.toLowerCase()) ||
      (att.resident.phone && att.resident.phone.includes(search));
    
    // Filter
    const matchesFilter = filter === "all" || att.status === filter;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Hadir</span>;
      case "paid":
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Bayar</span>;
      case "absent":
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Tidak Hadir</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">Belum Dicatat</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari nama masyarakat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Belum Dicatat</option>
            <option value="present">Hadir</option>
            <option value="paid">Bayar</option>
            <option value="absent">Tidak Hadir</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-sm">Tidak ada data yang sesuai.</p>
          </div>
        ) : (
          filtered.map((att) => (
            <div key={att.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{att.resident.name}</p>
                <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                  <span>{att.group.name}</span>
                  {att.resident.phone && (
                    <>
                      <span>&bull;</span>
                      <span>{att.resident.phone}</span>
                    </>
                  )}
                </div>
                {att.status === "paid" && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Nominal: <span className="font-medium">{formatIDR(parseFloat(att.paymentAmount || "0"))}</span></p>
                    <p>Tanggal: {formatDisplayDate(att.paymentDate || "")}</p>
                  </div>
                )}
                {att.notes && (
                  <p className="mt-2 text-sm text-gray-600 italic">Catatan: {att.notes}</p>
                )}
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                {att.status === "pending" ? (
                  <AttendanceStatusActions
                    attendanceId={att.id}
                    scheduleId={scheduleId}
                    residentName={att.resident.name}
                    currentStatus={att.status}
                    defaultAmount={defaultAmount}
                    disabled={isReadonly}
                  />
                ) : (
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(att.status)}
                    {!isReadonly && (
                      <button
                        onClick={() => setEditAttendance(att)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        Ubah
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {editAttendance && (
        <EditAttendanceDialog
          scheduleId={scheduleId}
          attendance={editAttendance}
          defaultAmount={defaultAmount}
          onClose={() => setEditAttendance(null)}
        />
      )}
    </div>
  );
}
