import ScheduleForm from "@/components/schedules/schedule-form";
import { RotationService } from "@/services/rotation.service";
import { requireAdmin } from "@/lib/auth/session";

export default async function TambahJadwalPage() {
  await requireAdmin();
  const activeGroups = await RotationService.getActiveGroupsOrdered();
  const rotationState = await RotationService.getRotationState();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buat Jadwal Baru</h1>
        <p className="text-sm text-gray-600 mt-1">Jadwalkan kegiatan gotong royong berdasarkan rotasi atau pilih manual.</p>
      </div>

      <ScheduleForm 
        activeGroups={activeGroups} 
        nextGroup={rotationState.nextGroup} 
        isPaused={rotationState.isPaused} 
      />
    </div>
  );
}
