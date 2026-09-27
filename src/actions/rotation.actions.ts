"use server";

import { requireAdmin } from "@/lib/auth/session";
import { RotationService } from "@/services/rotation.service";
import { revalidatePath } from "next/cache";
import { ActionResult } from "./resident.actions";

export async function setNextGroupAction(groupId: string): Promise<ActionResult> {
  await requireAdmin();

  if (!groupId) {
    return { success: false, message: "Pilih kelompok terlebih dahulu." };
  }

  try {
    await RotationService.setNextGroup(groupId);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat mengubah kelompok berikutnya.",
    };
  }

  revalidatePath("/pengaturan/rotasi");
  revalidatePath("/dashboard");
  return { success: true, message: "Kelompok berikutnya berhasil diubah." };
}

export async function pauseRotationAction(): Promise<ActionResult> {
  await requireAdmin();

  try {
    await RotationService.pauseRotation();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan.",
    };
  }

  revalidatePath("/pengaturan/rotasi");
  revalidatePath("/dashboard");
  return { success: true, message: "Rotasi berhasil dijeda." };
}

export async function resumeRotationAction(nextGroupId?: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await RotationService.resumeRotation(nextGroupId);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan.",
    };
  }

  revalidatePath("/pengaturan/rotasi");
  revalidatePath("/dashboard");
  return { success: true, message: "Rotasi berhasil dilanjutkan." };
}
