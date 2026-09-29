"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Printer, Calendar } from "lucide-react";

export function PrintScheduleClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentStart = searchParams.get("start") || "";
  const currentEnd = searchParams.get("end") || "";

  const [startDate, setStartDate] = useState(currentStart);
  const [endDate, setEndDate] = useState(currentEnd);

  const applyFilter = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    
    const params = new URLSearchParams(searchParams.toString());
    if (start) params.set("start", start);
    else params.delete("start");
    
    if (end) params.set("end", end);
    else params.delete("end");
    
    router.push(`?${params.toString()}`);
  };

  const setShortcut = (days: number) => {
    // Assuming Asia/Makassar logic, we just use simple local date formatting for the shortcut
    const today = new Date();
    // adjust to Makassar roughly for simple shortcuts (GMT+8)
    const makassarTime = new Date(today.getTime() + (8 * 60 * 60 * 1000));
    
    const startStr = makassarTime.toISOString().split('T')[0];
    
    const futureTime = new Date(makassarTime.getTime() + (days * 24 * 60 * 60 * 1000));
    const endStr = futureTime.toISOString().split('T')[0];
    
    applyFilter(startStr, endStr);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 print:hidden">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
        <div className="flex-1 max-w-2xl">
          <label className="block text-sm font-medium text-slate-700 mb-1">Rentang Tanggal</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto text-sm rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-slate-500">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-auto text-sm rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => applyFilter(startDate, endDate)}
              className="btn-secondary py-2 px-4"
            >
              Filter
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex flex-wrap gap-2 mr-0 sm:mr-4">
            <button
              onClick={() => setShortcut(7)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              1 Mgg Kedepan
            </button>
            <button
              onClick={() => setShortcut(14)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              2 Mgg Kedepan
            </button>
          </div>
          
          <button
            onClick={handlePrint}
            className="btn-primary flex items-center gap-2 py-2 px-4"
          >
            <Printer className="w-4 h-4" />
            Cetak
          </button>
        </div>
      </div>
    </div>
  );
}
