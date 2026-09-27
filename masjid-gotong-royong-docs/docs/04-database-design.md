# 04 — Database Design

Database: PostgreSQL.

## 1. Tabel

1. `users`
2. `residents`
3. `groups`
4. `group_members`
5. `work_schedules`
6. `schedule_groups`
7. `attendances`
8. `rotation_state`
9. `app_settings` opsional tetapi direkomendasikan untuk default payment.
10. `sessions` untuk menyimpan hash dari token session authentication.

---

## 2. users

```sql
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    username varchar(50) NOT NULL UNIQUE,
    password_hash varchar(255) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

Catatan:
- tidak ada public registration;
- dibuat via seed/admin maintenance.

---

## 3. residents

```sql
CREATE TABLE residents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(150) NOT NULL,
    phone varchar(30),
    address text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

Index:
```sql
CREATE INDEX idx_residents_name ON residents(name);
CREATE INDEX idx_residents_active ON residents(is_active);
```

---

## 4. groups

```sql
CREATE TABLE groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    sequence_no integer NOT NULL UNIQUE,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT groups_sequence_positive CHECK (sequence_no > 0)
);
```

---

## 5. group_members

Untuk histori membership lebih baik menyimpan periode aktif.

```sql
CREATE TABLE group_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid NOT NULL REFERENCES groups(id),
    resident_id uuid NOT NULL REFERENCES residents(id),
    joined_at date NOT NULL DEFAULT CURRENT_DATE,
    left_at date,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT valid_membership_period
        CHECK (left_at IS NULL OR left_at >= joined_at)
);
```

Aturan aplikasi:
- satu resident hanya satu membership dengan `left_at IS NULL`.

PostgreSQL dapat diberi partial unique index:

```sql
CREATE UNIQUE INDEX uq_group_members_active_resident
ON group_members(resident_id)
WHERE left_at IS NULL;
```

Index:
```sql
CREATE INDEX idx_group_members_group_active
ON group_members(group_id)
WHERE left_at IS NULL;
```

---

## 6. work_schedules

```sql
CREATE TABLE work_schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    work_date date NOT NULL UNIQUE,
    title varchar(150),
    notes text,
    status varchar(20) NOT NULL DEFAULT 'scheduled',
    created_by uuid REFERENCES users(id),
    completed_at timestamptz,
    cancelled_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT work_schedule_status_check
    CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);
```

Index:
```sql
CREATE INDEX idx_work_schedules_date ON work_schedules(work_date);
CREATE INDEX idx_work_schedules_status ON work_schedules(status);
```

---

## 7. schedule_groups

```sql
CREATE TABLE schedule_groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id uuid NOT NULL
        REFERENCES work_schedules(id)
        ON DELETE CASCADE,
    group_id uuid NOT NULL REFERENCES groups(id),
    order_no integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT schedule_group_order_positive CHECK (order_no > 0),
    CONSTRAINT uq_schedule_group UNIQUE (schedule_id, group_id),
    CONSTRAINT uq_schedule_order UNIQUE (schedule_id, order_no)
);
```

---

## 8. attendances

```sql
CREATE TABLE attendances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    schedule_id uuid NOT NULL
        REFERENCES work_schedules(id)
        ON DELETE CASCADE,

    resident_id uuid NOT NULL REFERENCES residents(id),

    group_id uuid NOT NULL REFERENCES groups(id),

    status varchar(20) NOT NULL DEFAULT 'pending',

    payment_amount numeric(12,2),
    payment_date date,

    notes text,

    marked_by uuid REFERENCES users(id),
    marked_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT attendance_status_check
    CHECK (status IN ('pending','present','paid','absent')),

    CONSTRAINT payment_amount_positive
    CHECK (
        payment_amount IS NULL
        OR payment_amount > 0
    ),

    CONSTRAINT attendance_payment_consistency
    CHECK (
        (
            status = 'paid'
            AND payment_amount IS NOT NULL
            AND payment_date IS NOT NULL
        )
        OR
        (
            status <> 'paid'
            AND payment_amount IS NULL
            AND payment_date IS NULL
        )
    ),

    CONSTRAINT uq_attendance_schedule_resident
    UNIQUE(schedule_id, resident_id)
);
```

Index:
```sql
CREATE INDEX idx_attendance_schedule
ON attendances(schedule_id);

CREATE INDEX idx_attendance_resident
ON attendances(resident_id);

CREATE INDEX idx_attendance_group
ON attendances(group_id);

CREATE INDEX idx_attendance_status
ON attendances(status);

CREATE INDEX idx_attendance_payment_date
ON attendances(payment_date)
WHERE status = 'paid';
```

---

## 9. rotation_state

Hanya satu row.

```sql
CREATE TABLE rotation_state (
    id smallint PRIMARY KEY DEFAULT 1,
    next_group_id uuid REFERENCES groups(id),
    is_paused boolean NOT NULL DEFAULT false,
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT single_rotation_state CHECK (id = 1)
);
```

Seed:
```sql
INSERT INTO rotation_state (id, next_group_id, is_paused)
VALUES (1, NULL, false)
ON CONFLICT (id) DO NOTHING;
```

`next_group_id` boleh NULL saat kelompok belum dibuat.

---

## 10. sessions

Digunakan untuk menyimpan status login (authentication). Token session asli (raw token) hanya dikirim dan disimpan sebagai cookie di browser, sedangkan database hanya menyimpan hash SHA-256 dari token tersebut.

```sql
CREATE TABLE sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash varchar(64) NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    last_seen_at timestamptz
);
```

Index:
```sql
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

---

## 11. app_settings

Direkomendasikan agar nominal default tidak hardcode di banyak tempat.

```sql
CREATE TABLE app_settings (
    id smallint PRIMARY KEY DEFAULT 1,
    default_replacement_amount numeric(12,2)
        NOT NULL DEFAULT 100000,
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT single_app_settings CHECK (id = 1),
    CONSTRAINT default_replacement_amount_positive
        CHECK (default_replacement_amount > 0)
);
```

Seed:
```sql
INSERT INTO app_settings (id, default_replacement_amount)
VALUES (1, 100000)
ON CONFLICT (id) DO NOTHING;
```

---

## 12. Relasi

```text
users
 ├── work_schedules.created_by
 └── attendances.marked_by

residents
 ├── group_members
 └── attendances

groups
 ├── group_members
 ├── schedule_groups
 ├── attendances
 └── rotation_state.next_group_id

work_schedules
 ├── schedule_groups
 └── attendances
```

---

## 13. Kenapa attendance Menyimpan group_id

Walaupun resident dapat dicari membership-nya, `attendances.group_id` tetap disimpan sebagai snapshot.

Contoh:
- Ahmad dulu Kelompok 1;
- setelah 3 bulan pindah Kelompok 2.

Attendance lama harus tetap menunjukkan bahwa pada jadwal tersebut Ahmad hadir sebagai anggota Kelompok 1.

---

## 14. Soft Delete

Versi pertama:
- gunakan `is_active` untuk residents/groups;
- jangan hard delete data yang sudah memiliki histori.

Jika record belum pernah digunakan, hard delete boleh dipertimbangkan, tetapi default UI sebaiknya "Nonaktifkan".

---

## 15. Drizzle Schema

Implementasi Drizzle harus merefleksikan constraint SQL di atas.

Jangan hanya mengandalkan Zod.

---

## 16. Migration

Gunakan migration file.

Jangan:
- edit production database manual tanpa migration;
- memakai `db push` sembarangan pada production.

Flow:
```text
ubah schema
→ generate migration
→ review SQL
→ apply migration
→ deploy
```
