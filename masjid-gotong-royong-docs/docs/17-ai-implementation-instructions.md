# 17 — AI Implementation Instructions

Dokumen ini ditujukan khusus untuk AI coding model murah atau junior programmer.

## 1. Jangan Menebak

Sebelum membuat fitur:
1. baca README;
2. baca Product Requirements;
3. baca Business Rules;
4. baca dokumen fitur terkait.

Jika ada konflik:
- Business Rules lebih tinggi daripada asumsi model.

---

## 2. Jangan Mengubah Stack

Gunakan:
- Next.js App Router;
- TypeScript;
- Tailwind;
- shadcn/ui;
- Zod;
- Drizzle;
- PostgreSQL.

Jangan tiba-tiba mengganti:
- Prisma;
- MongoDB;
- Firebase;
- NestJS;
- Express;
tanpa permintaan eksplisit.

---

## 3. Jangan Over-Engineer

Sistem hanya satu admin dan traffic kecil.

Jangan membuat:
- microservices;
- event bus;
- repository abstraction berlapis-lapis;
- CQRS;
- DDD penuh;
- Redis;
- WebSocket;
- queue.

---

## 4. Database adalah Source of Integrity

Implementasikan:
- FK;
- unique;
- check;
- transaction;
- index.

Jangan hanya mengandalkan UI.

---

## 5. Server-first

Database query hanya server-side.

Jangan:
```ts
"use client"
const db = ...
```

Jangan expose:
```text
DATABASE_URL
```

---

## 6. Implementasi per Fase

Ikuti `16-implementation-plan.md`.

Selesaikan satu fase sebelum berikutnya.

---

## 7. Setiap Task Harus Menghasilkan

Untuk setiap fitur:
1. file yang dibuat/diubah;
2. code;
3. migration bila ada;
4. validation;
5. error handling;
6. test penting;
7. cara test manual.

---

## 8. Jangan Menulis Placeholder

Tidak boleh:
```ts
// TODO implement later
```

untuk bagian inti task yang diminta selesai.

Jika memang out of scope, jangan buat stub yang terlihat selesai.

---

## 9. Type Safety

Hindari:
```ts
any
```

Gunakan:
- inferred Drizzle types;
- Zod inferred types;
- explicit DTO types bila perlu.

---

## 10. Mutasi Harus Authenticated

Setiap server action:
```text
require admin
→ validate
→ service
```

Jangan percaya bahwa route UI sudah protected.

---

## 11. Transaction

Wajib ketika create schedule.

Jika AI mengimplementasikan:
```text
insert schedule
insert groups
insert attendance
update rotation
```
tanpa transaction, implementasi dianggap salah.

---

## 12. Rotasi

Jangan hitung next group hanya dengan:
```text
sequence_no + 1
```

Karena:
- sequence bisa tidak contiguous;
- group dapat nonaktif.

Selalu:
1. query active groups ordered;
2. find current;
3. next index;
4. modulo length.

---

## 13. Attendance Snapshot

Jangan resolve group histori dari current membership.

Gunakan `attendances.group_id`.

---

## 14. Paid Consistency

Jika status paid:
- amount/date required.

Jika status diubah dari paid:
- clear payment fields.

---

## 15. UI

Mobile first.

Jangan membuat desktop table 10 kolom sebagai satu-satunya UI attendance.

---

## 16. Response Saat Mengerjakan

AI harus menjelaskan ringkas:
- apa yang dibuat;
- file apa;
- kenapa;
- cara test.

Hindari penjelasan panjang yang tidak memengaruhi implementasi.

---

## 17. Definition of Done

Fitur dianggap selesai jika:
- build sukses;
- typecheck sukses;
- lint sukses;
- test relevan sukses;
- manual scenario sukses;
- sesuai docs;
- tidak bocor secret;
- responsive.
