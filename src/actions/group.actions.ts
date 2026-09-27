"use server";

import { requireAdmin } from "@/lib/auth/session";
import { groupSchema } from "@/lib/validation/group";
import { GroupService } from "@/services/group.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ActionResult } from "./resident.actions"; // We reuse ActionResult

export async function createGroupAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const sequenceNoRaw = formData.get("sequenceNo")?.toString() || "";
  const input = {
    name: formData.get("name")?.toString() || "",
    sequenceNo: parseInt(sequenceNoRaw, 10),
  };

  const parsed = groupSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data tidak valid. Silakan periksa kembali form Anda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let newId = "";
  try {
    const group = await GroupService.createGroup(parsed.data);
    newId = group.id;
  } catch (error) {
    let message = error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data.";
    if (message.includes("unique") || message.includes("duplicate")) {
      message = "Urutan tersebut sudah digunakan kelompok lain.";
    }
    return { success: false, message };
  }

  revalidatePath("/kelompok");
  redirect(`/kelompok/${newId}`);
}

export async function updateGroupAction(
  id: string,
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const sequenceNoRaw = formData.get("sequenceNo")?.toString() || "";
  const input = {
    name: formData.get("name")?.toString() || "",
    sequenceNo: parseInt(sequenceNoRaw, 10),
  };

  const parsed = groupSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data tidak valid. Silakan periksa kembali form Anda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await GroupService.updateGroup(id, parsed.data);
  } catch (error) {
    let message = error instanceof Error ? error.message : "Terjadi kesalahan saat mengupdate data.";
    if (message.includes("unique") || message.includes("duplicate")) {
      message = "Urutan tersebut sudah digunakan kelompok lain.";
    }
    return { success: false, message };
  }

  revalidatePath("/kelompok");
  revalidatePath(`/kelompok/${id}`);
  redirect(`/kelompok/${id}`);
}

export async function setGroupActiveStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await GroupService.setGroupActiveStatus(id, isActive);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat mengubah status.",
    };
  }

  revalidatePath("/kelompok");
  revalidatePath(`/kelompok/${id}`);

  return { success: true };
}

export async function reorderGroupsAction(orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin();

  try {
    await GroupService.reorderGroups(orderedIds);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat mengurutkan kelompok.",
    };
  }

  revalidatePath("/kelompok");

  return { success: true };
}

export async function assignResidentToGroupAction(
  groupId: string,
  residentId: string
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await GroupService.assignResidentToGroup(groupId, residentId);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan.",
    };
  }

  revalidatePath("/kelompok");
  revalidatePath(`/kelompok/${groupId}`);
  revalidatePath("/masyarakat");
  revalidatePath(`/masyarakat/${residentId}`);

  return { success: true };
}

export async function moveResidentToGroupAction(
  residentId: string,
  targetGroupId: string,
  sourceGroupId: string
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await GroupService.moveResidentToGroup(residentId, targetGroupId);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan.",
    };
  }

  revalidatePath("/kelompok");
  revalidatePath(`/kelompok/${targetGroupId}`);
  revalidatePath(`/kelompok/${sourceGroupId}`);
  revalidatePath("/masyarakat");
  revalidatePath(`/masyarakat/${residentId}`);

  return { success: true };
}

export async function removeResidentFromGroupAction(
  residentId: string,
  groupId: string
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await GroupService.removeResidentFromGroup(residentId);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan.",
    };
  }

  revalidatePath("/kelompok");
  revalidatePath(`/kelompok/${groupId}`);
  revalidatePath("/masyarakat");
  revalidatePath(`/masyarakat/${residentId}`);

  return { success: true };
}
