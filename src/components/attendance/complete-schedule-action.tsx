"use client";

import { useState, useTransition } from "react";
import { completeScheduleAction } from "@/actions/attendance.actions";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function CompleteScheduleAction({
  scheduleId,
  pendingCount,
  disabled = false,
}: {
  scheduleId: string;
  pendingCount: number;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleComplete = () => {
    if (pendingCount > 0) {
      alert(`Masih ada ${pendingCount} masyarakat yang belum dicatat.`);
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await completeScheduleAction(scheduleId);
      if (result.success) {
        setIsConfirmOpen(false);
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <>
      <button
        onClick={handleComplete}
        disabled={isPending || disabled || pendingCount > 0}
        className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 px-4 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        title={pendingCount > 0 ? `Masih ada ${pendingCount} belum dicatat` : "Selesaikan Jadwal"}
      >
        {isPending ? "Memproses..." : "Selesaikan Jadwal"}
      </button>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Selesaikan jadwal?"
        description="Setelah diselesaikan, data kehadiran menjadi read-only dan tidak dapat diubah dari alur pencatatan."
        confirmText="Selesaikan"
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
