"use server";

import { requireAdmin } from "@/lib/auth/session";
import { AttendanceService } from "@/services/attendance.service";
import { updateAttendanceSchema } from "@/lib/validation/attendance";
import { revalidatePath } from "next/cache";

export async function updateAttendanceAction(
  scheduleId: string,
  formData: FormData
) {
  try {
    const user = await requireAdmin();

    const attendanceId = formData.get("attendanceId")?.toString() || "";
    const status = formData.get("status")?.toString();
    
    let paymentAmount: number | undefined = undefined;
    const amountStr = formData.get("paymentAmount")?.toString();
    if (amountStr) {
      paymentAmount = parseFloat(amountStr);
    }
    
    const paymentDate = formData.get("paymentDate")?.toString() || undefined;
    const notes = formData.get("notes")?.toString() || undefined;

    const validated = updateAttendanceSchema.parse({
      attendanceId,
      status,
      paymentAmount,
      paymentDate,
      notes,
    });

    await AttendanceService.updateAttendance(validated, user.id);

    revalidatePath(`/jadwal/${scheduleId}`);
    revalidatePath("/jadwal");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return { success: false, message: (error as Error & { errors: { message: string }[] }).errors[0].message };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengubah status kehadiran.",
    };
  }
}

export async function bulkMarkPendingPresentAction(scheduleId: string) {
  try {
    const user = await requireAdmin();
    
    await AttendanceService.bulkMarkPendingPresent(scheduleId, user.id);
    
    revalidatePath(`/jadwal/${scheduleId}`);
    revalidatePath("/jadwal");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menandai semua kehadiran.",
    };
  }
}

export async function completeScheduleAction(scheduleId: string) {
  try {
    const user = await requireAdmin();
    
    await AttendanceService.completeSchedule(scheduleId, user.id);
    
    revalidatePath(`/jadwal/${scheduleId}`);
    revalidatePath("/jadwal");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menyelesaikan jadwal.",
    };
  }
}
