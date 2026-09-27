"use client";

import { useState, useTransition } from "react";
import { updateAttendanceAction } from "@/actions/attendance.actions";
import PaymentDialog from "./payment-dialog";

export default function AttendanceStatusActions({
  attendanceId,
  scheduleId,
  residentName,
  currentStatus,
  defaultAmount,
  disabled = false,
}: {
  attendanceId: string;
  scheduleId: string;
  residentName: string;
  currentStatus: string;
  defaultAmount: number;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [showPayment, setShowPayment] = useState(false);

  const handleUpdate = (status: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("attendanceId", attendanceId);
      formData.append("status", status);
      
      const result = await updateAttendanceAction(scheduleId, formData);
      if (!result.success) {
        alert(result.message);
      }
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleUpdate("present")}
          disabled={isPending || disabled || currentStatus === "present"}
          className={`px-3 py-1 text-sm font-medium rounded-md border ${
            currentStatus === "present"
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          } disabled:opacity-50`}
        >
          Hadir
        </button>
        <button
          onClick={() => setShowPayment(true)}
          disabled={isPending || disabled || currentStatus === "paid"}
          className={`px-3 py-1 text-sm font-medium rounded-md border ${
            currentStatus === "paid"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          } disabled:opacity-50`}
        >
          Bayar
        </button>
        <button
          onClick={() => handleUpdate("absent")}
          disabled={isPending || disabled || currentStatus === "absent"}
          className={`px-3 py-1 text-sm font-medium rounded-md border ${
            currentStatus === "absent"
              ? "bg-red-100 text-red-800 border-red-200"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          } disabled:opacity-50`}
        >
          Tidak Hadir
        </button>
      </div>

      {showPayment && (
        <PaymentDialog
          attendanceId={attendanceId}
          scheduleId={scheduleId}
          residentName={residentName}
          defaultAmount={defaultAmount}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}
