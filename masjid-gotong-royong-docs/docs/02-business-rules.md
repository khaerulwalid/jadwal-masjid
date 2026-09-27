# 02 — Business Rules

Dokumen ini berisi aturan bisnis yang wajib dipatuhi.

---

## BR-001 — Kelompok Memiliki Urutan

Setiap kelompok aktif memiliki `sequence_no` unik.

Contoh:

| Kelompok | sequence_no |
|---|---:|
| Kelompok 1 | 1 |
| Kelompok 2 | 2 |
| Kelompok 3 | 3 |

Urutan menentukan rotasi.

---

## BR-002 — Rotasi Berputar

Jika kelompok terakhir telah digunakan, rotasi kembali ke kelompok aktif dengan `sequence_no` terkecil.

Contoh:

```text
1 → 2 → 3 → 4 → 5 → 1 → 2
```

---

## BR-003 — Tidak Harus Mulai Kelompok 1

Admin boleh mengatur `next_group_id` menjadi kelompok mana pun yang aktif.

Contoh:
- next = Kelompok 4;
- jadwal berikutnya menggunakan Kelompok 4;
- setelah itu 5;
- setelah itu 1.

---

## BR-004 — Satu Jadwal Dapat Memiliki Banyak Kelompok

Satu `work_schedule` dapat terkait ke banyak `schedule_groups`.

Contoh:

```text
2026-10-10
- Kelompok 2
- Kelompok 3
```

Tidak boleh menaruh `group_id` langsung di `work_schedules`.

---

## BR-005 — Kelompok Berikutnya Setelah Multi Group

Jika satu hari memakai beberapa kelompok, next group dihitung dari kelompok dengan urutan terakhir yang dipakai.

Contoh urutan:
1,2,3,4,5,6.

Hari ini:
- 3
- 4

Maka next:
- 5

Hari ini:
- 5
- 6

Maka next:
- 1

---

## BR-006 — Urutan Kelompok dalam Jadwal

`schedule_groups.order_no` menentukan urutan kelompok yang dipakai dalam jadwal.

Jika admin memilih 4 lalu 5:
- order 1 = 4
- order 2 = 5

Untuk mode rotasi normal, group harus mengikuti sequence aktif.

---

## BR-007 — Jeda Tidak Menghapus Posisi Rotasi

Saat pause:
- `is_paused = true`;
- `next_group_id` tidak dihapus.

Resume default:
- lanjut dari `next_group_id`.

---

## BR-008 — Resume Bisa Override

Admin boleh memilih kelompok berbeda saat resume.

Contoh:
sebelum pause next = 4.

Pengurus memutuskan setelah pause mulai dari 2.

Maka:
- next_group_id = 2;
- histori lama tidak berubah.

---

## BR-009 — Satu Masyarakat Satu Kelompok Aktif

Versi pertama:
- satu masyarakat hanya memiliki satu kelompok aktif pada waktu yang sama.

Jika dipindah:
- membership lama diakhiri/dinonaktifkan;
- membership baru dibuat.

Jangan membuat masyarakat berada di dua kelompok aktif kecuali scope bisnis berubah.

---

## BR-010 — Snapshot Attendance

Saat jadwal dibuat, daftar attendance di-generate berdasarkan anggota aktif saat itu.

Jika setelah jadwal dibuat anggota dipindahkan kelompok:
- attendance jadwal lama tidak ikut berubah.

Ini penting untuk histori.

---

## BR-011 — Status Attendance

Status valid:

```text
pending
present
paid
absent
```

Arti:
- `pending`: belum dicatat;
- `present`: hadir kerja;
- `paid`: mengganti kerja dengan uang;
- `absent`: tidak hadir dan belum/ tidak membayar.

---

## BR-012 — Payment Hanya Untuk `paid`

Jika status = `paid`:
- `payment_amount > 0`;
- `payment_date` terisi.

Jika status != `paid`:
- `payment_amount = NULL`;
- `payment_date = NULL`.

---

## BR-013 — Default Payment Bukan Histori Global

Default awal:
`100000`.

Tetapi amount harus disalin ke attendance ketika ditandai `paid`.

Jangan hanya menyimpan satu setting global dan menghitung histori berdasarkan nilai terbaru.

---

## BR-014 — Jadwal Tanggal Sama

Versi pertama:
- hanya boleh ada satu `work_schedule` per tanggal.

Jika ingin beberapa kelompok, tambahkan ke `schedule_groups`, bukan membuat beberapa schedule pada tanggal sama.

Constraint:
`UNIQUE(work_date)`.

---

## BR-015 — Cancelled Schedule

Jika schedule dibatalkan:
- status = `cancelled`;
- histori schedule tetap ada;
- attendance tidak dihapus otomatis;
- laporan operasional harus bisa mengecualikan cancelled.

Jika pembatalan terjadi sebelum attendance dicatat, boleh set attendance tetap sebagai histori pending; jangan hard delete.

---

## BR-016 — Completed Schedule

Schedule dapat ditandai `completed` jika:
- tidak ada attendance `pending`, atau
- admin melakukan force complete dengan konfirmasi.

Default: jangan izinkan complete bila masih ada `pending`.

---

## BR-017 — Data Nonaktif Tidak Ikut Jadwal Baru

Masyarakat `is_active = false`:
- tidak ikut generate attendance baru.

Kelompok `is_active = false`:
- tidak ikut rotasi;
- tidak boleh dipilih sebagai next group;
- tidak boleh dipakai pada jadwal baru, kecuali mode histori read-only.

---

## BR-018 — Mengubah Sequence Group

Jika `sequence_no` diubah:
- hanya mempengaruhi jadwal/rotasi berikutnya;
- histori schedule_groups tetap.

Sistem harus memvalidasi `next_group_id` masih aktif.

---

## BR-019 — Race Condition

Saat membuat jadwal:
- lakukan dalam DB transaction;
- pastikan tanggal belum memiliki schedule;
- lock/check state rotasi bila perlu;
- jangan membuat dua jadwal untuk tanggal yang sama.

---

## BR-020 — Timezone

Gunakan timezone aplikasi:
`Asia/Makassar`.

Untuk:
- tampilan tanggal;
- timestamp manusia;
- report period.

Database timestamp gunakan `TIMESTAMPTZ`.
