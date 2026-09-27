import { z } from "zod";

export const residentSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(150, "Nama maksimal 150 karakter")
    .trim(),
  phone: z
    .string()
    .max(30, "Nomor HP maksimal 30 karakter")
    .trim()
    .optional()
    .transform(val => (val === "" ? undefined : val)),
  address: z
    .string()
    .max(1000, "Alamat maksimal 1000 karakter")
    .trim()
    .optional()
    .transform(val => (val === "" ? undefined : val)),
});

export type ResidentInput = z.infer<typeof residentSchema>;
