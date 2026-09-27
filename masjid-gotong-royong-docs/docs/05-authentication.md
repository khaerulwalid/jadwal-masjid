# 05 — Authentication

## 1. Scope

Hanya ada admin/pengurus.

Tidak ada:
- sign up;
- forgot password publik;
- social login;
- role masyarakat.

---

## 2. Login

Input:
- username;
- password.

Flow:

```text
POST login
↓
validasi Zod
↓
find user by username
↓
user exists?
↓
is_active?
↓
verify password hash
↓
create session
↓
set HTTP-only cookie
↓
redirect dashboard
```

---

## 3. Password

Gunakan:
- Argon2id, atau
- bcrypt bila library/server environment lebih mudah.

Jangan:
- plaintext;
- SHA256 langsung;
- MD5.

Seed harus menerima password dari environment atau temporary dev password.

Production:
- jangan commit password ke repository.

---

## 4. Session

Gunakan database-backed opaque session (bukan JWT dan bukan Supabase Auth).

Flow:
- Generate raw token (contoh: 32 bytes cryptographically secure random, hex encoded).
- Hash raw token menggunakan SHA-256 (menghasilkan 64 karakter hex).
- Simpan token hash, user ID, dan expiration di tabel `sessions`.
- Berikan raw token ke browser sebagai HTTP-only cookie.
- Jangan menyimpan raw token di database.

Cookie:
- httpOnly = true;
- secure = true di production;
- sameSite = `lax` atau lebih ketat;
- path = `/`;
- punya expiration.

---

## 5. Protect Route

Semua halaman selain `/login` harus memeriksa session.

Jangan hanya menyembunyikan menu di frontend.

Server action juga harus memeriksa session sendiri.

---

## 6. Logout

Logout:
- invalidate session;
- hapus cookie;
- redirect `/login`.

---

## 7. User Seed

Minimal:
```text
name: Administrator Masjid
username: admin
password: dari env
```

Environment dev:
```text
SEED_ADMIN_USERNAME
SEED_ADMIN_PASSWORD
SEED_ADMIN_NAME
```

Production:
- jalankan seed sekali;
- ganti password setelah login jika fitur perubahan password tersedia.

---

## 8. Change Password

Direkomendasikan.

Flow:
- current password;
- new password;
- confirm new password;
- verify current;
- hash new;
- update;
- optionally invalidate other sessions.

---

## 9. Brute Force

Karena aplikasi publik di internet:
- tambahkan delay/rate limit login jika mudah;
- minimal log failed attempts tanpa password.

Tidak perlu sistem anti-fraud kompleks.
