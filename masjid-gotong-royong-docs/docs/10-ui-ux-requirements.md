# 10 — UI/UX Requirements

## 1. Prinsip

Karena admin bisa menggunakan HP saat di lokasi pembangunan:

- mobile first;
- tombol cukup besar;
- jangan tabel lebar yang memaksa horizontal scroll;
- action penting jelas;
- konfirmasi untuk action berisiko;
- status menggunakan badge dan teks.

---

## 2. Navigation

Desktop sidebar:
- Dashboard
- Masyarakat
- Kelompok
- Jadwal
- Laporan
- Pengaturan
- Logout

Mobile:
- drawer/sidebar collapsible.

---

## 3. Dashboard

Cards:
1. Jadwal Hari Ini
2. Kelompok Hari Ini
3. Total Peserta
4. Hadir
5. Bayar
6. Belum Dicatat
7. Next Group
8. Status Rotasi

CTA:
- Buat Jadwal Hari Ini
- Buka Attendance
- Pause/Resume

---

## 4. Masyarakat

Desktop table boleh.

Mobile:
gunakan card:
```text
Ahmad
Kelompok 2
0812...
Aktif

[Lihat] [Edit]
```

Search sticky di atas.

---

## 5. Jadwal

Calendar besar tidak wajib.

List yang jelas lebih penting:
```text
27 Sep 2026
Kelompok 3 + Kelompok 4
50 peserta
45/50 sudah dicatat
Scheduled
```

---

## 6. Create Schedule

Form:
- Tanggal
- Mode: Rotasi / Manual
- Kelompok
- Judul
- Catatan

Mode Rotasi:
```text
Next group: Kelompok 3

[x] Kelompok 3
[+ Tambah kelompok berikutnya]
```

---

## 7. Attendance Mobile

Jangan tampilkan 8 kolom tabel.

Gunakan row/card:

```text
Ahmad
Kelompok 3

[Hadir] [Bayar] [Tidak Hadir]

Catatan...
```

Jika paid:
```text
Nominal: Rp100.000
Tanggal Bayar
```

---

## 8. Color

Gunakan palet profesional, tidak berlebihan.

Status harus tetap dimengerti tanpa warna:
- tampilkan label teks;
- icon optional.

---

## 9. Confirmation Dialog

Wajib:
- pause rotasi;
- resume dengan override;
- cancel schedule;
- deactivate group;
- bulk mark present;
- move resident group.

---

## 10. Toast

Gunakan untuk:
- save sukses;
- update gagal;
- warning.

Jangan hanya mengandalkan toast untuk error form; tampilkan juga inline.

---

## 11. Empty State

Contoh:
"Belum ada kelompok. Buat kelompok pertama untuk memulai rotasi."

Bukan halaman kosong.

---

## 12. Loading

Button mutasi:
- disabled;
- spinner;
- text "Menyimpan...".

Cegah double submit.
