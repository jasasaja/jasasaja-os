# Lembar Finalisasi ADR & Decision Register

- **Status:** P0.1-02 selesai untuk cakupan keputusan yang disetujui; detail yang belum disetujui tetap **Proposed**
- **Tanggal:** 2026-11-24
- **Diperbarui:** 2026-11-26 — OD-002 disetujui pengguna: frontend Vercel Free, API di Vercel, DB Neon Free, domain default, Rp0/bulan. **Catatan penting:** backend saat ini Fastify long-running Node server; deploy API ke Vercel membutuhkan adaptasi arsitektur/deploy (mis. serverless entrypoint/adapter) atau keputusan implementasi terpisah - belum diimplementasikan. OD-006 tetap Approved.
- **Peringatan:** Dokumen ini **bukan** bukti izin implementasi. Pengguna menyetujui keputusan arsitektur/stack pada 2026-11-24, tetapi belum memberikan izin implementasi Phase 0.
- **Riwayat:** P0.1-01 mengunci baseline v1.1 sebagai `Approved`; P0.1-02 mengaudit ADR-001–ADR-009 dan memisahkan keputusan yang disetujui dari Open Decisions yang masih terbuka; 2026-11-25 OD-001 disetujui untuk pinning dependency backend yang disebutkan di ADR-002.

## 1. Keputusan yang sudah disetujui pengguna

| Hal | Status | Cakupan | Sumber |
|---|---|---|---|
| Baseline Master Blueprint, PRD MVP, Roadmap v1.1 | **Approved — 2026-11-24** | Dokumen acuan implementasi | P0.1-01 |
| Arsitektur Modular Monolith, satu repository | **Approved** | Domain `learning`, `handbook`, `projects`, `shared/core` | Pengguna 2026-11-24 |
| Stack inti React + Vite + TypeScript + Fastify + PostgreSQL + Drizzle + Zod | **Approved** | Pinning dependency backend OD-001 disetujui 2026-11-25: `fastify@5.12.8`, `zod@4.6.7`, `drizzle-orm@0.45.4`, `drizzle-kit@0.31.11`, `pg@8.23.1`, `@types/pg@8.23.1`; `typescript`/`tsx` tetap existing. Belum dipasang. | Pengguna 2026-11-24, 2026-11-25 |
| Provider database online Neon Free | **Approved** | Target Rp0/bulan; tidak ada akun/project dibuat | Pengguna 2026-11-24 |
| Budget Rp0/bulan | **Approved** | Tanpa layanan berbayar tanpa persetujuan | Pengguna 2026-11-24 |
| Autentikasi Google Login | **Approved** | Satu owner, tanpa registrasi publik | Pengguna 2026-11-24 |
| Content authoring Rich Text / Block Editor | **Approved** | Format import/export belum termasuk | Pengguna 2026-11-24 |
| Deployment hybrid | **Approved** | Lokal penuh + target online; OD-007 ditutup | Pengguna 2026-11-24 |
| Single owner, tanpa multi-tenant/offline sync/AI internal MVP | **Approved** | Tidak ada perubahan scope MVP | Pengguna 2026-11-24 |
| Pertahankan frontend React + Vite + TypeScript | **Approved** | Tanpa migrasi framework tanpa ADR | Pengguna 2026-11-24 |
| Source code, dependency, konfigurasi, database tidak diubah | **Accepted untuk sesi ini** | Berlaku untuk P0.1-01/P0.1-02 | Arahan pengguna |

Sebelum P0.1-02, sebagian besar poin di atas tercatat sebagai rekomendasi `Proposed`. Status tersebut kini diperbarui hanya untuk cakupan yang secara eksplisit disetujui pengguna. Rincian yang belum disetujui tetap `Proposed` dan tidak dianggap final.

## 2. Status ADR sebelum dan sesudah

