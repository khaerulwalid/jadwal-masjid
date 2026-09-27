# 14 — Deployment

## 1. Environments

Minimum:
- local development;
- production.

Optional:
- preview via Vercel PR.

---

## 2. Supabase

Buat project PostgreSQL.

Catat:
- connection string;
- pooled connection string bila diperlukan;
- DB password.

Jangan commit secret.

---

## 3. Environment Variables

Contoh:

```env
DATABASE_URL=
AUTH_SECRET=
SEED_ADMIN_USERNAME=
SEED_ADMIN_PASSWORD=
SEED_ADMIN_NAME=
```

Jika library auth punya env khusus, ikuti library.

Jangan pakai prefix `NEXT_PUBLIC_` untuk secret.

---

## 4. Migration

Sebelum production app memakai schema baru:
- jalankan migration;
- pastikan sukses.

Jangan menjalankan destructive migration tanpa backup.

---

## 5. Vercel

Flow:
```text
GitHub
↓
Vercel Project
↓
Environment Variables
↓
Build
↓
Deploy
```

---

## 6. Domain

Awal:
```text
project.vercel.app
```

Custom domain optional.

---

## 7. Production Checklist

- [ ] database migration applied
- [ ] admin seeded
- [ ] production password changed
- [ ] AUTH_SECRET kuat
- [ ] DATABASE_URL production benar
- [ ] HTTPS active
- [ ] secure cookie active
- [ ] login test
- [ ] create schedule test
- [ ] payment test
- [ ] reports test

---

## 8. Backup

Walaupun data kecil:
- gunakan backup/export berkala;
- minimal dump database sebelum perubahan schema besar.

Untuk proyek komunitas kecil, backup manual terjadwal juga cukup pada tahap awal.

---

## 9. Free Tier Consideration

Aplikasi didesain ringan.

Jangan membuat:
- polling agresif;
- cron tiap menit;
- upload besar;
- query report tanpa filter yang tidak perlu.

---

## 10. Supabase Free Project Inactivity

Jika provider menerapkan sleep/pause pada free tier:
- first request setelah lama tidak aktif mungkin lambat;
- pahami kebijakan provider terbaru sebelum go-live.

Dokumentasi tidak boleh mengasumsikan free tier selalu permanen.
