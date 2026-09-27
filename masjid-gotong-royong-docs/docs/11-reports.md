# 11 — Reports

## 1. Laporan Periode

Input:
- startDate;
- endDate.

Output:
- jumlah jadwal;
- jumlah attendance;
- present;
- paid;
- absent;
- pending;
- total uang pengganti.

Exclude:
- cancelled schedules.

---

## 2. Laporan Masyarakat

Filter resident.

Tampilkan:
- total terjadwal;
- total hadir;
- total bayar;
- total tidak hadir;
- total uang;
- riwayat tanggal.

---

## 3. Laporan Kelompok

Per group:
- jumlah jadwal;
- jumlah anggota terjadwal;
- present;
- paid;
- absent;
- attendance rate.

Attendance rate:
```text
present / (present + paid + absent)
```

Catatan:
`paid` bukan hadir fisik.

Jika ingin participation settlement:
```text
(present + paid) / completed attendance
```

Jangan mencampur kedua metrik tanpa label.

---

## 4. Laporan Pembayaran

Columns:
- tanggal kerja;
- tanggal bayar;
- nama;
- kelompok;
- amount;
- note;
- marked by.

Summary:
- jumlah orang membayar;
- total amount.

---

## 5. Export

V1 optional:
- CSV.

Jika implementasi export:
- data harus mengikuti filter;
- amount sebagai angka;
- encoding UTF-8.

PDF bukan requirement awal.

---

## 6. Date Filter

Default:
- bulan berjalan.

Preset:
- hari ini;
- 7 hari;
- bulan ini;
- custom.

---

## 7. Query Rules

Semua report:
- schedule cancelled tidak dihitung kecuali user memilih "include cancelled";
- timezone display Asia/Makassar;
- date boundary menggunakan `work_date`.