| ADR | Judul | Sebelum | Sesudah | Cakupan Approved | Yang masih terbuka |
|---|---|---|---|---|---|
| ADR-001 | Application Architecture | Accepted | **Accepted** | Modular Monolith, satu repo, domain inti | Susunan folder backend & kontrak internal |
| ADR-002 | Frontend and Backend Stack | Proposed | **Accepted** | React + Vite + TS, Node + TS + Fastify, Zod; OD-001 pinning backend disetujui 2026-11-25 | Instalasi dependency belum dilakukan; dependency tambahan lain tetap butuh persetujuan |
| ADR-003 | Database and ORM | Proposed | **Accepted** | PostgreSQL, Drizzle, Neon Free, Rp0/bulan | Detail environment development; kuota saat aktivasi |
| ADR-004 | Authentication and Authorization | Proposed | **Accepted** | Google Login, single owner, tanpa registrasi publik; OD-003 session/cookie/CSRF/guard scope (2026-11-25) | Detail implementasi final (nama cookie/TTL/skema session/path) saat Step 6 |
| ADR-005 | Hosting and Deployment | Proposed (hybrid Accepted) | **Accepted** | Hybrid, Rp0/bulan, Neon Free sebagai DB online | Hosting/topologi/region/domain (OD-002) |
| ADR-006 | Content Authoring and Import | Proposed | **Accepted** | Rich Text / Block Editor sebagai authoring MVP; OD-004 disetujui 2026-11-25 (A1: JSON block, export/import awal JSON) | Implementasi editor/library, sanitasi block, dan endpoint import/export belum dibuat |
| ADR-007 | Content Versioning | Proposed | **Accepted** | OD-005 disetujui 2026-11-25 (B1: append-only version rows, approve eksplisit owner) | Desain schema/migrasi/endpoint versi belum dibuat |
| ADR-008 | Backup and Recovery | Proposed | **Accepted** | OD-006 backup/restore non-produksi disetujui 2026-11-25 (`pg_dump -Fc` + SHA256, mingguan + sebelum schema, retensi 7, `./backups/` gitignored, restore drill scratch) | Export portabel aplikasi/endpoint masih Proposed; implementasi P0.5-02 pending instruksi |
| ADR-009 | Default Timezone | Proposed | **Accepted** | OD-008 disetujui 2026-11-25 (C2: simpan waktu lokal Asia/Jakarta saja, pilihan pengguna) | Dampak konversi/portabilitas perlu dijaga saat implementasi schema/API |
| ADR-010 | Next.js App Router Migration | — | **Proposed** | Belum ada cakupan yang disetujui; hanya izin checkpoint, branch, dan ADR proposal | OD-001 (migrasi) versi Next.js/Auth.js, OD-002 (migrasi) detail hosting/runtime, OD-TEST strategi test |

Ringkasan: sembilan ADR (ADR-001–ADR-009) memiliki keputusan utama `Accepted` pada cakupan yang disetujui; sebelum ADR-010 tidak ada ADR yang `Proposed` pada level keputusan utama. OD-001/003/004/005/006/008/PRD-Q-Mastered disetujui 2026-11-25; OD-002 disetujui 2026-11-26 (frontend Vercel Free, API di Vercel, DB Neon Free, domain default, Rp0/bulan) dengan constraint adaptasi Fastify-long-running ke Vercel yang belum diimplementasikan. Tidak ada ADR yang diubah menjadi `Accepted` hanya karena rekomendasi dokumen, kecuali dicatat eksplisit sebagai pilihan/persetujuan pengguna.

**Catatan 2026-11-27 — ADR-010:** pengguna menyetujui pencatatan proposal migrasi ke Next.js App Router/Vercel. ADR-010 berstatus **Proposed** dan **bukan** izin implementasi, dependency, deploy, atau perubahan status ADR lama. ADR-001–ADR-009 tetap `Accepted` pada cakupan masing-masing; status `Superseded` baru dicatat setelah persetujuan terpisah. Checkpoint berupa tag anotasi lokal `pre-nextjs-migration` dan branch `feat/nextjs-migration` dibuat dari HEAD `main` `d40df91e04e4eaddc88917e4e47c0cc10be9fce8`; tidak ada push/commit ke `main`.

## 3. Open Decisions yang masih memerlukan konfirmasi

