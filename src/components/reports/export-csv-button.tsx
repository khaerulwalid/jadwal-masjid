"use client";

import { useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { useState } from "react";
import { getCurrentLocalDate } from "@/lib/date";

export function ExportCsvButton() {
  const searchParams = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);

  const today = getCurrentLocalDate();
  const yearMonth = today.substring(0, 7);
  const defaultStartDate = `${yearMonth}-01`;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams(searchParams);
      if (!params.has("startDate")) params.set("startDate", defaultStartDate);
      if (!params.has("endDate")) params.set("endDate", today);
      if (!params.has("status")) params.set("status", "completed");

      const url = `/api/reports/export?${params.toString()}`;
      
      // Trigger download
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Gagal mengunduh laporan");
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `laporan-gotong-royong-${params.get("startDate")}-sampai-${params.get("endDate")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
    } catch (error) {
      console.error("Export error:", error);
      alert("Terjadi kesalahan saat mengekspor laporan.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting}
      className="btn-secondary py-2 px-4 gap-2 text-sm"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {isExporting ? "Mengekspor..." : "Export CSV"}
    </button>
  );
}
