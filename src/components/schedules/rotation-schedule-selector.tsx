"use client";

import { useState } from "react";
import { getNextGroups, RotationGroup } from "@/lib/rotation";

export default function RotationScheduleSelector({
  activeGroups,
  nextGroup,
}: {
  activeGroups: RotationGroup[];
  nextGroup: RotationGroup | null;
}) {
  const [count, setCount] = useState(1);

  if (!nextGroup) {
    return null; // Handled by parent
  }

  const maxCount = activeGroups.length;
  
  let preview: RotationGroup[] = [];
  try {
    preview = getNextGroups(nextGroup.id, activeGroups, count);
  } catch {
    // Should not happen as we validated activeGroups in parent
  }

  return (
    <div className="space-y-4 bg-blue-50 p-4 rounded-md border border-blue-100">
      <h3 className="text-sm font-medium text-blue-900">Pengaturan Mode Rotasi</h3>
      
      <div>
        <label htmlFor="groupCount" className="block text-sm font-medium text-gray-700 mb-1">
          Jumlah Kelompok <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center space-x-3">
          <input
            id="groupCount"
            name="groupCount"
            type="number"
            min="1"
            max={maxCount}
            value={count}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 1 && val <= maxCount) {
                setCount(val);
              }
            }}
            required
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <span className="text-sm text-gray-500">(Maksimal {maxCount} kelompok)</span>
        </div>
      </div>

      <div className="pt-2">
        <p className="text-sm font-medium text-gray-700 mb-2">Preview Kelompok yang Akan Bertugas:</p>
        <ul className="space-y-1">
          {preview.map((g, idx) => (
            <li key={`${g.id}-${idx}`} className="text-sm text-gray-800 flex items-center">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs mr-2 font-bold">
                {idx + 1}
              </span>
              {g.sequenceNo}. {g.name}
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          Rotasi akan maju secara otomatis setelah jadwal berhasil dibuat.
        </p>
      </div>
    </div>
  );
}