| ID | Topik | Status | Contoh keputusan yang belum diambil | Dampak |
|---|---|---|---|---|
| OD-001 | Versi dependency final (backend yang disetujui) | **Approved — 2026-11-25** | Disetujui tertulis: `fastify@5.12.8`, `zod@4.6.7`, `drizzle-orm@0.45.4`, `drizzle-kit@0.31.11`, `pg@8.23.1`, `@types/pg@8.23.1`; `typescript`/`tsx` tetap existing. Belum dipasang. | Membuka P0.3-03 setelah izin langkah implementasi; dependency tambahan tetap perlu persetujuan |
| OD-002 | Detail hosting/topologi online | **Approved — 2026-11-26 (dengan constraint)** | Disetujui pengguna: frontend Vercel Free, API di Vercel, DB Neon Free, domain default, Rp0/bulan. **Constraint:** backend saat ini Fastify long-running (`server/src/server.ts`); deploy ke Vercel butuh adaptasi serverless/entrypoint atau strategi deploy yang eksplisit. Belum diimplementasikan; tidak ada akun/deploy dibuat. | Perlu slice implementasi/deploy terpisah; verifikasi kompatibilitas Fastify-on-Vercel sebelum aktivasi |
| OD-003 | Detail session setelah Google Login | **Approved — 2026-11-25** | Server-side session DB + opaque HttpOnly cookie (`SameSite=Lax`, `Secure` env-aware, `Path=/`), CSRF defense-in-depth (Origin/Referer + JSON + `X-CSRF-Token` mutasi), guard default-protected `/api/**`, allowlist publik minimum `GET /api/health` + auth flow yang didefinisikan | Membuka Step 6 (P0.4-03) setelah instruksi eksplisit; detail implementasi final (nama cookie/TTL/skema session/path) ditetapkan saat Step 6 |
| OD-004 | Format konten dan import/export | **Approved — 2026-11-25** | A1: simpan konten sebagai JSON block terstruktur; export/import awal JSON. Rich Text/Block Editor tetap authoring MVP. | Implementasi schema/API konten dapat dirancang; sanitasi/validasi block tetap wajib |
| OD-005 | Skema versioning handbook/lesson | **Approved — 2026-11-25** | B1: append-only version rows; transisi `Draft → Approved` hanya oleh owner lewat aksi eksplisit. | Desain tabel versi/constraint/status dapat dirancang; belum ada migrasi |
| OD-006 | Backup/export/restore | **Approved — 2026-11-25** | Backup manual per minggu + sebelum perubahan schema; retensi 7 lokal; lokasi `./backups/` (gitignored); format `pg_dump -Fc` + checksum SHA256; restore drill ke DB scratch non-produksi | Membuka P0.5-02 setelah instruksi eksplisit; perlu `pg_dump`/`psql` di host saat eksekusi drill |
| OD-008 | Timezone default | **Approved — 2026-11-25** | C2 (pilihan pengguna): simpan waktu lokal Asia/Jakarta saja. | Schema/API/tampilan waktu harus konsisten dengan keputusan ini; risiko portabilitas/ambiguitas dicatat di ADR-009 |
| PRD-Q-Mastered | Aturan status `Mastered` pada lesson | **Approved — 2026-11-25** | D1: `Mastered` ditandai manual oleh owner; tanpa perhitungan otomatis. | Progress logic Phase 1 dapat memakai status manual; tidak ada field/skor otomatis sebelum keputusan baru |

OD-007 (deployment lokal vs online) telah ditutup sebagai **hybrid** dan tidak termasuk daftar terbuka. Provider database online juga telah ditutup sebagai **Neon Free** pada OD-002, tetapi bagian hosting OD-002 masih terbuka.

**Istilah open question di ADR-010 (2026-11-27):** `OD-001 (migrasi)` (versi Next.js/Auth.js), `OD-002 (migrasi)` (detail hosting/runtime), dan `OD-TEST` (strategi test) adalah label **khusus proposal migrasi** dan tidak mengubah status OD-001/OD-002/OD-003 yang sudah `Approved` di tabel atas. OD-002 existing tetap disetujui dengan constraint Fastify long-running; detail yang belum terselesaikan tercatat di [`od-002-deploy-constraint.md`](./od-002-deploy-constraint.md).

## 4. Hasil verifikasi provider (ringkas)

Verifikasi lengkap: [provider-verification.md](./provider-verification.md).

