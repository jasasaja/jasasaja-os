# ADR-003: Database and ORM

- **Status:** **Accepted** untuk PostgreSQL, Drizzle ORM/Kit, Neon Free, dan target Rp0/bulan; detail lingkungan development tetap **Proposed**
- **Tanggal:** 2026-11-24
- **Sumber:** Master Blueprint v1.1 §8 (OD-002, Approved), PRD MVP v1.1 NFR-07/NFR-08, persetujuan provider 2026-11-24.

## Konteks

Belum ada database di repository. PRD mensyaratkan foreign key, constraint, migrasi berversi, dan transaksi untuk menjaga integritas data serta relasi antar modul. Pengguna menyetujui PostgreSQL, Drizzle ORM/Kit, **Neon Free** sebagai provider online, dan target biaya **Rp0/bulan** pada 2026-11-24. Tidak ada akun, project database, atau layanan berbayar yang dibuat dalam task dokumentasi ini.

## Keputusan

Gunakan **PostgreSQL** sebagai database, dengan migrasi SQL berversi yang dapat ditinjau dan dijalankan ulang dengan aman. Gunakan **Drizzle ORM + Drizzle Kit** sebagai lapisan akses data dan pengelola migrasi. Untuk development, PostgreSQL direncanakan lokal (misalnya Docker Compose; detail ini belum disetujui secara terpisah). Untuk online, gunakan **Neon Free** dengan target **Rp0/bulan**, sesuai verifikasi di [`docs/provider-verification.md`](../provider-verification.md). Kuota wajib diverifikasi ulang sebelum aktivasi; tidak ada layanan berbayar yang diaktifkan tanpa persetujuan.

### Status turunan

| Keputusan | Status | Keterangan |
|---|---|---|
| PostgreSQL sebagai database | **Accepted** | Disetujui pengguna 2026-11-24 |
| Drizzle ORM + Drizzle Kit | **Accepted** | Disetujui pengguna; TypeScript-first, migrasi SQL reviewable |
| Migrasi berversi + constraint + foreign key | **Accepted sebagai requirement** | PRD NFR-07 dan Blueprint §9 |
| Provider PostgreSQL development (Docker lokal) | **Proposed** | Detail environment belum disetujui terpisah |
| Provider PostgreSQL online: Neon Free | **Accepted** | Disetujui pengguna; target Rp0/bulan |
| Target biaya Rp0/bulan | **Accepted** | Dikonfirmasi pengguna; tanpa layanan berbayar |
| Prisma sebagai pengganti | **Tidak dipilih** | Konsekuensi dari pilihan Drizzle; arsip alternatif |
| SQLite sebagai database utama | **Rejected** | Lemah untuk target online dan konsistensi cadangan lintas lingkungan |
| Raw SQL tanpa migrasi berversi | **Rejected** | Melanggar NFR-07 |

## Opsi yang dipertimbangkan

| Opsi | Kompleksitas | Biaya | Single-user | Dev lokal | Deployment | Lock-in | Status |
|---|---|---|---|---|---|---|---|
| PostgreSQL + Drizzle | Sedang | Rendah | Baik | Baik | Baik | Rendah | **Accepted** (utama) |
| PostgreSQL + Prisma | Sedang | Rendah–Sedang | Baik | Baik | Baik | Sedang | **Tidak dipilih** (arsip alternatif) |
| PostgreSQL + SQL manual | Sedang | Rendah | Cukup | Baik | Baik | Rendah | **Tidak dipilih** (arsip alternatif) |
| SQLite | Rendah | Rendah | Baik | Baik | Cukup | Rendah | **Rejected** |
| MySQL/MariaDB | Sedang | Rendah–Sedang | Baik | Baik | Baik | Rendah | **Rejected** — bukan arah Blueprint |

## Catatan verifikasi provider (2026-11-24)

Desk research pada halaman pricing resmi (tanpa aktivasi layanan) menunjukkan Neon Free sebagai opsi paling sesuai untuk target Rp0/bulan: $0 permanen, tanpa kartu, 100 CU-hours/project/bulan, 1 GB/project, 5 GB egress, dan tidak di-pause saat idle. Supabase Free (500 MB, pause setelah 1 minggu, tanpa automatic backup) dan Render Free Postgres (expired 30 hari, tanpa backup) kurang cocok sebagai database utama. Rincian dan sumber: [`docs/provider-verification.md`](../provider-verification.md). Pengguna telah menetapkan Neon Free pada 2026-11-24; tidak ada akun/project yang dibuat atau layanan berbayar yang diaktifkan.

## Konsekuensi

**Positif:** integritas relasional kuat, query eksplisit, migrasi dapat dibaca sebagai SQL, dan portabilitas antar provider PostgreSQL tinggi.

**Negatif:** perlu proses migrasi dan environment database saat development; ada kurva pembelajaran Drizzle bila belum familiar.

## Risiko

- Neon Free berubah harga/kuota → mitigasi: verifikasi ulang sebelum aktivasi, pantau 1 GB/100 CU-hours, dan simpan dump portabel. Tidak ada akun yang dibuat dalam task ini.
- Migrasi destruktif merusak relasi → mitigasi: tinjau migrasi, hindari cascade delete tanpa persetujuan, uji restore.
- Skema berubah saat Phase 1–3 → mitigasi: migrasi kecil dan inkremental per slice.

## Verifikasi saat implementasi

- Satu migrasi dan seed dapat dijalankan ulang pada database development tanpa error.
- Foreign key dan constraint diuji dengan data yang melanggar aturan.
- Export/backup menghasilkan dump yang dapat di-restore ke database kosong.

## Rollback

Migration down/backup dump sebelum migrasi; untuk perubahan destruktif, restore ke dump sebelumnya. Tidak boleh ada penghapusan tabel atau kolom tanpa backup terverifikasi.
