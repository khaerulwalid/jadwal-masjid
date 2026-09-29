"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { getCurrentLocalDate } from "@/lib/date";

interface ReportFiltersProps {
  groups: { id: string; name: string; sequenceNo: number }[];
}

export function ReportFilters({ groups }: ReportFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = getCurrentLocalDate();
  const yearMonth = today.substring(0, 7);
  const defaultStartDate = `${yearMonth}-01`;

  const [startDate, setStartDate] = useState(searchParams.get("startDate") || defaultStartDate);
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || today);
  const [status, setStatus] = useState(searchParams.get("status") || "completed");
  const [groupId, setGroupId] = useState(searchParams.get("groupId") || "");

  const handleApply = useCallback(() => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (status) params.set("status", status);
    if (groupId) params.set("groupId", groupId);

    router.push(`/laporan?${params.toString()}`);
  }, [startDate, endDate, status, groupId, router]);

  const handleReset = () => {
    setStartDate(defaultStartDate);
    setEndDate(today);
    setStatus("completed");
    setGroupId("");
    router.push("/laporan");
  };

  return (
    <div className="app-card p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">Dari Tanggal</label>
          <input
            type="date"
            id="startDate"
            className="input-field"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">Sampai Tanggal</label>
          <input
            type="date"
            id="endDate"
            className="input-field"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status Kegiatan</label>
          <select
            id="status"
            className="input-field"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">Semua</option>
            <option value="scheduled">Terjadwal</option>
            <option value="completed">Selesai (Default)</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
        <div>
          <label htmlFor="groupId" className="block text-sm font-medium text-slate-700 mb-1">Kelompok</label>
          <select
            id="groupId"
            className="input-field"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          >
            <option value="">Semua Kelompok</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.sequenceNo}. {g.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button onClick={handleApply} className="btn-primary flex-1 py-2 text-sm">
            Terapkan
          </button>
          <button onClick={handleReset} className="btn-secondary py-2 px-3 text-sm" title="Reset Filter">
            Reset
          </button>
        </div>
      </div>
      {startDate > endDate && (
        <p className="text-red-500 text-xs mt-2">Tanggal awal tidak boleh melebihi tanggal akhir.</p>
      )}
    </div>
  );
}
