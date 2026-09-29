"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createScheduleAction } from "@/actions/schedule.actions";
import Link from "next/link";
import RotationScheduleSelector from "./rotation-schedule-selector";
import ManualGroupSelector from "./manual-group-selector";
import BatchGroupSelector from "./batch-group-selector";
import { RotationGroup } from "@/lib/rotation";
import { getCurrentLocalDate } from "@/lib/date";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
    >
      {pending ? "Menyimpan..." : "Simpan Jadwal"}
    </button>
  );
}

export default function ScheduleForm({
  activeGroups,
  nextGroup,
  isPaused,
}: {
  activeGroups: RotationGroup[];
  nextGroup: RotationGroup | null;
  isPaused: boolean;
}) {
  const [state, action] = useActionState(createScheduleAction, null);
  const [mode, setMode] = useState<"rotation" | "manual" | "batch">("batch");
  
  const todayDate = getCurrentLocalDate().split('T')[0];

  return (
    <form action={action} className="space-y-6 max-w-3xl bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {state?.success === false && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm whitespace-pre-wrap">
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="workDate" className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Kegiatan <span className="text-red-500">*</span>
          </label>
          <input
            id="workDate"
            name="workDate"
            type="date"
            defaultValue={todayDate}
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {state?.success === false && state.fieldErrors?.workDate && (
            <p className="mt-1 text-sm text-red-500">{state.fieldErrors.workDate[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mode Penjadwalan <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col space-y-2 mt-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                value="batch"
                checked={mode === "batch"}
                onChange={() => setMode("batch")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-900">Mode Generate Otomatis (Batch)</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                value="rotation"
                checked={mode === "rotation"}
                onChange={() => setMode("rotation")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                disabled={isPaused || !nextGroup}
              />
              <span className={`ml-2 text-sm ${isPaused || !nextGroup ? 'text-gray-400' : 'text-gray-900'}`}>Mode Rotasi</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                value="manual"
                checked={mode === "manual"}
                onChange={() => setMode("manual")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-900">Mode Manual</span>
            </label>
            </div>
          </div>
          {(isPaused || !nextGroup) && (
            <p className="mt-1 text-xs text-yellow-600">
              Mode Rotasi dinonaktifkan karena {isPaused ? "rotasi sedang dijeda" : "kelompok berikutnya belum ditentukan"}.
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        {mode === "batch" ? (
          <BatchGroupSelector activeGroups={activeGroups} />
        ) : mode === "rotation" ? (
          <RotationScheduleSelector activeGroups={activeGroups} nextGroup={nextGroup} />
        ) : (
          <ManualGroupSelector activeGroups={activeGroups} />
        )}
      </div>

      <div className="border-t border-gray-200 pt-6 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Judul Kegiatan (Opsional)
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Contoh: Gotong Royong Pembersihan Area Parkir"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {state?.success === false && state.fieldErrors?.title && (
            <p className="mt-1 text-sm text-red-500">{state.fieldErrors.title[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Catatan (Opsional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Instruksi khusus atau catatan tambahan..."
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {state?.success === false && state.fieldErrors?.notes && (
            <p className="mt-1 text-sm text-red-500">{state.fieldErrors.notes[0]}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-t border-gray-200 pt-6">
        <SubmitButton />
        <Link
          href="/jadwal"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md text-center"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
