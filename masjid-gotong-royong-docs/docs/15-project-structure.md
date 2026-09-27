# 15 — Project Structure

Struktur yang direkomendasikan:

```text
masjid-gotong-royong/
│
├── README.md
├── package.json
├── next.config.ts
├── tsconfig.json
├── drizzle.config.ts
├── .env.example
├── .gitignore
│
├── docs/
│   ├── 01-product-requirements.md
│   ├── 02-business-rules.md
│   ├── 03-architecture.md
│   ├── 04-database-design.md
│   ├── 05-authentication.md
│   ├── 06-application-modules.md
│   ├── 07-scheduling-and-rotation.md
│   ├── 08-attendance-and-payment.md
│   ├── 09-server-actions-and-services.md
│   ├── 10-ui-ux-requirements.md
│   ├── 11-reports.md
│   ├── 12-validation-error-handling.md
│   ├── 13-testing.md
│   ├── 14-deployment.md
│   ├── 15-project-structure.md
│   ├── 16-implementation-plan.md
│   └── 17-ai-implementation-instructions.md
│
├── drizzle/
│   └── migrations...
│
├── scripts/
│   └── seed.ts
│
├── src/
│   │
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── masyarakat/
│   │   │   ├── kelompok/
│   │   │   ├── jadwal/
│   │   │   ├── laporan/
│   │   │   └── pengaturan/
│   │   │
│   │   └── layout.tsx
│   │
│   ├── actions/
│   │   ├── auth.actions.ts
│   │   ├── resident.actions.ts
│   │   ├── group.actions.ts
│   │   ├── schedule.actions.ts
│   │   ├── attendance.actions.ts
│   │   └── rotation.actions.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── residents/
│   │   ├── groups/
│   │   ├── schedules/
│   │   ├── attendance/
│   │   └── reports/
│   │
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema/
│   │   │   ├── users.ts
│   │   │   ├── residents.ts
│   │   │   ├── groups.ts
│   │   │   ├── group-members.ts
│   │   │   ├── work-schedules.ts
│   │   │   ├── schedule-groups.ts
│   │   │   ├── attendances.ts
│   │   │   ├── rotation-state.ts
│   │   │   ├── app-settings.ts
│   │   │   └── index.ts
│   │   └── relations.ts
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── index.ts
│   │   │   ├── password.ts
│   │   │   └── session.ts
│   │   ├── errors/
│   │   ├── validation/
│   │   ├── money.ts
│   │   ├── date.ts
│   │   └── utils.ts
│   │
│   ├── services/
│   │   ├── resident.service.ts
│   │   ├── group.service.ts
│   │   ├── schedule.service.ts
│   │   ├── attendance.service.ts
│   │   ├── rotation.service.ts
│   │   └── report.service.ts
│   │
│   └── types/
│       └── action-result.ts
│
└── public/
```

---

## 1. Jangan Over-Engineer

Tidak perlu folder:
```text
domain/
application/
infrastructure/
repositories/
use-cases/
commands/
handlers/
```

untuk V1 kecuali kompleksitas nyata muncul.

---

## 2. Service vs Action

Action tidak boleh memuat transaction kompleks.

Contoh salah:
```ts
export async function createScheduleAction() {
  // 120 lines DB logic
}
```

Benar:
```ts
export async function createScheduleAction(input) {
  const session = await requireAdmin()
  const parsed = schema.parse(input)
  return scheduleService.create(parsed, session.userId)
}
```

---

## 3. Schema Modular

Pisahkan per tabel supaya file tidak besar.

Export semua dari:
```text
src/db/schema/index.ts
```

---

## 4. Validation

Schema Zod:
```text
src/lib/validation/resident.ts
src/lib/validation/group.ts
src/lib/validation/schedule.ts
src/lib/validation/attendance.ts
```

Boleh dibuat folder bila mulai banyak.
