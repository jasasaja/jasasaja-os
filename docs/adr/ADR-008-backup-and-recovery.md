# ADR-008: Backup and Recovery

- **Status:** **Accepted** — OD-006 disetujui pengguna 2026-11-25 (cakupan backup/restore non-produksi lokal)
- **Tanggal:** 2026-11-24
- **Diperbarui:** 2026-11-25 — OD-006 disetujui eksplisit oleh pengguna.
- **Sumber:** Master Blueprint v1.1 §9 (Approved), PRD MVP v1.1 FR-C04/NFR-06, Development Roadmap v1.1 §7 (Phase 4), persetujuan Neon Free 2026-11-24, persetujuan OD-006 2026-11-25.

## Konteks

Blueprint mewajibkan backup dan restore diuji sebelum materi/proyek penting disimpan secara eksklusif di aplikasi. PRD menjadikan export/backup sebagai requirement Must dan meminta restore diuji pada lingkungan non-production. Neon Free telah disetujui sebagai database online, tetapi tidak menyediakan scheduled snapshot pada Free. Belum ada database atau prosedur backup di repository; strategi, frekuensi, dan retensi final masih open OD-006. P0.1-02 tidak menetapkan angka atau lokasi backup baru.

## Keputusan

Terapkan tiga lapis, dengan parameter OD-006 yang disetujui:

1. **Backup database (OD-006 Approved):** `pg_dump` format custom (`-Fc`) + checksum **SHA256**. Frekuensi: **manual per minggu + sebelum perubahan schema**. Retensi: **7 backup lokal** (rotasi/hapus yang lebih lama sesuai prosedur). Lokasi: **`./backups/`** (gitignored, di luar commit; tidak berisi secret). Backup dijalankan pada lingkungan non-produksi/lokal kecuali ada keputusan terpisah.
2. **Export aplikasi:** endpoint/export portabel konten domain (learning, handbook, project) tetap direncanakan; format/detail implementasi mengikuti ADR-006/OD-004 (A1 JSON) dan kebutuhan fase berikutnya. Belum diimplementasikan pada Step ini.
3. **Restore drill:** restore ke **database scratch non-produksi** dan verifikasi jumlah record, foreign key/constraint penting, serta smoke check tautan lintas modul. Restore drill minimal dilakukan sekali pada lingkungan non-production dengan hasil tercatat (P0.5-02).

Karena Neon Free tidak memiliki scheduled snapshot, `pg_dump` dan export menjadi lapisan portabel. Layanan backup berbayar tidak diaktifkan tanpa persetujuan. Tidak ada akun atau layanan yang dibuat oleh keputusan ini.

### Status turunan

| Keputusan | Status | Keterangan |
|---|---|---|
| Backup database + export konten + restore drill | **Accepted** | Strategi disetujui; implementasi P0.5-02 |
| `pg_dump -Fc` + checksum SHA256 | **Accepted** | OD-006 2026-11-25 |
| Frekuensi backup manual per minggu + sebelum perubahan schema | **Accepted** | OD-006 2026-11-25 |
| Retensi 7 backup lokal | **Accepted** | OD-006 2026-11-25 |
| Lokasi `./backups/` (gitignored) | **Accepted** | OD-006 2026-11-25; tidak ada secret di repo |
| Restore drill ke DB scratch non-produksi | **Accepted** | OD-006 2026-11-25; hasil harus tercatat |
| Export portabel aplikasi sesuai ADR-006/OD-004 | **Proposed** | Format/detail endpoint export belum diimplementasikan |
| Neon Free tanpa scheduled snapshot pada Free | **Accepted sebagai konsekuensi provider** | `pg_dump`/export portabel tetap wajib |
| Backup snapshot khusus provider saja | **Rejected** | Portabilitas rendah |
| Menunda backup sampai Phase 4 tanpa prosedur | **Rejected** | Melanggar prinsip keandalan |

## Opsi yang dipertimbangkan

| Opsi | Kompleksitas | Biaya | Single-user | Dev lokal | Deployment | Lock-in | Status |
|---|---|---|---|---|---|---|---|
| `pg_dump` + export portabel + restore drill | Sedang | Rendah | Baik | Baik | Baik | Rendah | **Proposed** (utama; format export OD-004) |
| Snapshot khusus provider | Rendah | Sedang | Cukup | Buruk | Baik | Tinggi | **Rejected** |
| Backup berbayar terkelola | Rendah | Sedang–Tinggi | Baik | Cukup | Baik | Sedang | **Proposed** (hanya bila disetujui) |
| Tanpa backup otomatis | Rendah | Rendah | Buruk | Baik | Buruk | Rendah | **Rejected** |

## Konsekuensi

**Positif:** data dapat dipulihkan ke provider PostgreSQL lain, export dapat dibaca manusia, dan risiko kehilangan satu titik penyimpanan berkurang.

**Negatif:** perlu disiplin menjalankan dan menguji restore; file backup harus diamankan agar tidak membocorkan data privat.

## Risiko

- Backup gagal diam-diam → mitigasi: checksum, log ringkas, dan pemeriksaan periodik.
- File backup mengandung data sensitif → mitigasi: enkripsi, izin akses ketat, tidak di-commit.
- Restore berhasil secara teknis tetapi tautan lintas modus rusak → mitigasi: verifikasi relasi `lesson ↔ handbook ↔ project`.

## Verifikasi saat implementasi

- Dump `pg_dump -Fc` berhasil dibuat dari database development/lokal.
- File checksum SHA256 dibuat dan tervalidasi.
- Dump di-restore ke database scratch non-produksi kosong tanpa error.
- Jumlah record, FK/constraint penting, dan smoke check tautan lintas modul sama/valid setelah restore.
- Backup berada di `./backups/` (gitignored) dan tidak mengandung secret di repo.

## Riwayat perubahan

- 2026-11-24: draft awal; diperbarui setelah Neon Free disetujui. Status tetap Proposed karena frekuensi, retensi, lokasi, dan format backup final masih OD-006.
- 2026-11-25: OD-006 disetujui eksplisit oleh pengguna. Keputusan: backup manual per minggu + sebelum perubahan schema, retensi 7 lokal, lokasi `./backups/` (gitignored), format `pg_dump -Fc` + checksum SHA256, restore drill ke DB scratch non-produksi.

## Rollback

Rollback prosedur berupa penghapusan file backup yang rusak dan pembuatan backup baru; rollback data berupa restore ke dump terakhir yang terverifikasi. Jangan menimpa backup terakhir yang baik sebelum backup baru divalidasi.
