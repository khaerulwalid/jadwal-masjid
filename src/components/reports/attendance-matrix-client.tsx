"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Calendar, Printer } from "lucide-react";

export function AttendanceMatrixClient({
  groups,
}: {
  groups: { id: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = useState(searchParams.get("start") || "");
  const [endDate, setEndDate] = useState(searchParams.get("end") || "");
  const [groupId, setGroupId] = useState(searchParams.get("groupId") || "");

  const applyFilter = (start: string, end: string, gid: string) => {
    const params = new URLSearchParams();
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    if (gid) params.set("groupId", gid);
    router.push(`?${params.toString()}`);
  };

  const setShortcut = (days: number) => {
    const now = new Date();
    const makassar = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const today = makassar.toISOString().split("T")[0];
    const past = new Date(makassar.getTime() - days * 24 * 60 * 60 * 1000);
    const pastStr = past.toISOString().split("T")[0];
    setStartDate(pastStr);
    setEndDate(today);
    applyFilter(pastStr, today, groupId);
  };

  const currentMonth = () => {
    const now = new Date();
    const makassar = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const y = makassar.getUTCFullYear();
    const m = String(makassar.getUTCMonth() + 1).padStart(2, "0");
    const start = `${y}-${m}-01`;
    const lastDay = new Date(y, makassar.getUTCMonth() + 1, 0).getDate();
    const end = `${y}-${m}-${String(lastDay).padStart(2, "0")}`;
    setStartDate(start);
    setEndDate(end);
    applyFilter(start, end, groupId);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 print:hidden">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-sm"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-sm"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Kelompok</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full text-sm"
            >
              <option value="">Semua Kelompok</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => applyFilter(startDate, endDate, groupId)}
            className="btn-primary px-4 py-2 text-sm"
          >
            Tampilkan
          </button>
        </div>

        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <button onClick={currentMonth} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-sm rounded-md text-slate-700 bg-white hover:bg-slate-50">
              <Calendar className="w-3.5 h-3.5" /> Bulan Ini
            </button>
            <button onClick={() => setShortcut(30)} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-sm rounded-md text-slate-700 bg-white hover:bg-slate-50">
              <Calendar className="w-3.5 h-3.5" /> 30 Hari Terakhir
            </button>
            <button onClick={() => setShortcut(90)} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-sm rounded-md text-slate-700 bg-white hover:bg-slate-50">
              <Calendar className="w-3.5 h-3.5" /> 3 Bulan Terakhir
            </button>
          </div>
          <button
            onClick={() => window.print()}
            className="btn-primary flex items-center gap-2 py-2 px-4"
          >
            <Printer className="w-4 h-4" />
            Cetak PDF
          </button>
        </div>
      </div>
    </div>
  );
}
