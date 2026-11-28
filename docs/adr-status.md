# Lembar Finalisasi ADR & Decision Register

- **Status:** P0.1-02 selesai untuk cakupan keputusan yang disetujui; detail yang belum disetujui tetap **Proposed**
- **Tanggal:** 2026-11-24
- **Diperbarui:** 2026-11-26 — OD-002 disetujui pengguna: frontend Vercel Free, API di Vercel, DB Neon Free, domain default, Rp0/bulan. **Catatan penting:** backend saat ini Fastify long-running Node server; deploy API ke Vercel membutuhkan adaptasi arsitektur/deploy (mis. serverless entrypoint/adapter) atau keputusan implementasi terpisah - belum diimplementasikan. OD-006 tetap Approved.
- **Diperbarui 2026-11-27 (M0b):** ADR-010 menjadi **Accepted** sebagai keputusan arsitektur migrasi ke Next.js App Router/Vercel. `Accepted` di sini **bukan** izin implementasi slice, instalasi dependency, push, atau deploy. ADR-002 dan ADR-004 ditandai `Accepted — superseded in part by ADR-010`; ADR-001, ADR-003, ADR-005–ADR-009 tetap `Accepted`.
- **Diperbarui 2026-11-28 (M1 — amandemen ADR-010):** **OD-001 (migrasi) = Decided 2026-11-28** berdasarkan riset analis 2026-11-28: Next.js 16.4.x minimal 16.4.5 di-pin exact (Cache Components tidak aktif; bukan 15.5), Node.js 24 Active LTS, TypeScript 7 + `experimental.useTypeScriptCli` dengan fallback 6.x, dan **Better Auth** sebagai library auth (usulan Auth.js/NextAuth **digantikan oleh amandemen 2026-11-28**; single-owner via `databaseHooks.user.create.before`). Schema: **tidak ada perubahan pada tabel domain; hanya penambahan tabel auth** (migrasi additive Slice 1; `sessions` tidak diubah). Informasi Better Auth/status v5/advisory Juli 2026 berasal dari sumber sekunder: Slice 1 wajib verifikasi sumber primer sebelum instal. **OD-002 (migrasi), termasuk pool Neon serverless, tetap Open.** Perubahan hanya dokumentasi; bukan izin slice/dependency/deploy.
- **Diperbarui 2026-11-27 (M0c — amandemen ADR-010):** Usulan A (refactor logika di Fastify sebelum migrasi) **ditolak**; mitigasi: tiap slice mengekstrak logika ke `lib/` dalam commit terpisah sebelum handler ditulis. Usulan B **disetujui**: Slice 0 memuat shell SPA (`src/App.tsx`) sebagai Client Component di Next.js, Slice 5 memecah shell menjadi route App Router dengan `?item=` dipertahankan. **OD-TEST Decided**: `node:test` + `tsx`, tanpa runner baru; Route Handler diuji sebagai fungsi `Request → Response`. Gerbang Slice 0: kompatibilitas Next.js dengan TypeScript 7 dan Node LTS (Node 20 di CI) wajib diverifikasi; bila tidak cocok, keputusan versi dikembalikan ke pengguna. Secret scan seluruh history bersih; branch/tag checkpoint di-push ke origin; repo tetap PUBLIC.
- **Peringatan:** Dokumen ini **bukan** bukti izin implementasi. Pengguna menyetujui keputusan arsitektur/stack pada 2026-11-24, tetapi belum memberikan izin implementasi Phase 0.
- **Riwayat:** P0.1-01 mengunci baseline v1.1 sebagai `Approved`; P0.1-02 mengaudit ADR-001–ADR-009 dan memisahkan keputusan yang disetujui dari Open Decisions yang masih terbuka; 2026-11-25 OD-001 disetujui untuk pinning dependency backend yang disebutkan di ADR-002.

## 1. Keputusan yang sudah disetujui pengguna

