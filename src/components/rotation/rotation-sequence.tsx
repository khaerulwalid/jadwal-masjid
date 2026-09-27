import { getNextGroups, RotationGroup } from "@/lib/rotation";

export default function RotationSequence({
  activeGroups,
  nextGroupId,
}: {
  activeGroups: RotationGroup[];
  nextGroupId: string | null;
}) {
  if (activeGroups.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <p className="text-gray-500 text-sm">Belum ada kelompok aktif untuk rotasi.</p>
      </div>
    );
  }

  // Generate preview of 4 next groups if pointer is valid
  let preview: RotationGroup[] = [];
  if (nextGroupId) {
    try {
      preview = getNextGroups(nextGroupId, activeGroups, Math.min(4, Math.max(activeGroups.length, 4)));
    } catch {
      // ignore preview if error
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Urutan Kelompok Aktif</h3>
        <p className="mt-1 text-sm text-gray-500">Urutan ini digunakan oleh sistem untuk menentukan giliran tugas.</p>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {activeGroups.map((group) => {
          const isNext = group.id === nextGroupId;
          return (
            <li key={group.id} className={`px-4 py-4 sm:px-6 ${isNext ? 'bg-blue-50 border-l-4 border-blue-500 pl-3 sm:pl-5' : ''}`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${isNext ? 'text-blue-900 font-bold' : 'text-gray-900'}`}>
                  {group.sequenceNo}. {group.name}
                </p>
                {isNext && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Berikutnya
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {preview.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Preview Jadwal Mendatang:</h4>
          <div className="flex flex-wrap gap-2">
            {preview.map((group, index) => (
              <div key={`${group.id}-${index}`} className="flex items-center">
                <span className="px-3 py-1 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 shadow-sm">
                  {group.name}
                </span>
                {index < preview.length - 1 && (
                  <svg className="h-4 w-4 text-gray-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
