# 09 — Server Actions and Services

## 1. Aturan Umum

Server Action:
- auth check;
- Zod;
- call service;
- response.

Service:
- business logic;
- DB transaction;
- domain error.

---

## 2. Naming

Server actions:
```text
createResidentAction
updateResidentAction
deactivateResidentAction

createGroupAction
updateGroupAction
moveResidentGroupAction

createScheduleAction
cancelScheduleAction
completeScheduleAction

updateAttendanceAction
bulkMarkPresentAction

pauseRotationAction
resumeRotationAction
setNextGroupAction
```

Services:
```text
residentService
groupService
scheduleService
attendanceService
rotationService
reportService
```

---

## 3. Action Result

Standard:

```ts
type ActionResult<T = undefined> =
  | {
      success: true
      data?: T
    }
  | {
      success: false
      message: string
      fieldErrors?: Record<string, string[]>
    }
```

---

## 4. createScheduleAction

Input:
```ts
{
  workDate: string
  title?: string
  notes?: string
  groupIds: string[]
  advanceRotation?: boolean
}
```

Validation:
- valid ISO date;
- groupIds min 1;
- no duplicates;
- all UUID;
- title max;
- notes max reasonable.

Service:
- transaction;
- uniqueness;
- groups active;
- insert schedule;
- insert groups;
- generate attendance;
- update rotation.

---

## 5. updateAttendanceAction

Input:
```ts
{
  attendanceId: string
  status: "pending" | "present" | "paid" | "absent"
  paymentAmount?: number
  paymentDate?: string
  notes?: string
}
```

Rules:
if paid:
- amount required > 0;
- date required.

else:
- ignore/clear payment fields.

---

## 6. moveResidentGroupAction

Input:
```ts
{
  residentId: string
  targetGroupId: string
  effectiveDate?: string
}
```

Transaction:
- find active membership;
- set left_at;
- insert new membership.

Tidak mengubah attendance lama.

---

## 7. Queries

Gunakan query server untuk read.

Tidak semua read perlu Server Action.

Server Component dapat:
```ts
const data = await reportService.getDashboard()
```

---

## 8. Revalidation

Setelah mutasi:
- `revalidatePath()` route yang relevan.

Contoh:
create schedule:
- `/jadwal`
- `/dashboard`

attendance:
- `/jadwal/[id]`
- `/dashboard`
- `/laporan`

---

## 9. Error

Mapping:
- NotFound → "Data tidak ditemukan."
- Conflict → "Data sudah ada atau bertabrakan."
- BusinessRule → pesan aman spesifik.
- DB unknown → "Terjadi kesalahan. Silakan coba lagi."

Log raw error di server.
