"use client";

import { useState, useTransition } from "react";
import { bulkMarkPendingPresentAction } from "@/actions/attendance.actions";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function BulkPresentAction({
  scheduleId,
  pendingCount,
}: {
  scheduleId: string;
  pendingCount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (pendingCount === 0) return null;

  const handleBulk = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await bulkMarkPendingPresentAction(scheduleId);
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
        onClick={handleBulk}
        disabled={isPending}
        className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-semibold py-2 px-4 rounded-md text-sm disabled:opacity-50 w-full sm:w-auto"
      >
        {isPending ? "Memproses..." : "Tandai Semua Hadir"}
      </button>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Tandai semua hadir?"
        description={`${pendingCount} data yang belum dicatat akan diubah menjadi Hadir.`}
        confirmText="Tandai Hadir"
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
