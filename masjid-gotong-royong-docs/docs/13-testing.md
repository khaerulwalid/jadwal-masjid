# 13 — Testing

## 1. Prioritas

Testing fokus ke business logic, bukan mengejar coverage tinggi.

---

## 2. Unit Test Rotation

Test:

### Case 1
Groups: 1,2,3.
Current: 1.
Expected: 2.

### Case 2
Current: 3.
Expected: 1.

### Case 3
Inactive group 2.
Active: 1,3.
Current: 1.
Expected: 3.

### Case 4
Multi group last = 3.
Expected next berdasarkan active list.

### Case 5
No active groups.
Expected error.

---

## 3. Schedule Integration Test

Create schedule:
- work_schedule created;
- schedule_groups count benar;
- attendances generated;
- rotation updated.

Failure:
- duplicate date;
- transaction rollback.

---

## 4. Attendance Test

Paid:
- amount required;
- date required.

Paid → present:
- payment cleared.

Bulk present:
- only pending changed.

---

## 5. Membership Test

Move resident:
- previous left_at set;
- new active membership created;
- old attendance unchanged.

---

## 6. Auth Test

- correct login;
- wrong password;
- inactive user;
- protected route;
- logout.

---

## 7. Manual QA Checklist

### Login
- [ ] login sukses
- [ ] login gagal
- [ ] logout

### Masyarakat
- [ ] create
- [ ] edit
- [ ] deactivate
- [ ] search

### Kelompok
- [ ] create
- [ ] reorder
- [ ] assign member
- [ ] move member

### Jadwal
- [ ] single group
- [ ] two groups
- [ ] wrap rotation
- [ ] duplicate date blocked
- [ ] zero member warning

### Pause/Resume
- [ ] pause keeps next
- [ ] resume default
- [ ] resume override

### Attendance
- [ ] present
- [ ] paid
- [ ] absent
- [ ] bulk present
- [ ] payment cleared after status change

### Reports
- [ ] totals match raw data
- [ ] cancelled excluded
