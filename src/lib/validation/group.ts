import { z } from "zod";

export const groupSchema = z.object({
  name: z
    .string()
    .min(2, "Nama kelompok minimal 2 karakter")
    .max(100, "Nama kelompok maksimal 100 karakter")
    .trim(),
  sequenceNo: z.coerce
    .number()
    .int("Urutan wajib angka bulat")
    .positive("Urutan harus lebih dari 0"),
});

export type GroupInput = z.infer<typeof groupSchema>;
