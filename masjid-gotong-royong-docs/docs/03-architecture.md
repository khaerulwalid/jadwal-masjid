# 03 — Architecture

## 1. Arsitektur Tingkat Tinggi

```text
Admin Browser
      |
      | HTTPS
      v
Vercel
      |
      v
Next.js App Router
      |
      | Server Components / Server Actions
      |
      v
Service Layer
      |
      v
Drizzle ORM
      |
      | PostgreSQL SSL
      v
Supabase PostgreSQL
```

---

## 2. Kenapa Tidak Ada Backend Terpisah

Kebutuhan:
- satu admin;
- CRUD sederhana;
- laporan sederhana;
- traffic rendah.

Next.js sudah cukup untuk:
- UI;
- authentication;
- server actions;
- business logic;
- query database.

Jangan menambah NestJS kecuali ada kebutuhan baru yang nyata.

---

## 3. Layering

Gunakan pola:

```text
UI
↓
Server Action
↓
Service
↓
Database
```

### UI
Tanggung jawab:
- tampilkan data;
- form;
- dialog;
- filter;
- loading state.

Tidak boleh:
- menyimpan DATABASE_URL;
- business rule kompleks;
- query database langsung dari client.

### Server Action
Tanggung jawab:
- cek session;
- parse input;
- validasi Zod;
- panggil service;
- mapping error;
- revalidate path.

### Service
Tanggung jawab:
- business rules;
- transaction;
- query orchestration;
- perhitungan rotasi.

### Database
Tanggung jawab:
- persistence;
- constraints;
- index;
- referential integrity.

---

## 4. Rendering Strategy

Default:
- gunakan Server Component untuk halaman data;
- Client Component hanya bila perlu interaksi.

Contoh Client Component:
- modal;
- searchable combobox;
- attendance row interaktif;
- confirmation dialog.

Jangan membuat seluruh dashboard `"use client"`.

---

## 5. Data Access

Gunakan Drizzle.

Contoh:
- schema di `src/db/schema`;
- client di `src/db/index.ts`;
- query kompleks tetap berada di service.

---

## 6. Connection

Production:
- koneksi PostgreSQL Supabase melalui connection string server-side;
- gunakan connection mode/pooling yang kompatibel dengan serverless deployment.

Jangan:
- membuka DB connection dari browser;
- menyimpan DB secret di `NEXT_PUBLIC_*`.

---

## 7. Authentication Boundary

Semua route berikut dilindungi:

```text
/dashboard
/masyarakat
/kelompok
/jadwal
/attendance
/laporan
/pengaturan
```

Public:
```text
/login
```

---

## 8. Transaction Boundary

Wajib transaction untuk:
- create schedule;
- assign schedule groups;
- generate attendance;
- update rotation state.

Juga gunakan transaction saat:
- memindahkan anggota kelompok jika perubahan melibatkan beberapa record.

---

## 9. Error Model

Service melempar typed/domain error seperti:
- `NotFoundError`
- `ConflictError`
- `ValidationError`
- `BusinessRuleError`

Server action mengubahnya menjadi response aman.

Jangan tampilkan raw DB error kepada admin.

---

## 10. Logging

Minimal log server:
- login gagal berulang;
- create schedule error;
- payment update error;
- unexpected exception.

Jangan log:
- plain password;
- database password;
- cookie session;
- secret.

---

## 11. Security

- HTTPS via Vercel.
- Secure cookie production.
- SameSite=Lax/Strict sesuai library.
- Password hash Argon2id atau bcrypt.
- Rate limit login ringan bila mudah diterapkan.
- Input divalidasi.
- Query parameterized melalui ORM.
- Tidak ada public registration.
