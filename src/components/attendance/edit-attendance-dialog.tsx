"use client";

import { useState, useTransition } from "react";
import { updateAttendanceAction } from "@/actions/attendance.actions";
import { AttendanceItem } from "./attendance-list";

export default function EditAttendanceDialog({
  scheduleId,
  attendance,
  defaultAmount,
  onClose,
}: {
  scheduleId: string;
  attendance: AttendanceItem;
  defaultAmount: number;
  onClose: () => void;
}) {
  const [status, setStatus] = useState(attendance.status);
  const [amount, setAmount] = useState(attendance.paymentAmount || defaultAmount.toString());
  const [date, setDate] = useState(attendance.paymentDate || new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Makassar" }));
  const [notes, setNotes] = useState(attendance.notes || "");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("attendanceId", attendance.id);
      formData.append("status", status);
      
      if (status === "paid") {
        const numAmount = parseInt(amount, 10);
        if (isNaN(numAmount) || numAmount <= 0) {
          alert("Nominal pembayaran harus lebih dari Rp0.");
          return;
        }
        if (!date) {
          alert("Tanggal pembayaran wajib diisi.");
          return;
        }
        formData.append("paymentAmount", numAmount.toString());
        formData.append("paymentDate", date);
      }
      
      if (notes) formData.append("notes", notes);

      const result = await updateAttendanceAction(scheduleId, formData);
      if (result.success) {
        onClose();
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={!isPending ? onClose : undefined} aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
              Ubah Status Kehadiran
            </h3>
            
            <p className="text-sm text-gray-500 mb-4">
              Masyarakat: <span className="font-semibold text-gray-900">{attendance.resident.name}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="pending">Belum Dicatat</option>
                  <option value="present">Hadir</option>
                  <option value="paid">Bayar</option>
                  <option value="absent">Tidak Hadir</option>
                </select>
              </div>

              {status === "paid" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nominal *</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Rp</span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Bayar *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Opsional"
                  maxLength={1000}
                />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