- **Neon Free** — **Approved** sebagai database online: $0 permanen, tanpa kartu, 100 CU-hours/project/bulan, 1 GB/project, 5 GB egress, scale-to-zero, tidak di-pause saat idle. Scheduled snapshot tidak tersedia pada Free, sehingga `pg_dump`/export tetap wajib.
- **Supabase Free** — alternatif; 500 MB, pause setelah 1 minggu idle, tanpa automatic backup.
- **Render** — static site gratis cocok untuk frontend; web service Free memiliki spin-down ±1 menit; Postgres Free expired 30 hari dan **tidak layak** sebagai DB utama.
- **Fly.io** dan **Hetzner Cloud** — memerlukan persetujuan biaya; tidak dipilih untuk target Rp0/bulan.

Semua angka adalah hasil desk research pada 2026-11-24. Tidak ada akun, project, domain, kartu, atau layanan berbayar yang dibuat atau diaktifkan.

## 5. Checklist persetujuan

- [x] Baseline v1.1 disetujui (P0.1-01).
- [x] Audit konsistensi ADR-001–ADR-009 selesai.
- [x] ADR-001–ADR-006 final untuk cakupan yang disetujui pengguna.
- [x] Password login digantikan Google Login di ADR-004 dan dokumen arsitektur.
- [x] Neon Free dan Rp0/bulan tercatat di ADR-003, ADR-005, dan register ini.
- [x] Rich Text / Block Editor tercatat di ADR-006 dan dokumen arsitektur.
- [x] Definition of Done dan change control final (P0.1-03).
- [x] OD-001 (pinning dependency backend yang disetujui) — Approved 2026-11-25; instalasi belum dilakukan.
- [x] OD-004 (format konten/import-export awal) — Approved 2026-11-25; A1 JSON block, export/import awal JSON.
- [x] OD-005 (versioning handbook/lesson) — Approved 2026-11-25; B1 append-only, approve eksplisit owner.
- [x] OD-008 (timezone default) — Approved 2026-11-25; C2 simpan waktu lokal Asia/Jakarta saja (pilihan pengguna).
- [x] PRD-Q-Mastered — Approved 2026-11-25; D1 manual oleh owner.
- [x] OD-003 (session/cookie/CSRF/guard scope) — Approved 2026-11-25; `GET /api/health` tetap publik. Implementasi Step 6 belum dimulai.
- [x] OD-006 (backup/restore) — Approved 2026-11-25; manual mingguan + sebelum schema, retensi 7 lokal, `./backups/` gitignored, `pg_dump -Fc` + SHA256, restore drill scratch non-produksi.
- [x] OD-002 (hosting/topologi online) — Approved 2026-11-26: frontend Vercel Free, API di Vercel, DB Neon Free, domain default, Rp0/bulan. **Constraint:** backend Fastify long-running saat ini butuh adaptasi deploy ke Vercel; belum diimplementasikan/diaktifkan.
- [x] Izin implementasi Phase 0 diberikan secara bertahap, satu task kecil pada satu waktu (Phase 0 selesai; sign-off Phase 1 diberikan pengguna 2026-11-26 dengan batasan diterima/ditunda).
- [ ] ADR-010 (proposal migrasi Next.js App Router) — **Proposed**; menunggu persetujuan implementasi, dependency, dan detail OD-001/OD-002 (migrasi) serta OD-TEST. ADR lama tidak diubah menjadi `Superseded`.

## 6. Aturan lanjutan yang disepakati

1. Pertahankan seluruh perubahan uncommitted yang sudah ada; tidak ada reset/checkout.
2. Sebelum izin implementasi diberikan: tidak ada perubahan source code, dependency, atau konfigurasi aplikasi.
3. Setelah izin diberikan: kerjakan **satu task kecil**, verifikasi, laporkan hasil, baru lanjut.
4. Gunakan template laporan: Phase/Slice, Goal, Status, Changed files, Verification, Risks/assumptions, Next smallest action.
5. Gunakan template task dan checklist DoD di [`task-template.md`](./task-template.md) untuk setiap slice; change control di [`change-control.md`](./change-control.md).
6. Tidak ada layanan berbayar atau akun provider yang dibuat tanpa persetujuan eksplisit terpisah.
