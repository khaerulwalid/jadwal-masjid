# 12 — Validation and Error Handling

## 1. Tiga Lapisan

1. Form UX validation.
2. Server Zod validation.
3. Database constraints.

Server dan DB adalah authoritative.

---

## 2. Resident

Name:
- required;
- trim;
- 2-150 char.

Phone:
- optional;
- trim;
- max 30.

Address:
- optional;
- reasonable max, misal 1000.

---

## 3. Group

Name:
- required;
- max 100.

Sequence:
- integer;
- > 0;
- unique.

---

## 4. Schedule

workDate:
- valid date;
- unique.

groupIds:
- array;
- min 1;
- unique;
- active group.

---

## 5. Attendance

status enum.

paid:
- amount positive;
- payment date valid.

non-paid:
- payment field cleared.

---

## 6. Error Messages

Gunakan bahasa mudah.

Baik:
- "Tanggal ini sudah memiliki jadwal."
- "Kelompok yang dipilih sudah tidak aktif."
- "Nominal pembayaran harus lebih dari Rp0."

Buruk:
- `duplicate key value violates unique constraint ...`

---

## 7. Not Found

Jika URL ID tidak ditemukan:
- tampilkan 404/not found.

Jangan crash.

---

## 8. Optimistic UI

Tidak diperlukan pada V1 untuk action kritikal.

Lebih aman:
- submit;
- tunggu server;
- refresh/revalidate.

---

## 9. Idempotency Sederhana

Create schedule:
- unique work_date mencegah duplicate.

Double click:
- button disable;
- DB constraint tetap melindungi.