| Hal | Status | Cakupan | Sumber |
|---|---|---|---|
| Baseline Master Blueprint, PRD MVP, Roadmap v1.1 | **Approved — 2026-11-24** | Dokumen acuan implementasi | P0.1-01 |
| Arsitektur Modular Monolith, satu repository | **Approved** | Domain `learning`, `handbook`, `projects`, `shared/core` | Pengguna 2026-11-24 |
| Stack inti React + Vite + TypeScript + Fastify + PostgreSQL + Drizzle + Zod | **Accepted — superseded in part by ADR-010** | React + TypeScript + PostgreSQL + Drizzle + Zod tetap berlaku; **Vite dan Fastify digantikan** oleh Next.js App Router/Route Handlers menurut ADR-010. Pinning OD-001 2026-11-25 (`fastify@5.12.8`, `zod@4.6.7`, `drizzle-orm@0.45.4`, `drizzle-kit@0.31.11`, `pg@8.23.1`, `@types/pg@8.23.1`) menjadi riwayat untuk bagian yang tergantikan; `typescript`/`tsx` tetap existing. Belum dipasang. | Pengguna 2026-11-24, 2026-11-25; ADR-010 2026-11-27 |
| OD-001 (migrasi ADR-010) — versi & library auth | **Decided — 2026-11-28** | Next.js 16.4.x minimal 16.4.5 di-pin exact (Cache Components tidak aktif; bukan 15.5), Node.js 24 Active LTS, TypeScript 7 + `experimental.useTypeScriptCli` dengan fallback 6.x, **Better Auth** (usulan Auth.js/NextAuth **digantikan oleh amandemen 2026-11-28**). Tabel auth Better Auth ditambahkan secara additive; tabel domain/`sessions` tidak diubah. **Bukan izin instalasi/implementasi.** Ini berbeda dari OD-001 (pinning dependency backend) yang sudah Approved 2026-11-25 | Pengguna 2026-11-28; ADR-010 amandemen 2026-11-28 |
| Provider database online Neon Free | **Approved** | Target Rp0/bulan; tidak ada akun/project dibuat | Pengguna 2026-11-24 |
| Budget Rp0/bulan | **Approved** | Tanpa layanan berbayar tanpa persetujuan | Pengguna 2026-11-24 |
| Autentikasi Google Login | **Approved** | Satu owner, tanpa registrasi publik | Pengguna 2026-11-24 |
| Content authoring Rich Text / Block Editor | **Approved** | Format import/export belum termasuk | Pengguna 2026-11-24 |
| Deployment hybrid | **Approved** | Lokal penuh + target online; OD-007 ditutup | Pengguna 2026-11-24 |
| Single owner, tanpa multi-tenant/offline sync/AI internal MVP | **Approved** | Tidak ada perubahan scope MVP | Pengguna 2026-11-24 |
| Pertahankan frontend React + Vite + TypeScript | **Accepted — superseded in part by ADR-010** | React + TypeScript tetap; Vite digantikan Next.js App Router. Larangan migrasi tanpa ADR tetap dipatuhi — ADR-010 adalah ADR yang menyetujuinya. | Pengguna 2026-11-24; ADR-010 2026-11-27 |
| Source code, dependency, konfigurasi, database tidak diubah | **Accepted untuk sesi ini** | Berlaku untuk P0.1-01/P0.1-02 | Arahan pengguna |

Sebelum P0.1-02, sebagian besar poin di atas tercatat sebagai rekomendasi `Proposed`. Status tersebut kini diperbarui hanya untuk cakupan yang secara eksplisit disetujui pengguna. Rincian yang belum disetujui tetap `Proposed` dan tidak dianggap final.

## 2. Status ADR sebelum dan sesudah

