# 06 — Application Modules

## 1. Dashboard

Menampilkan:
- tanggal hari ini;
- status rotasi: aktif/pause;
- next group;
- jadwal hari ini;
- jumlah peserta hari ini;
- present;
- paid;
- absent;
- pending;
- total pembayaran periode berjalan;
- shortcut.

---

## 2. Masyarakat

Route:
```text
/masyarakat
/masyarakat/tambah
/masyarakat/[id]
```

Fitur:
- list;
- search nama/HP;
- filter aktif/nonaktif;
- create;
- edit;
- nonaktifkan;
- lihat kelompok aktif;
- lihat ringkasan histori.

*Catatan Implementasi (Phase 3): Default filter masyarakat adalah "Aktif" untuk menyesuaikan dengan kebutuhan operasional sehari-hari.*

Kolom list:
- nama;
- HP;
- kelompok;
- status;
- action.

---

## 3. Kelompok

Route:
```text
/kelompok
/kelompok/[id]
```

List:
- nama;
- urutan;
- jumlah anggota aktif;
- status;
- action.

Detail:
- daftar anggota;
- tambah anggota;
- pindahkan anggota;
- hapus membership;
- ubah sequence.

---

## 4. Jadwal

Route:
```text
/jadwal
/jadwal/tambah
/jadwal/[id]
```

List:
- tanggal;
- kelompok;
- jumlah peserta;
- status;
- progress attendance.

Create:
- tanggal;
- kelompok satu atau lebih;
- title opsional;
- notes.

Button penting:
- "Gunakan kelompok berikutnya"
- "Tambah kelompok berikutnya"
- "Pilih manual"

---

## 5. Attendance

Dapat ditempatkan dalam detail jadwal.

Per row:
- nama;
- kelompok;
- status;
- payment amount jika paid;
- note;
- action.

Harus efisien untuk 50-100 peserta.

Sediakan bulk action:
- tandai semua pending sebagai hadir;
- lalu admin koreksi individu.

Bulk action harus ada confirmation.

---

## 6. Rotasi

Route/panel:
```text
/pengaturan/rotasi
```

Tampilkan:
- status;
- next group;
- urutan kelompok aktif.

Action:
- pause;
- resume;
- set next group.

---

## 7. Laporan

Route:
```text
/laporan
```

Tabs:
- periode;
- masyarakat;
- kelompok;
- pembayaran.

Filter:
- start date;
- end date;
- group;
- resident;
- status.

---

## 8. Pengaturan

Minimal:
- default replacement amount;
- ubah password admin;
- timezone hanya display `Asia/Makassar` dan tidak perlu editable pada V1.
