# 01 — Product Requirements

## 1. Ringkasan Produk

Nama kerja: **Sistem Gotong Royong Masjid**

Sistem adalah aplikasi web internal untuk membantu pengurus masjid mengelola jadwal gotong royong masyarakat selama pembangunan masjid.

Aplikasi tidak ditujukan untuk masyarakat umum pada versi pertama.

---

## 2. Aktor Sistem

### 2.1 Admin/Pengurus

Satu-satunya aktor yang dapat login.

Admin dapat:
- login;
- melihat dashboard;
- mengelola masyarakat;
- mengelola kelompok;
- mengatur anggota kelompok;
- mengatur urutan kelompok;
- membuat jadwal;
- menggabungkan beberapa kelompok ke satu jadwal;
- menjeda rotasi;
- melanjutkan rotasi;
- memilih ulang kelompok awal/berikutnya;
- mencatat kehadiran;
- mencatat pengganti kerja dengan uang;
- melihat laporan.

### 2.2 Masyarakat

Masyarakat adalah data yang dikelola.

Masyarakat:
- tidak memiliki akun;
- tidak login;
- tidak mengubah datanya sendiri;
- tidak mengisi kehadiran sendiri.

---

## 3. Asumsi Utama

1. Gotong royong dapat berlangsung setiap hari.
2. Durasi pembangunan dapat berlangsung sekitar 6 bulan atau lebih.
3. Jumlah masyarakat dapat mencapai ratusan.
4. Satu kelompok berisi banyak masyarakat.
5. Satu hari dapat melibatkan satu kelompok.
6. Satu hari dapat melibatkan dua atau lebih kelompok.
7. Urutan normal kelompok bersifat berputar.
8. Kegiatan dapat dijeda selama beberapa hari.
9. Setelah jeda, admin dapat memilih kelompok mana yang menjadi kelompok berikutnya.
10. Tidak selalu mulai dari kelompok 1.
11. Nominal pengganti kerja default Rp100.000.
12. Nominal aktual harus disimpan per transaksi agar riwayat tidak berubah bila nominal default berubah.

---

## 4. Functional Requirements

### FR-001 Login

Admin harus dapat login menggunakan username dan password.

Acceptance:
- password salah → login gagal;
- user nonaktif → login gagal;
- login berhasil → redirect dashboard;
- session disimpan di HTTP-only cookie.

### FR-002 Kelola Masyarakat

Admin dapat:
- tambah;
- lihat;
- ubah;
- nonaktifkan masyarakat.

Minimal field:
- nama;
- nomor HP opsional;
- alamat opsional;
- status aktif.

Penghapusan fisik tidak menjadi default.

### FR-003 Kelola Kelompok

Admin dapat:
- membuat kelompok;
- menentukan nama;
- menentukan urutan;
- mengaktifkan/nonaktifkan kelompok.

Contoh:
- Kelompok 1 → urutan 1
- Kelompok 2 → urutan 2
- Kelompok 3 → urutan 3

Urutan harus unik.

### FR-004 Kelola Anggota Kelompok

Admin dapat:
- memasukkan masyarakat ke kelompok;
- memindahkan masyarakat;
- melepas masyarakat dari kelompok.

Versi pertama: satu masyarakat hanya boleh memiliki satu kelompok aktif pada satu waktu.

### FR-005 Membuat Jadwal

Admin dapat membuat jadwal gotong royong berdasarkan tanggal.

Jadwal berisi:
- tanggal;
- judul opsional;
- catatan opsional;
- satu atau lebih kelompok.

### FR-006 Otomatis Membuat Attendance

Ketika jadwal dibuat:
- sistem mengambil anggota aktif dari kelompok yang dipilih;
- sistem membuat attendance dengan status `pending`.

### FR-007 Satu Hari Banyak Kelompok

Admin dapat menjadwalkan:
- Kelompok 1;
atau
- Kelompok 1 + Kelompok 2;
atau lebih.

Tidak boleh ada kelompok yang sama dua kali dalam satu jadwal.

### FR-008 Rotasi Otomatis

Jika urutan aktif:
- sistem mengetahui kelompok berikutnya;
- setelah jadwal diselesaikan/dibuat sesuai kebijakan implementasi, pointer rotasi bergerak ke kelompok setelah kelompok terakhir yang dipakai.

Contoh:
- kelompok aktif 1,2,3,4,5;
- hari ini 3 + 4;
- kelompok berikutnya 5.

Jika:
- hari ini 5;
maka berikutnya:
- 1.

### FR-009 Pause

Admin dapat menjeda rotasi.

Saat pause:
- sistem tidak membuat jadwal otomatis;
- pointer `next_group_id` tetap disimpan;
- admin masih boleh membuat jadwal manual jika diperlukan.

### FR-010 Resume

Admin dapat melanjutkan rotasi.

Saat resume:
- default menggunakan `next_group_id` terakhir;
- admin boleh mengganti `next_group_id`.

### FR-011 Set Kelompok Berikutnya

Admin dapat secara manual menentukan:
- “Mulai/lanjut dari Kelompok X”.

Ini harus tersedia tanpa menghapus histori jadwal.

### FR-012 Attendance

Untuk setiap anggota terjadwal, admin dapat memilih:
- `pending`
- `present`
- `paid`
- `absent`

### FR-013 Pengganti Kerja dengan Uang

Saat status = `paid`:
- default amount = 100000;
- admin boleh mengubah nominal;
- payment date diisi;
- boleh ada catatan.

Saat status bukan `paid`:
- payment amount harus kosong/null.

### FR-014 Laporan

Minimal laporan:
- rekap per periode;
- rekap per masyarakat;
- rekap per kelompok;
- daftar pembayaran;
- total pembayaran;
- jumlah hadir;
- jumlah tidak hadir;
- jumlah pending.

### FR-015 Audit Sederhana

Simpan:
- `created_at`;
- `updated_at`;
- `created_by` pada data penting;
- `marked_by` dan `marked_at` pada attendance.

---

## 5. Non-functional Requirements

### NFR-001 Security
- DB credential server-only.
- Password hashed.
- HTTP-only secure cookie di production.
- Semua halaman admin dilindungi.
- Validasi server wajib.

### NFR-002 Performance
Target cukup untuk:
- < 1000 masyarakat;
- < 100 kelompok;
- puluhan ribu attendance.

### NFR-003 Mobile Friendly
UI harus nyaman pada:
- 360px;
- 390px;
- tablet;
- desktop.

### NFR-004 Reliability
Operasi membuat jadwal harus atomic.

### NFR-005 Maintainability
- nama variabel jelas;
- business logic tidak ditaruh langsung di React component;
- fungsi pendek;
- dokumentasi dipatuhi.

---

## 6. Out of Scope

Jangan implementasikan tanpa permintaan baru:
- masyarakat login;
- WhatsApp;
- SMS;
- payment gateway;
- QR code;
- biometrik;
- GPS;
- approval multi-level;
- role selain admin;
- multi tenant;
- accounting lengkap.
