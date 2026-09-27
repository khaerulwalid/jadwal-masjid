import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username wajib diisi")
    .max(50, "Username terlalu panjang")
    .trim(),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .max(100, "Password terlalu panjang"),
});

export type LoginInput = z.infer<typeof loginSchema>;
