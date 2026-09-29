# 16 — Implementation Plan

AI/junior programmer wajib mengikuti fase ini.

Jangan langsung membuat seluruh fitur sekaligus.

---

## Phase 0 — Bootstrap

- [ ] create Next.js TypeScript
- [ ] install Tailwind
- [ ] install shadcn/ui
- [ ] install Drizzle
- [ ] install PostgreSQL driver
- [ ] install Zod
- [ ] install password hashing/auth dependency
- [ ] setup env validation
- [ ] setup lint/format

Exit criteria:
- app boot;
- DB connection test;
- no secret leaked.

---

## Phase 1 — Database

- [ ] schema users
- [ ] residents
- [ ] groups
- [ ] group_members
- [ ] work_schedules
- [ ] schedule_groups
- [ ] attendances
- [ ] rotation_state
- [ ] app_settings
- [ ] migration
- [ ] seed settings
- [ ] seed admin

Exit:
- migration fresh database succeeds;
- seed succeeds.

---

## Phase 2 — Authentication

- [ ] login page
- [ ] verify password
- [ ] session
- [ ] protected layout
- [ ] logout
- [ ] change password optional/recommended

Exit:
- unauthenticated user cannot access dashboard.

---

## Phase 3 — Residents

- [ ] list
- [ ] search
- [ ] create
- [ ] edit
- [ ] activate/deactivate

Exit:
- CRUD stable;
- validation works.

---

## Phase 4 — Groups & Membership

- [ ] list groups
- [ ] create/edit group
- [ ] sequence unique
- [ ] member list
- [ ] assign resident
- [ ] move resident
- [ ] deactivate group

Exit:
- resident only one active membership.

---

## Phase 5 — Rotation

- [ ] rotation state view
- [ ] set next group
- [ ] pause
- [ ] resume
- [ ] rotation helper tests
- [ ] wrap around test

Exit:
- all rotation unit tests pass.

---

## Phase 6 — Schedule

- [ ] list schedules
- [ ] create single group
- [ ] create multiple groups
- [ ] attendance generation
- [ ] transaction
- [ ] duplicate date protection
- [ ] update rotation

Exit:
- create schedule atomic.

---

## Phase 7 — Attendance

- [ ] detail schedule
- [ ] mark present
- [ ] mark paid
- [ ] mark absent
- [ ] bulk present
- [ ] pending count
- [ ] complete schedule

Exit:
- payment consistency preserved.

---

## Phase 8 — Dashboard (COMPLETED)

- [x] today schedule
- [x] counts
- [x] next group
- [x] pause state
- [x] shortcuts

---

## Phase 9 — Reports (COMPLETED)

- [x] period summary
- [x] resident report
- [x] group report
- [x] payment report
- [x] optional CSV

---

## Phase 10 — Polish

- [ ] mobile QA
- [ ] empty state
- [ ] loading states
- [ ] error boundaries
- [ ] not found
- [ ] confirmations
- [ ] security pass

---

## Phase 11 — Deploy

- [ ] Supabase production
- [ ] migration
- [ ] seed
- [ ] Vercel env
- [ ] deploy
- [ ] smoke test
- [ ] backup plan

---

## Rule

Setelah setiap phase:
1. run lint;
2. run typecheck;
3. run tests;
4. manual smoke test;
5. commit.

Jangan menumpuk 10 fitur tanpa test.
