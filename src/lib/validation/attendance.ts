import { z } from "zod";

export const updateAttendanceSchema = z.object({
  attendanceId: z.string().uuid("ID kehadiran tidak valid"),
  status: z.enum(["pending", "present", "paid", "absent"]),
  paymentAmount: z.number().nullable().optional(),
  paymentDate: z.string().nullable().optional(),
  notes: z.string().max(1000, "Catatan maksimal 1000 karakter").nullable().optional(),
}).refine(data => {
  if (data.status === "paid") {
    if (data.paymentAmount === undefined || data.paymentAmount === null || data.paymentAmount <= 0) {
      return false;
    }
    if (!data.paymentDate) {
      return false;
    }
  }
  return true;
}, {
  message: "Nominal pembayaran dan tanggal bayar wajib diisi jika status adalah Bayar",
  path: ["paymentAmount"],
});

export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
