# Sistem Jadwal Gotong Royong Masjid

Dokumentasi ini adalah **source of truth** untuk implementasi sistem administrasi gotong royong pembangunan masjid.

Target pembaca:
- AI coding model dengan kemampuan terbatas/murah.
- Junior programmer.
- Programmer yang baru masuk ke project dan belum mengetahui konteks bisnis.

> Penting: jangan mengubah aturan bisnis inti tanpa memperbarui dokumentasi terkait.

---

## 1. Tujuan Sistem

Sistem dipakai oleh **pengurus masjid/admin saja** untuk:

1. Mengelola data masyarakat.
2. Mengelompokkan masyarakat ke dalam kelompok gotong royong.
3. Menentukan urutan rotasi kelompok.
4. Membuat jadwal gotong royong setiap hari.
5. Mendukung satu hari dijadwalkan satu atau lebih kelompok.
6. Menjeda kegiatan gotong royong.
7. Melanjutkan kegiatan dari kelompok tertentu.
8. Menandai status setiap masyarakat:
   - hadir bekerja;
   - mengganti kerja dengan uang;
   - tidak hadir;
   - belum dicatat.
9. Mencatat nominal pengganti kerja, default Rp100.000.
10. Menampilkan laporan sederhana.

Gotong royong dapat berlangsung **setiap hari** selama pembangunan masjid, misalnya sekitar 6 bulan.

---

## 2. Stack Teknologi

Gunakan:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zod
- Drizzle ORM
- PostgreSQL
- Supabase sebagai managed PostgreSQL
- Vercel untuk hosting
- Session-based authentication dengan HTTP-only cookie

Tidak diperlukan:

- NestJS
- Redis
- RabbitMQ
- Kafka
- Kubernetes
- Microservices
- Separate backend service
- Redux untuk state global

---

## 3. Prinsip Implementasi

1. Prioritaskan sederhana, jelas, dan mudah dirawat.
2. Jangan membuat abstraction yang tidak diperlukan.
3. Semua mutasi data penting dilakukan di server.
4. Jangan pernah mengirim `DATABASE_URL` ke browser.
5. Gunakan database transaction untuk operasi yang mengubah beberapa tabel.
6. Semua validasi kritikal harus ada di server.
7. Database tetap memiliki constraint untuk menjaga integritas.
8. UI harus mobile-friendly karena pengurus sangat mungkin menggunakan HP.
9. Sistem hanya memiliki satu role saat ini: `admin`.
10. Jangan menambah fitur yang tidak diminta tanpa dokumentasi.

---

## 4. Urutan Membaca Dokumentasi

Baca berurutan:

1. `docs/01-product-requirements.md`
2. `docs/02-business-rules.md`
3. `docs/03-architecture.md`
4. `docs/04-database-design.md`
5. `docs/05-authentication.md`
6. `docs/06-application-modules.md`
7. `docs/07-scheduling-and-rotation.md`
8. `docs/08-attendance-and-payment.md`
9. `docs/09-server-actions-and-services.md`
10. `docs/10-ui-ux-requirements.md`
11. `docs/11-reports.md`
12. `docs/12-validation-error-handling.md`
13. `docs/13-testing.md`
14. `docs/14-deployment.md`
15. `docs/15-project-structure.md`
16. `docs/16-implementation-plan.md`
17. `docs/17-ai-implementation-instructions.md`

---

## 5. Aturan Source of Truth

Jika terjadi perbedaan implementasi dan dokumentasi:

- aturan bisnis pada dokumentasi dianggap benar;
- kode harus diperbaiki agar sesuai dokumentasi;
- jika memang aturan bisnis berubah, dokumentasi harus diubah terlebih dahulu atau dalam commit yang sama.

---

## 6. Scope Versi Pertama

Versi pertama hanya fokus pada:

- login admin;
- dashboard;
- masyarakat;
- kelompok;
- anggota kelompok;
- jadwal harian;
- rotasi kelompok;
- pause/resume;
- attendance;
- pembayaran pengganti kerja;
- laporan;
- deployment.

Tidak termasuk:
- aplikasi masyarakat;
- registrasi publik;
- notifikasi WhatsApp;
- payment gateway;
- QR attendance;
- mobile app native;
- multi-masjid;
- role kompleks.
