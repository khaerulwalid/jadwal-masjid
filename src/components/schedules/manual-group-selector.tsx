"use client";

import { useState } from "react";
import { RotationGroup, getNextActiveGroup } from "@/lib/rotation";

export default function ManualGroupSelector({
  activeGroups,
}: {
  activeGroups: RotationGroup[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [advanceRotation, setAdvanceRotation] = useState(false);

  const toggleGroup = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((g) => g !== id);
      }
      return [...prev, id];
    });
  };



  let nextPointerPreview: RotationGroup | null = null;
  if (advanceRotation && selectedIds.length > 0) {
    const lastId = selectedIds[selectedIds.length - 1];
    try {
      nextPointerPreview = getNextActiveGroup(lastId, activeGroups);
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-md border border-gray-200">
      <h3 className="text-sm font-medium text-gray-900">Pengaturan Mode Manual</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pilih Kelompok (Urutan pilihan menentukan urutan tugas) <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2 bg-white">
          {activeGroups.map((group) => {
            const isSelected = selectedIds.includes(group.id);
            const selectionIndex = selectedIds.indexOf(group.id);
            
            return (
              <label
                key={group.id}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer border ${
                  isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-transparent"
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleGroup(group.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {group.sequenceNo}. {group.name}
                  </span>
                </div>
                {isSelected && (
                  <span className="text-xs font-bold bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full">
                    {selectionIndex + 1}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Hidden inputs to submit the array in order */}
      {selectedIds.map((id) => (
        <input key={`hidden-${id}`} type="hidden" name="groupIds" value={id} />
      ))}

      <div className="pt-2 border-t border-gray-200 mt-4">
        <label className="flex items-start mt-2">
          <input
            type="checkbox"
            name="advanceRotation"
            checked={advanceRotation}
            onChange={(e) => setAdvanceRotation(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
          />
          <div className="ml-2">
            <span className="text-sm font-medium text-gray-900">Majukan pointer rotasi setelah jadwal ini</span>
            <p className="text-xs text-gray-500 mt-1">
              Jika dicentang, sistem akan menggeser giliran kelompok berikutnya ke kelompok setelah pilihan terakhir Anda.
            </p>
          </div>
        </label>

        {nextPointerPreview && (
          <div className="mt-3 text-sm bg-blue-50 p-2 rounded text-blue-800 border border-blue-100">
            <strong>Preview:</strong> Kelompok rotasi berikutnya akan menjadi: {nextPointerPreview.sequenceNo}. {nextPointerPreview.name}
          </div>
        )}
      </div>
    </div>
  );
}