| ADR | Judul | Sebelum | Sesudah | Cakupan Approved | Yang masih terbuka |
|---|---|---|---|---|---|
| ADR-001 | Application Architecture | Accepted | **Accepted** | Modular Monolith, satu repo, domain inti | Susunan folder backend & kontrak internal |
| ADR-002 | Frontend and Backend Stack | Proposed | **Accepted — superseded in part by ADR-010** | React + TS, Zod, dan Node + TS tetap Accepted; pilihan Vite/Fastify tergantikan oleh Next.js App Router/Route Handlers (ADR-010) | Instalasi dependency belum dilakukan; **OD-001 (migrasi) Decided 2026-11-28** (Next.js 16.4.x pin exact, Node 24, TS 7/CLI + fallback 6.x, library auth = Better Auth); bagian yang tergantikan tidak lagi jadi acuan implementasi |
| ADR-003 | Database and ORM | Proposed | **Accepted** | PostgreSQL, Drizzle, Neon Free, Rp0/bulan | Detail environment development; kuota saat aktivasi |
| ADR-004 | Authentication and Authorization | Proposed | **Accepted — superseded in part by ADR-010** | Requirement Google Login, single owner, tanpa registrasi publik, dan OD-003 (cookie/CSRF/guard) tetap Accepted; **implementasi auth manual/session buatan sendiri tergantikan** oleh library auth menurut ADR-010. Amandemen 2026-11-28 menetapkan **library = Better Auth** (usulan Auth.js/NextAuth **digantikan oleh amandemen 2026-11-28**), single-owner via `databaseHooks.user.create.before` | **OD-001 (migrasi) Decided 2026-11-28**: tabel auth Better Auth ditambahkan secara additive di Slice 1; tabel domain/`sessions` tidak diubah; nama tabel/kolom & adapter Drizzle wajib diverifikasi dari sumber primer sebelum instal. Detail cookie final tetap mengikuti requirement OD-003 |
| ADR-005 | Hosting and Deployment | Proposed (hybrid Accepted) | **Accepted** | Hybrid, Rp0/bulan, Neon Free sebagai DB online | Hosting/topologi/region/domain (OD-002) |
| ADR-006 | Content Authoring and Import | Proposed | **Accepted** | Rich Text / Block Editor sebagai authoring MVP; OD-004 disetujui 2026-11-25 (A1: JSON block, export/import awal JSON) | Implementasi editor/library, sanitasi block, dan endpoint import/export belum dibuat |
| ADR-007 | Content Versioning | Proposed | **Accepted** | OD-005 disetujui 2026-11-25 (B1: append-only version rows, approve eksplisit owner) | Desain schema/migrasi/endpoint versi belum dibuat |
| ADR-008 | Backup and Recovery | Proposed | **Accepted** | OD-006 backup/restore non-produksi disetujui 2026-11-25 (`pg_dump -Fc` + SHA256, mingguan + sebelum schema, retensi 7, `./backups/` gitignored, restore drill scratch) | Export portabel aplikasi/endpoint masih Proposed; implementasi P0.5-02 pending instruksi |
| ADR-009 | Default Timezone | Proposed | **Accepted** | OD-008 disetujui 2026-11-25 (C2: simpan waktu lokal Asia/Jakarta saja, pilihan pengguna) | Dampak konversi/portabilitas perlu dijaga saat implementasi schema/API |
| ADR-010 | Next.js App Router Migration | — | **Accepted** (amandemen 2026-11-27; **amandemen 2026-11-28**) | Arsitektur Next.js App Router/Vercel; Usulan B disetujui (Slice 0 shell SPA Client Component, Slice 5 pecah ke route App Router, `?item=` dipertahankan); Usulan A ditolak; OD-TEST `node:test` + `tsx` Decided; **OD-001 (migrasi) Decided 2026-11-28** (Next 16.4.x pin exact, Node 24, TS 7/CLI + fallback 6.x, Better Auth, schema additive); **bukan** izin slice/dependency/deploy | **OD-002 (migrasi)** detail hosting/runtime serta strategi pool Neon serverless masih **Open**; OD-TEST dan OD-001 (migrasi) sudah **Decided** |

