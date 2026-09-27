import { z } from "zod";

const baseScheduleSchema = z.object({
  workDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)"),
  title: z.string().max(150, "Judul maksimal 150 karakter").optional(),
  notes: z.string().max(1000, "Catatan maksimal 1000 karakter").optional(),
});

export const rotationScheduleSchema = baseScheduleSchema.extend({
  mode: z.literal("rotation"),
  groupCount: z.coerce
    .number()
    .int("Jumlah kelompok harus angka bulat")
    .positive("Jumlah kelompok minimal 1"),
});

export const manualScheduleSchema = baseScheduleSchema.extend({
  mode: z.literal("manual"),
  groupIds: z
    .array(z.string().uuid("ID kelompok tidak valid"))
    .min(1, "Pilih minimal 1 kelompok")
    .refine((ids) => new Set(ids).size === ids.length, "Terdapat kelompok duplikat"),
  advanceRotation: z.boolean().default(false),
});

export const scheduleSchema = z.discriminatedUnion("mode", [
  rotationScheduleSchema,
  manualScheduleSchema,
]);

export type RotationScheduleInput = z.infer<typeof rotationScheduleSchema>;
export type ManualScheduleInput = z.infer<typeof manualScheduleSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
