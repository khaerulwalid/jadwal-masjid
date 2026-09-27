"use client";

import { useState, useTransition } from "react";
import { cancelScheduleAction } from "@/actions/schedule.actions";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function CancelScheduleAction({
  scheduleId,
  buttonText = "Batalkan Jadwal",
  buttonClassName = "text-red-600 hover:text-red-900 text-sm font-medium",
}: {
  scheduleId: string;
  buttonText?: string;
  buttonClassName?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleCancel = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await cancelScheduleAction(scheduleId);
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
        onClick={handleCancel}
        disabled={isPending}
        className={`${buttonClassName} disabled:opacity-50`}
      >
        {isPending ? "Memproses..." : buttonText}
      </button>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Batalkan jadwal?"
        description="Membatalkan jadwal tidak mengubah posisi rotasi saat ini. Histori peserta tetap disimpan."
        confirmText="Batalkan Jadwal"
        variant="danger"
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