Ringkasan: sembilan ADR (ADR-001–ADR-009) memiliki keputusan utama `Accepted` pada cakupan yang disetujui; sebelum ADR-010 tidak ada ADR yang `Proposed` pada level keputusan utama. OD-001/003/004/005/006/008/PRD-Q-Mastered disetujui 2026-11-25; OD-002 disetujui 2026-11-26 (frontend Vercel Free, API di Vercel, DB Neon Free, domain default, Rp0/bulan) dengan constraint adaptasi Fastify-long-running ke Vercel yang belum diimplementasikan. Tidak ada ADR yang diubah menjadi `Accepted` hanya karena rekomendasi dokumen, kecuali dicatat eksplisit sebagai pilihan/persetujuan pengguna.

**Catatan 2026-11-27 (M0b) — ADR-010:** pengguna menyetujui ADR-010 menjadi **Accepted** sebagai keputusan arsitektur migrasi ke Next.js App Router/Vercel. `Accepted` **TIDAK** memberi izin implementasi slice, instalasi dependency, push, atau deploy; tiap slice tetap butuh izin sendiri. ADR-002 dan ADR-004 ditandai `Accepted — superseded in part by ADR-010` karena Vite/Fastify dan implementasi auth manual tergantikan. ADR-001, ADR-003, ADR-005–ADR-009 tetap `Accepted` tanpa perubahan (Drizzle, Zod, PostgreSQL/Neon, timezone, backup, dan requirement Google Login single-owner tetap berlaku). Checkpoint berupa tag anotasi lokal `pre-nextjs-migration` dan branch `feat/nextjs-migration` tetap berasal dari HEAD `main` `d40df91e04e4eaddc88917e4e47c0cc10be9fce8`; tidak ada push/merge/reset atau commit ke `main`.

**Catatan 2026-11-27 (M0c) — amandemen ADR-010:** pengguna menolak Usulan A (refactor logika di Fastify sebelum migrasi) dan memilih Usulan B. Slice 0 sekarang memuat shell SPA `src/App.tsx` sebagai Client Component di dalam Next.js agar aplikasi terlihat berjalan sejak awal; Slice 5 berubah menjadi "pecah shell menjadi route App Router" dengan deep link `?item=` dipertahankan. Penolakan A dimitigasi dengan ekstraksi logika ke `lib/` di commit terpisah **sebelum** menulis handler pada tiap slice. OD-TEST menjadi **Decided**: `node:test` + `tsx`, tidak ada runner baru, Route Handler diuji sebagai fungsi `Request → Response`. Slice 0 mendapat gerbang kompatibilitas Next.js dengan TypeScript 7 dan Node LTS (CI memakai Node 20); bila tidak cocok, keputusan versi kembali ke pengguna. Push branch/tag checkpoint diizinkan setelah secret scan history bersih; repo tetap PUBLIC dan tidak ada perubahan kode/dependency/konfigurasi/CI/deploy.

**Catatan 2026-11-28 (M1) — OD-001 (migrasi) ditutup:** pengguna memutuskan Next.js **16.4.x** minimal **16.4.5** (patch keamanan 3 Nov 2026) di-pin exact setelah `npm view next dist-tags` di Slice 0, **Cache Components tidak diaktifkan**, **bukan Next.js 15.5** (menolak TypeScript >= 7); **Node.js 24.x Active LTS** (Node 20 EOL 30 Apr 2026; Vercel menonaktifkan build mulai 1 Okt 2026 — perubahan `engines`/`.nvmrc`/`ci.yml` di Slice 0); **TypeScript 7** dengan `experimental.useTypeScriptCli`, fallback **6.x** bila `next build` gagal; **Better Auth** menggantikan usulan Auth.js/NextAuth (**digantikan oleh amandemen 2026-11-28**) dengan pembatasan single-owner via `databaseHooks.user.create.before` (tolak email di luar `OWNER_EMAILS`). ADR-004 tetap `Accepted — superseded in part by ADR-010`, kini dengan penjelasan **library = Better Auth**. Pernyataan ADR-010 "tidak ada perubahan schema" direvisi menjadi **"tidak ada perubahan pada tabel domain; hanya penambahan tabel auth"** (tabel lama termasuk `sessions` tidak diubah/dihapus). Informasi Better Auth/status v5/advisory Juli 2026 berasal dari sumber sekunder; Slice 1 wajib verifikasi dokumentasi resmi, GitHub security advisory, dan npm sebelum instal, serta memastikan nama tabel/kolom dan adapter Drizzle. Gerbang verifikasi Slice 0/Slice 1 tercantum di ADR-010. **OD-002 (migrasi), termasuk pool Neon serverless, tetap Open.** Tidak ada izin implementasi, dependency, atau deploy yang diberikan oleh catatan ini.

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

