import { z } from "zod";
import { getCurrentLocalDate } from "../date";

export const reportFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["completed", "scheduled", "cancelled", "all"]).optional().default("completed"),
  groupId: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.startDate <= data.endDate;
  }
  return true;
}, {
  message: "Tanggal awal tidak boleh melebihi tanggal akhir.",
  path: ["startDate"],
});

export type ReportFilterParams = z.infer<typeof reportFilterSchema>;

export function getDefaultReportFilters(): ReportFilterParams {
  const today = getCurrentLocalDate();
  const yearMonth = today.substring(0, 7); // YYYY-MM
  const firstDayOfMonth = `${yearMonth}-01`;
  
  return {
    startDate: firstDayOfMonth,
    endDate: today,
    status: "completed",
    page: 1,
  };
}
