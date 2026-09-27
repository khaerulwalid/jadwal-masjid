# 07 — Scheduling and Rotation

Ini bagian paling kritikal.

---

## 1. State

`rotation_state`:

```text
id = 1
next_group_id
is_paused
```

---

## 2. Daftar Kelompok Aktif

Selalu query:

```text
groups
WHERE is_active = true
ORDER BY sequence_no ASC
```

---

## 3. Cari Next Group

Pseudo:

```ts
function getNextActiveGroup(currentGroupId, activeGroups) {
  const currentIndex = activeGroups.findIndex(g => g.id === currentGroupId)

  if (currentIndex === -1) throw BusinessRuleError()

  const nextIndex = (currentIndex + 1) % activeGroups.length

  return activeGroups[nextIndex]
}
```

---

## 4. Multi Group

Jika schedule memilih:
- G3
- G4

last selected group = G4.

next:
- group setelah G4.

Gunakan `order_no` untuk menentukan last.

---

## 5. Create Schedule Normal

Input:
```ts
{
  workDate: "2026-10-01",
  groupIds: ["g3"]
}
```

Transaction:

```text
BEGIN

1. validate date unique
2. validate selected groups active
3. insert work_schedule
4. insert schedule_groups
5. query active members of selected groups
6. insert attendance pending
7. determine last selected group
8. determine next active group
9. update rotation_state.next_group_id
10. commit

COMMIT
```

Jika gagal:
```text
ROLLBACK
```

---

## 6. Create Schedule Saat Pause

Admin tetap boleh membuat schedule manual jika produk mengizinkan.

Tetapi:
- jangan otomatis mengubah pause menjadi false;
- boleh update `next_group_id` berdasarkan kelompok terakhir jika admin memilih option `advanceRotation=true`.

Default V1:
- schedule manual saat pause **tidak mengubah next_group_id** kecuali admin memilih jelas.

Ini mencegah perubahan pointer tidak sengaja.

---

## 7. Helper "Gunakan Next Group"

Jika next_group_id = G4:
- tombol memilih G4.

Jika admin ingin dua kelompok:
- tombol "Tambah kelompok berikutnya" memilih G5.

Jika tiga:
- berikutnya G6.

Jika wrap:
- G6 lalu G1.

---

## 8. Validasi Sequence untuk Auto Selection

Auto-selected groups harus mengikuti rotation.

Manual mode:
- admin boleh memilih kelompok aktif mana pun.

UI harus membedakan:
- `Mode Rotasi`
- `Pilih Manual`

---

## 9. Set Next Group

Flow:

```text
admin pilih group
↓
validate active
↓
UPDATE rotation_state
SET next_group_id = ?
```

Tidak mengubah histori jadwal.

---

## 10. Pause

Flow:
```text
UPDATE rotation_state
SET is_paused = true
```

Jangan set `next_group_id = NULL`.

---

## 11. Resume

Flow default:
```text
UPDATE rotation_state
SET is_paused = false
```

Jika admin memilih group override:
```text
UPDATE rotation_state
SET is_paused = false,
    next_group_id = selected
```

---

## 12. Edge Cases

### Tidak ada kelompok aktif
- create schedule ditolak;
- dashboard tampilkan setup required.

### next_group nonaktif
- sistem jangan crash;
- minta admin memilih next group;
- optional auto pilih sequence terkecil dengan warning.

### Kelompok tanpa anggota
- boleh dijadwalkan tetapi tampil warning;
- attendance = 0.

### Tanggal sudah ada
- error conflict;
- jangan duplicate.

### Anggota sama
Secara business rule tidak boleh punya dua membership aktif.
Database partial unique index mencegah.

### Group dinonaktifkan setelah schedule dibuat
- schedule lama tetap valid;
- attendance lama tetap valid.

---

## 13. Jangan Generate 6 Bulan Sekaligus

V1 direkomendasikan membuat jadwal per hari atau beberapa hari yang jelas.

Alasan:
- pembangunan dapat libur;
- jumlah kelompok per hari berubah;
- rotasi bisa pause;
- keputusan lapangan berubah.

Bila nanti ingin recurring generator, buat sebagai fitur terpisah.
