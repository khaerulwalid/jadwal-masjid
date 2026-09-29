"use server";

import { requireAdmin, validateSession } from "@/lib/auth/session";
import { scheduleSchema, ScheduleInput, BatchScheduleInput } from "@/lib/validation/schedule";
import { ScheduleService } from "@/services/schedule.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ActionResult } from "./resident.actions";

export async function createScheduleAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await validateSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  await requireAdmin();

  const mode = formData.get("mode")?.toString();
  const workDate = formData.get("workDate")?.toString() || "";
  const title = formData.get("title")?.toString() || "";
  const notes = formData.get("notes")?.toString() || "";

  const input: Record<string, unknown> = { mode, workDate, title, notes };

  if (mode === "rotation") {
    input.groupCount = parseInt(formData.get("groupCount")?.toString() || "1", 10);
  } else if (mode === "manual") {
    // Collect all groupIds
    const groupIds = formData.getAll("groupIds").map((v) => v.toString());
    input.groupIds = groupIds;
    input.advanceRotation = formData.get("advanceRotation") === "on";
  } else if (mode === "batch") {
    input.groupsPerDay = parseInt(formData.get("groupsPerDay")?.toString() || "1", 10);
    input.startGroupId = formData.get("startGroupId")?.toString() || "";
  }

  const parsed = scheduleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data tidak valid. Silakan periksa kembali form Anda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let newId = "";
  let message = "";
  try {
    if (parsed.data.mode === "batch") {
      const count = await ScheduleService.createBatchSchedule(parsed.data as BatchScheduleInput, session.user.id);
      message = `Berhasil membuat ${count} jadwal secara berurutan.`;
    } else {
      newId = await ScheduleService.createSchedule(parsed.data as ScheduleInput, session.user.id);
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat membuat jadwal.",
    };
  }

  revalidatePath("/jadwal");
  revalidatePath("/dashboard");
  revalidatePath("/pengaturan/rotasi");
  
  if (parsed.data.mode === "batch") {
    redirect(`/jadwal`);
  }
  
  redirect(`/jadwal/${newId}`);
}

export async function cancelScheduleAction(scheduleId: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await ScheduleService.cancelSchedule(scheduleId);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat membatalkan jadwal.",
    };
  }

  revalidatePath("/jadwal");
  revalidatePath(`/jadwal/${scheduleId}`);
  revalidatePath("/dashboard");
  return { success: true, message: "Jadwal berhasil dibatalkan." };
}
