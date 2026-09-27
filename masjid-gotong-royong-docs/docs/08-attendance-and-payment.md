# 08 — Attendance and Payment

## 1. Attendance Dibuat Saat Schedule Dibuat

Untuk setiap active member dari selected groups:

```text
schedule_id
resident_id
group_id snapshot
status = pending
```

---

## 2. Status Transition

Allowed:
```text
pending → present
pending → paid
pending → absent

present → paid
present → absent
paid → present
paid → absent
absent → present
absent → paid
```

Karena admin bisa salah input dan perlu koreksi.

Semua perubahan harus tervalidasi.

---

## 3. Status Paid

Saat admin klik paid:
- tampilkan nominal default;
- default dari `app_settings.default_replacement_amount`;
- admin bisa edit;
- payment date default = tanggal hari ini;
- note optional.

Save:
```text
status = paid
payment_amount = ...
payment_date = ...
marked_by = admin
marked_at = now()
```

---

## 4. Status Non-paid

Jika diubah dari `paid` ke status lain:
- payment_amount harus di-null;
- payment_date harus di-null.

Jangan meninggalkan nominal lama.

---

## 5. Bulk Present

Fitur:
"Set semua pending menjadi hadir".

Hanya update record `pending`.

Jangan override:
- paid;
- absent;
- present existing.

Pseudo:
```sql
UPDATE attendances
SET status = 'present',
    marked_by = ?,
    marked_at = now()
WHERE schedule_id = ?
  AND status = 'pending';
```

---

## 6. Pending Count

Detail jadwal harus menampilkan:
```text
Total: 50
Hadir: 42
Bayar: 5
Tidak hadir: 2
Belum dicatat: 1
```

---

## 7. Complete Schedule

Default rule:
- hanya bisa complete jika pending = 0.

Jika ada pending:
- tombol disabled atau show error.

---

## 8. Payment Audit

Minimal simpan:
- amount;
- date;
- marked_by;
- marked_at;
- notes.

Tidak perlu payment table terpisah pada V1 karena satu attendance maksimal satu replacement payment.

Jika kelak payment dapat dicicil/lebih dari sekali, baru pecah ke `payments`.

---

## 9. Currency

Database:
`numeric(12,2)`.

UI Indonesia:
`Rp100.000`.

Jangan simpan string `"Rp100.000"` ke DB.

Input:
`100000`.

---

## 10. Laporan Pembayaran

Query hanya:
```text
attendance.status = paid
```

Total:
```sql
SUM(payment_amount)
```

Exclude cancelled schedule.