**Istilah open question di ADR-010 (Accepted + amandemen M0c 2026-11-27; amandemen 2026-11-28):** `OD-001 (migrasi)` dan `OD-002 (migrasi)` adalah label **khusus keputusan migrasi ADR-010**, berbeda dari OD-001/OD-002 di tabel atas. **OD-001 (migrasi) = Decided 2026-11-28** (Next.js 16.4.x, Node 24, TS 7/CLI + fallback 6.x, Better Auth, tabel auth additive); **OD-002 (migrasi) tetap Open** (detail hosting/runtime dan pool Neon serverless); `OD-TEST` sudah **Decided** (`node:test` + `tsx`, Route Handler sebagai `Request → Response` dan amandemen 2026-11-28). Label ini tidak mengubah status OD-001/OD-002/OD-003 yang sudah `Approved` di tabel atas. OD-002 existing tetap disetujui dengan constraint Fastify long-running; detail yang belum terselesaikan tercatat di [`od-002-deploy-constraint.md`](./od-002-deploy-constraint.md).

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
- [x] ADR-010 (migrasi Next.js App Router) — **Accepted** sebagai keputusan arsitektur 2026-11-27, diamandemen M0c (Usulan B, Usulan A ditolak, OD-TEST **Decided**) dan **2026-11-28 (OD-001 migrasi Decided)**. Push checkpoint setelah secret scan bersih; repo PUBLIC. Masih bukan izin slice/dependency/deploy. ADR-002/ADR-004 ditandai `Accepted — superseded in part by ADR-010` (ADR-004: **library = Better Auth**); ADR-001/003/005–009 tidak diubah.
- [x] OD-001 (migrasi ADR-010) — **Decided 2026-11-28**: Next.js 16.4.x minimal 16.4.5 pin exact (tanpa Cache Components; bukan 15.5), Node.js 24 Active LTS, TypeScript 7 + `experimental.useTypeScriptCli` dengan fallback 6.x, **Better Auth** (single-owner via `databaseHooks.user.create.before`), hanya penambahan tabel auth (tabel domain/`sessions` tidak diubah). Sumber sekunder wajib diverifikasi di Slice 1; **bukan izin instalasi/implementasi**.
- [ ] OD-002 (migrasi ADR-010) — **tetap Open**: detail hosting/runtime dan strategi pool Neon untuk serverless; OD-002 existing (2026-11-26) tetap Approved dengan constraint Fastify long-running.

## 6. Aturan lanjutan yang disepakati

1. Pertahankan seluruh perubahan uncommitted yang sudah ada; tidak ada reset/checkout.
2. Sebelum izin implementasi diberikan: tidak ada perubahan source code, dependency, atau konfigurasi aplikasi.
3. Setelah izin diberikan: kerjakan **satu task kecil**, verifikasi, laporkan hasil, baru lanjut.
4. Gunakan template laporan: Phase/Slice, Goal, Status, Changed files, Verification, Risks/assumptions, Next smallest action.
5. Gunakan template task dan checklist DoD di [`task-template.md`](./task-template.md) untuk setiap slice; change control di [`change-control.md`](./change-control.md).
6. Tidak ada layanan berbayar atau akun provider yang dibuat tanpa persetujuan eksplisit terpisah.
