"use server";

import { requireAdmin } from "@/lib/auth/session";
import { residentSchema } from "@/lib/validation/resident";
import { ResidentService } from "@/services/resident.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult<T = undefined> =
  | {
      success: true;
      data?: T;
      message?: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export async function createResidentAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const input = {
    name: formData.get("name")?.toString() || "",
    phone: formData.get("phone")?.toString() || "",
    address: formData.get("address")?.toString() || "",
  };

  const parsed = residentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data tidak valid. Silakan periksa kembali form Anda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let newId = "";
  try {
    const resident = await ResidentService.createResident(parsed.data);
    newId = resident.id;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data.",
    };
  }

  revalidatePath("/masyarakat");
  redirect(`/masyarakat/${newId}`);
}

export async function updateResidentAction(
  id: string,
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const input = {
    name: formData.get("name")?.toString() || "",
    phone: formData.get("phone")?.toString() || "",
    address: formData.get("address")?.toString() || "",
  };

  const parsed = residentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data tidak valid. Silakan periksa kembali form Anda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await ResidentService.updateResident(id, parsed.data);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat mengupdate data.",
    };
  }

  revalidatePath("/masyarakat");
  revalidatePath(`/masyarakat/${id}`);
  redirect(`/masyarakat/${id}`);
}

export async function setResidentActiveStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await ResidentService.setResidentActiveStatus(id, isActive);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat mengubah status.",
    };
  }

  revalidatePath("/masyarakat");
  revalidatePath(`/masyarakat/${id}`);

  return {
    success: true,
  };
}
