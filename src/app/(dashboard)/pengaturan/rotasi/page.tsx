import { RotationService } from "@/services/rotation.service";
import RotationStatus from "@/components/rotation/rotation-status";
import RotationSequence from "@/components/rotation/rotation-sequence";

export default async function RotationSettingsPage() {
  const rotationState = await RotationService.getRotationState();
  const activeGroups = await RotationService.getActiveGroupsOrdered();

  // Handle edge case where nextGroup is pointing to an inactive or deleted group.
  // The service already handles deleted/inactive gracefully by returning nextGroup = null if not active.
  
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Rotasi</h1>
        <p className="text-sm text-gray-600 mt-1">Kelola perputaran jadwal gotong royong antar kelompok.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <RotationStatus 
            isPaused={rotationState.isPaused}
            nextGroup={rotationState.nextGroup}
            activeGroups={activeGroups}
          />
        </div>
        
        <div className="md:col-span-1">
          <RotationSequence 
            activeGroups={activeGroups}
            nextGroupId={rotationState.nextGroup?.id || null}
          />
        </div>
      </div>
    </div>
  );
}
