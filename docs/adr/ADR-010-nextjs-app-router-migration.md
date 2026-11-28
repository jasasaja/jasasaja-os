# ADR-010: Migrasi ke Next.js App Router

- **Status:** **Accepted** — keputusan arsitektur disetujui pengguna 2026-11-27; **Amandemen 2026-11-27** menetapkan Usulan B, revisi Slice 0/Slice 5, dan OD-TEST; **Amandemen 2026-11-28** menetapkan OD-001 (migrasi) = **Decided** (Next.js 16.4.x, Node 24, TypeScript 7/CLI dengan fallback 6.x, Better Auth; OD-002 migrasi tetap Open). **Accepted/Decided = keputusan arsitektur; TIDAK memberi izin implementasi slice, instalasi dependency, atau deploy.** Push branch/tag checkpoint diizinkan eksplisit pada M0c setelah secret scan bersih; repo tetap PUBLIC. Tiap slice implementasi tetap butuh izin sendiri. ADR-002 dan ADR-004 ditandai `Accepted — superseded in part by ADR-010` di `docs/adr-status.md`; ADR-001, ADR-003, ADR-005–ADR-009 tetap `Accepted`.
- **Tanggal:** 2026-11-27
- **Sumber:** Keputusan pengguna 2026-11-27 untuk memindahkan aplikasi ke Next.js (App Router) yang di-deploy ke Vercel; [`docs/change-control.md`](../change-control.md) gate arsitektur & dependency; [`docs/adr-status.md`](../adr-status.md); [`docs/od-002-deploy-constraint.md`](../od-002-deploy-constraint.md); inspeksi kode aktual di `src/`, `server/src/`, `package.json`, dan `server/src/db/`.
- **Checkpoint:** tag anotasi `pre-nextjs-migration` pada HEAD `main` `d40df91e04e4eaddc88917e4e47c0cc10be9fce8`; branch `feat/nextjs-migration` dan tag tersebut di-push ke `origin` pada 2026-11-27 (M0c, langkah 4) setelah secret scan history bersih. Repo tetap PUBLIC.

## Konteks

Stack yang berjalan saat ini (hasil inspeksi kode, bukan asumsi):

- **Frontend:** React 19 + Vite 8 + TypeScript 7, Tailwind CSS 4, `lucide-react`. Router bukan library: [`src/App.tsx`](../../src/App.tsx) memakai `window.history.pushState`/`popstate` dan query string (`?item=<id>`) untuk 5 halaman: `dashboard`, `learning`, `handbook`, `projects`, `settings`. Entry point [`src/main.tsx`](../../src/main.tsx) memakai `createRoot`; [`vite.config.ts`](../../vite.config.ts) memproxy `/api` ke `http://127.0.0.1:3001`.
- **Backend:** Fastify 5.12.8 + `tsx`. [`server/src/server.ts`](../../server/src/server.ts) menjalankan proses long-running dengan `app.listen` (default port `:3001`) dan handler `SIGINT`/`SIGTERM`. [`server/src/app.ts`](../../server/src/app.ts) mendaftarkan hook `authGuard`, 4 grup route, error envelope, dan `GET /api/health`. Total **34 endpoint `/api`** (health 1; auth 4; learning 11; handbook 8; projects 10).
- **Data:** PostgreSQL via Drizzle ORM 0.45.4 + `pg` 8.23.1. 11 tabel (termasuk `sessions`) dan 5 enum didefinisikan di [`server/src/db/schema/`](../../server/src/db/schema/), dengan 2 file migrasi SQL + metadata journal. Timestamp lokal Asia/Jakarta memakai `timestamp without time zone`; `targetDate`/`dueDate` memakai `date` (OD-008).
- **Validasi:** Zod 4.6.7. Schema didefinisikan **inline di dalam file route Fastify**, misalnya `contentJsonSchema`, `createLessonBodySchema`, `handbookContentJsonSchema`, `calendarDateSchema`, `listItemsQuerySchema`.
- **Auth:** Google Login ditulis manual di [`server/src/modules/shared/core/auth/`](../../server/src/modules/shared/core/auth/): OAuth start/callback, HMAC `state`/`nonce`, cookie opaque HttpOnly `SameSite=Lax`, session DB dengan `token_hash` + `csrf_token`, guard `Origin/Referer` + `Content-Type` + `X-CSRF-Token`, allowlist owner. Sesuai ADR-004/OD-003.
- **Test:** 10 file `*.test.ts` dengan `node:test` (5 frontend, 5 server). Harness meliputi [`server/src/test/db-mock.ts`](../../server/src/test/db-mock.ts) (mock `pg.Pool` + antrean ekspektasi query) dan [`server/src/modules/integration-handbook-project.db.test.ts`](../../server/src/modules/integration-handbook-project.db.test.ts) (scratch DB nyata + menjalankan file migrasi SQL yang sama). Test route memakai `app.inject()` Fastify.

Alasan pengguna memutuskan migrasi:

1. **Satu aplikasi** — frontend dan lapisan HTTP tidak lagi dua proses/Vite proxy yang terpisah; satu build, satu jalur lokal, satu deploy.
2. **Auth cookie satu origin** — cookie sesi, callback OAuth, dan pengecekan `Origin` menjadi konsisten karena UI dan `/api` berada di origin yang sama; mengurangi risiko konfigurasi lintas-origin.
3. **Selaras dengan stack utama pengguna dan Vercel** — React/TypeScript tetap dipakai, tetapi framework yang dipakai adalah Next.js yang didukung native oleh Vercel. Ini juga menjawab constraint OD-002: [`docs/od-002-deploy-constraint.md`](../od-002-deploy-constraint.md) mencatat bahwa Fastify long-running tidak langsung cocok dengan model Vercel dan belum diadaptasi.

Persetujuan 2026-11-27 mengizinkan checkpoint (`pre-nextjs-migration`), branch `feat/nextjs-migration`, dan menetapkan ADR ini sebagai **keputusan arsitektur**. Status `Accepted` tidak memberi izin implementasi slice, instalasi dependency, deploy, atau perubahan kode/konfigurasi/data; tiap slice tetap memerlukan izin eksplisit tersendiri. Push checkpoint diizinkan hanya melalui M0c setelah secret scan bersih.

## Amandemen 2026-11-27

Pengguna memutuskan amandemen ini pada 2026-11-27. Amandemen mengubah cakupan ADR-010 di bawah ini; bagian lain tetap mengikuti ADR-010 `Accepted` dari M0b. Amandemen ini **bukan** izin implementasi slice, instalasi dependency, atau deploy.

| Topik | Keputusan amandemen | Catatan |
|---|---|---|
| **Usulan A' — refactor logika di Fastify sebelum migrasi** | **Dipertimbangkan, ditolak pengguna** | Tidak ada fase refactor pra-migrasi. Mitigasi: tiap slice mengekstrak logika ke `lib/` dalam **commit terpisah sebelum menulis handler** Next.js, agar ekstraksi terverifikasi dan dapat dirollback tanpa mencampur rewrite handler. |
| **Usulan B — shell SPA lebih awal** | **Disetujui** | Slice 0 memuat shell SPA (`src/App.tsx`) sebagai **Client Component di dalam Next.js** agar aplikasi dapat dilihat berjalan sejak awal. Slice 5 berubah menjadi **memecah shell menjadi route App Router**; deep link `?item=` dipertahankan. |
| **OD-TEST** | **Decided — 2026-11-27** | `node:test` + `tsx` tetap dipakai; **tidak ada runner baru**. Route Handler diuji sebagai fungsi `Request → Response`; mock `pg.Pool` dan test DB nyata tetap dipakai. |
| **Gerbang verifikasi Slice 0** | **Wajib** | Riwayat: sebelum Slice 0 lulus, verifikasi kompatibilitas Next.js dengan **TypeScript 7** dan **Node LTS**. CI saat ini memakai **Node 20** (`.github/workflows/ci.yml`) dan perlu dievaluasi. Jika tidak cocok, **keputusan versi dikembalikan kepada pengguna** — jangan memilih versi sendiri. **Digantikan oleh amandemen 2026-11-28** (Node 24; Next.js 16.4.x pin exact; TS 7 + CLI checker dengan fallback 6.x). |

**Revisi Slice 0:** Kerangka Next.js App Router + TypeScript, `GET /api/health`, harness typecheck/lint/test (`node:test` + `tsx`), **serta shell SPA `src/App.tsx` sebagai Client Component di dalam Next.js** agar aplikasi terlihat berjalan sejak awal. Fastify tetap menjadi acuan paritas. Verifikasi minimal (riwayat 2026-11-27): build/typecheck/test lulus; health publik sesuai envelope; shell tampil; **kompatibilitas TypeScript 7 + Node LTS/Node 20 di CI terverifikasi**; bila tidak cocok, versi dikembalikan ke pengguna. **Gerbang versi ini digantikan oleh amandemen 2026-11-28** — lihat "Gerbang verifikasi Slice 0" pada amandemen tersebut.

**Revisi Slice 5:** Bukan lagi "memindahkan 5 halaman SPA ke App Router", melainkan **memecah shell SPA yang sudah berjalan sejak Slice 0 menjadi route App Router**. Deep link `?item=` dan perilaku navigasi existing dipertahankan; klien `apiFetch`, loading/error/empty state, serta QA aksesibilitas/responsive tetap diverifikasi.

Push checkpoint pada M0c diizinkan pengguna setelah secret scan seluruh history (semua branch dan tag) dinyatakan bersih. Urutan yang disetujui: verifikasi `git remote -v` menunjukkan `origin = https://github.com/jasasaja/jasasaja-os.git`, lalu `git push -u origin feat/nextjs-migration` dan `git push origin pre-nextjs-migration`. Repo tetap PUBLIC; visibilitas tidak diubah. **Gerbang versi pada amandemen 2026-11-27 (Node 20 di CI; versi dikembalikan ke pengguna bila tidak cocok) digantikan oleh amandemen 2026-11-28 di bawah ini.**

## Amandemen 2026-11-28 — OD-001 (migrasi) diputuskan

Pengguna menyetujui keputusan OD-001 (migrasi) pada 2026-11-28 berdasarkan riset analis tanggal 2026-11-28. Amandemen ini **hanya menetapkan keputusan arsitektur dan versi**; **bukan** izin implementasi slice, instalasi dependency, perubahan `package.json`/lockfile/kode/konfigurasi/CI/`engines`, atau deploy. Semua perubahan teknis dikerjakan pada Slice 0/Slice 1 setelah izin tersendiri. **OD-002 (migrasi), termasuk strategi pool Neon untuk serverless, tetap Open.**

| Topik | Keputusan (Decided — 2026-11-28) | Catatan |
|---|---|---|
| **Versi Next.js** | **Next.js 16.4.x**, minimal **16.4.5** (patch keamanan 3 Nov 2026); **di-pin exact** saat instalasi. Versi persis dicek saat Slice 0 dengan `npm view next dist-tags`. | **Cache Components TIDAK diaktifkan** — sebagian besar advisory terbaru menyangkut fitur itu dan proyek tidak membutuhkannya. **Jangan pakai Next.js 15.5**: jalur itu menolak TypeScript >= 7. |
| **Node.js** | **Node.js 24.x (Active LTS)**. | Node 20 sudah EOL (30 Apr 2026) dan Vercel menonaktifkannya untuk build mulai 1 Okt 2026. Perubahan `engines`, `.nvmrc`, dan `ci.yml` dikerjakan di **Slice 0, BUKAN di task ini**. |
| **TypeScript** | Coba **TypeScript 7** dengan `experimental.useTypeScriptCli` (CLI checker, default di Next.js 16.3+); jika `next build` gagal, **fallback ke TypeScript 6.x**. | Risiko rendah: hanya memengaruhi type-check saat build. Fallback dicatat di laporan Slice 0. |
| **Library auth** | **Better Auth**, menggantikan usulan Auth.js/NextAuth yang **digantikan oleh amandemen 2026-11-28**. | Alasan (riwayat usulan yang **digantikan oleh amandemen 2026-11-28**): Auth.js v5 belum pernah rilis stabil (`5.0.0-beta.32`), advisory Juli 2026 menyebut isu kritis (bypass autentikasi) yang memengaruhi beta v5, dan pemeliharaan Auth.js sudah dipegang tim Better Auth yang merekomendasikan Better Auth untuk proyek baru. Pembatasan **single-owner** lewat `databaseHooks.user.create.before` (tolak email di luar `OWNER_EMAILS`). |
| **Konsekuensi schema (disetujui)** | Better Auth memakai **tabel miliknya sendiri**; dikerjakan sebagai **migrasi tambahan (additive) di Slice 1**. Tabel lama (termasuk `sessions`) **tidak diubah/dihapus** dalam migrasi tersebut. | Pernyataan ADR-010 sebelumnya "tidak ada perubahan schema" **digantikan oleh amandemen 2026-11-28** menjadi: **"tidak ada perubahan pada tabel domain; hanya penambahan tabel auth"**. |
| **OD-002 (migrasi)** | **Tetap Open** | Termasuk strategi pool Neon untuk runtime serverless; tidak diputuskan oleh amandemen ini. |

### Catatan kualitas sumber (wajib)

Informasi tentang Better Auth, status Auth.js v5 (`5.0.0-beta.32`; riwayat usulan yang **digantikan oleh amandemen 2026-11-28**), dan advisory Juli 2026 berasal dari **sumber sekunder (blog/diskusi)**, bukan sumber primer. **Slice 1 WAJIB** memverifikasi dari sumber primer — dokumentasi resmi Better Auth, halaman security advisory GitHub, dan npm — **sebelum memasang** dependency. **Nama tabel/kolom Better Auth dan kompatibilitas adapter Drizzle belum diverifikasi**; jangan dianggap final sebelum verifikasi Slice 1.

### Gerbang verifikasi Slice 0 (ditambahkan amandemen 2026-11-28)

1. (a) Jalankan `npm view next dist-tags`, catat hasilnya, lalu **pin exact** versi Next.js 16.4.x terpilih (minimal 16.4.5); tanpa rentang `^`/`~`.
2. (b) Uji **TypeScript 7 + `experimental.useTypeScriptCli`**; jika `next build` gagal, **fallback ke TypeScript 6.x** dan catat alasannya.
3. (c) Pastikan **Node 24** tercermin di `engines`, `.nvmrc`, dan `ci.yml` (dikerjakan di Slice 0, bukan di task ini).
4. (d) Pastikan **Cache Components tidak aktif** (tidak ada konfigurasi/flag yang mengaktifkannya).

### Gerbang verifikasi Slice 1 (ditambahkan amandemen 2026-11-28)

1. (a) Sebelum instalasi, cek **advisory resmi Better Auth / GitHub** (halaman security advisory) dan verifikasi dokumentasi resmi serta npm.
2. (b) **Pin exact** versi Better Auth dan dependency terkait setelah verifikasi; catat versinya di laporan slice.
3. (c) Migrasi **tambahan (additive), non-destruktif, dan terdokumentasi**; diuji di **scratch DB**; tabel lama termasuk `sessions` tidak diubah/dihapus.
4. (d) **Single-owner** via `databaseHooks.user.create.before`; uji **penolakan email di luar `OWNER_EMAILS`**.
5. (e) Uji **E2E Google OAuth dengan kredensial nyata** (bukan mock).
6. (f) Uji **`401`/`403`** dan flag cookie **`HttpOnly`, `SameSite=Lax`, `Secure`** (env-aware).
7. (g) Gunakan **`proxy.ts`** (Next.js 16 mengganti nama `middleware.ts`), **bukan `middleware.ts`**.
8. (h) Pastikan **tidak ada secret di log/diff**.

## Keputusan

- **Next.js App Router + TypeScript** sebagai satu aplikasi. Komponen React yang ada dipertahankan sedapat mungkin; halaman dipindah ke App Router (`app/`), dengan Server Components hanya bila tidak mengubah kontrak data dan perilaku auth.
- **Route Handlers dan/atau Server Actions menggantikan seluruh route Fastify** di `server/src/app.ts` dan `server/src/modules/*/routes.ts`. Envelope `{ "data": ... }` / `{ "error": { code, message, details } }` dan prefix `/api` dipertahankan agar klien existing tidak berubah sekaligus. Server Actions dipertimbangkan untuk mutasi yang benar-benar berupa aksi owner, bukan pengganti otomatis semua endpoint.
- **Drizzle + Zod dipertahankan.** Pernyataan awal "Schema dan migrasi tidak diubah pada migrasi ini" **digantikan oleh amandemen 2026-11-28**: **tidak ada perubahan pada tabel domain; hanya penambahan tabel auth** (migrasi additive Better Auth di Slice 1). Zod diekstraksi dari file route menjadi modul validasi bersama supaya bisa dipakai Route Handlers/Server Actions maupun test.
- **Auth diganti library teruji: Better Auth** (riwayat: usulan Auth.js/NextAuth dengan provider Google, **digantikan oleh amandemen 2026-11-28**), bukan menulis ulang OAuth/cookie/CSRF manual. Hasil yang wajib dipertahankan: Google Login, satu owner (`OWNER_EMAILS`) lewat `databaseHooks.user.create.before`, tanpa registrasi publik, cookie HttpOnly/`SameSite=Lax`/`Secure` env-aware, validasi `state`/`nonce`, CSRF defense-in-depth, `GET /api/health` publik, sisanya terlindungi. Versi Next.js/Node/TypeScript dan library auth sudah diputuskan sebagai OD-001 (migrasi) pada 2026-11-28; detail teknis tabel/kolom dan adapter Drizzle tetap diverifikasi di Slice 1.
- **Neon tetap sebagai database online** (Rp0/bulan, OD-002 yang sudah disetujui). Strategi koneksi/pooling untuk runtime serverless Vercel dievaluasi saat implementasi; tidak ada akun/project yang dibuat oleh ADR ini.
- Prioritas adalah **paritas perilaku**: 34 endpoint, aturan versioning, error envelope, dan timezone tetap sama sampai setiap slice dinyatakan lulus verifikasi.

### Status turunan

| Keputusan | Status | Keterangan |
|---|---|---|
| Next.js App Router + TypeScript | **Accepted (keputusan arsitektur)** | Implementasi menunggu izin slice; bukan izin dependency/deploy; versi final **Decided 2026-11-28** (Next.js 16.4.x pin exact, Node 24, TS 7 + CLI checker dengan fallback 6.x; Cache Components nonaktif) jadi gerbang Slice 0 |
| Route Handlers/Server Actions menggantikan Fastify | **Accepted sebagai arah arsitektur** | 34 endpoint `/api` saat ini; paritas kontrak wajib, dikerjakan per slice; ekstraksi ke `lib/` di commit terpisah sebelum handler; gunakan `proxy.ts`, bukan `middleware.ts` (Next.js 16) |
| Drizzle schema & migrasi dipertahankan | **Accepted sebagai keputusan lanjutan** | ADR-003 tetap `Accepted`; **tidak ada perubahan pada tabel domain; hanya penambahan tabel auth** (amandemen 2026-11-28, migrasi additive Slice 1) |
| Zod dipertahankan | **Accepted sebagai keputusan lanjutan** | ADR-002 bagian Zod tetap `Accepted`; ekstraksi dari route Fastify menyusul saat slice diizinkan |
| Library auth teruji menggantikan OAuth manual | **Decided — 2026-11-28 (OD-001 migrasi)** | **Better Auth**; usulan Auth.js/NextAuth **digantikan oleh amandemen 2026-11-28**. Single-owner via `databaseHooks.user.create.before`; tabel/kolom & adapter Drizzle diverifikasi di Slice 1 dari sumber primer |
| Google Login, single owner, tanpa registrasi publik | **Accepted sebagai requirement** | ADR-004/OD-003 tetap berlaku |
| Neon Free sebagai DB online | **Accepted** | OD-002 2026-11-26; detail deploy masih terbuka |
| Vercel sebagai target deploy (OD-002 existing) | **Accepted** | OD-002 2026-11-26 dengan constraint; detail hosting/runtime migrasi tetap **Proposed** (OD-002 migrasi masih **Open**) |
| Strategi test `node:test` + `tsx` (OD-TEST) | **Decided — 2026-11-27** | Tanpa runner baru; Route Handler diuji sebagai fungsi `Request → Response` |
| Slice 0 — shell SPA sebagai Client Component | **Disetujui (Amandemen 2026-11-27)** | Aplikasi terlihat berjalan sejak awal; Slice 5 memecah shell ke route App Router dengan `?item=` dipertahankan |
| Instalasi dependency / perubahan `package.json` & lockfile | **Tidak diizinkan pada ADR ini** | Butuh izin eksplisit terpisah |
| Status ADR-001–ADR-009 | **ADR-002 & ADR-004: Accepted — superseded in part by ADR-010** | ADR-001, ADR-003, ADR-005–ADR-009 tetap `Accepted` |
| `git push` branch/tag checkpoint | **Diizinkan pada M0c** | Setelah secret scan bersih; origin terverifikasi; repo tetap PUBLIC |
| Deploy / aktivasi akun / `push` ke main | **Tidak diizinkan** | Butuh izin eksplisit terpisah; tidak ada force push, merge, rebase, atau reset |

## Opsi yang dipertimbangkan

| Opsi | Kompleksitas | Biaya | Satu origin/auth | Deploy Vercel | Status |
|---|---|---|---|---|---|
| **C — Next.js App Router, satu app (dipilih)** | Tinggi saat migrasi, rendah setelahnya | Rp0/bulan sesuai target existing | Baik: cookie & callback satu origin | Native | **Accepted** (keputusan arsitektur) |
| **A — Vite + Fastify host terpisah** | Sedang | Rp0–rendah (tergantung host API) | Buruk/rapuh: dua origin, CORS/allowlist, cookie lintas host, dua deploy | Frontend mudah; API butuh adaptasi serverless | **Tidak dipilih** — tidak menyelesaikan constraint OD-002 |
| **B — Vite + Fastify satu server** (Fastify menyajikan `dist/` + `/api`) | Sedang | Rp0–rendah | Baik: satu origin | Tidak native: proses long-running tetap perlu host Node/adaptor | **Tidak dipilih** — constraint OD-002 tetap ada |

Opsi A/B tetap dicatat sebagai arsip perbandingan; keduanya tidak mengubah kode atau dependency sekarang. Selain itu, **Usulan A' (refactor logika di Fastify sebelum migrasi) dipertimbangkan dan ditolak pengguna pada 2026-11-27**; mitigasinya tercatat di Amandemen 2026-11-27 — tiap slice mengekstrak logika ke `lib/` dalam commit terpisah sebelum menulis handler Next.js.

## Konsekuensi dan risiko

**Positif yang diharapkan:** satu codebase dan satu origin untuk UI + API; proxy development dan constraint Fastify-on-Vercel hilang; konfigurasi cookie/OAuth/CSRF lebih sederhana; stack selaras dengan keahlian pengguna dan platform deploy yang sudah dipilih.

**Negatif / biaya:** seluruh lapisan HTTP (34 endpoint) dan auth manual harus ditulis ulang; halaman SPA/routing buatan sendiri harus dipindah ke App Router; harness test berbasis `app.inject()` perlu diganti; diperlukan waktu untuk verifikasi paritas per modul. Selama transisi dapat terjadi dua sumber kebenaran bila Fastify dan Next dijalankan bersamaan — harus dihindari dengan slice yang jelas.

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Regresi aturan bisnis (append-only version, satu versi `Approved`, `FOR UPDATE`, partial unique index, `Mastered` manual) | Data/status konten salah | Pindahkan logika Drizzle apa adanya ke `lib/`, uji ulang tiap modul sebelum modul berikutnya |
| Regresi auth/cookie/CSRF/OAuth callback | Owner terkunci atau akses tidak sah | Uji paritas `401/403`, cookie flags, `state`/`nonce`, CSRF sebelum slice UI/deploy |
| Schema Zod berada di dalam file route Fastify | Validasi tidak bisa langsung diimpor Next | Ekstraksi ke modul validasi bersama sebagai bagian dari slice modul |
| `sessions` existing tidak cocok dengan skema Better Auth | Risiko berkurang: tabel lama (termasuk `sessions`) tidak diubah/dihapus | Amandemen 2026-11-28: Better Auth memakai tabel sendiri sebagai migrasi additive di Slice 1; uji di scratch DB; jangan mengubah tabel domain tanpa izin |
| Informasi Better Auth/status Auth.js v5 (riwayat usulan yang **digantikan oleh amandemen 2026-11-28**)/advisory Juli 2026 berasal dari sumber sekunder | Versi, advisory, atau adapter bisa berbeda dari fakta di lapangan | Slice 1 wajib verifikasi dari dokumentasi resmi Better Auth, GitHub security advisory, dan npm sebelum instal; nama tabel/kolom & adapter Drizzle belum diverifikasi |
| Cache Components tidak sengaja aktif | Paparan advisory Next.js terbaru | Amandemen 2026-11-28: Cache Components TIDAK diaktifkan; diverifikasi di Slice 0 |
| Pool `pg` long-running vs runtime serverless Vercel | Koneksi habis / cold start | Pilih strategi koneksi di OD-002 (migrasi, tetap **Open**); smoke test sebelum deploy |
| Perubahan dependency/library belum disetujui | Melanggar gate change-control | Tidak ada instalasi sampai izin terpisah; versi masuk OD-001 (migrasi) |
| Timezone `timestamp without time zone` + `date` | Salah tampil tanggal | Pertahankan konvensi ADR-009/OD-008; uji nilai batas hari |
| Rollback hanya kode, bukan data | Data tak sengaja terhapus | Tidak ada migrasi destruktif; gunakan dump ADR-008 bila pemulihan data benar-benar diperlukan |

## Inventaris berdasarkan kode aktual

### Dipakai ulang (dengan adaptasi boundary)

| Bagian | Bukti di repository | Catatan pemakaian ulang |
|---|---|---|
| Schema Drizzle | `server/src/db/schema/{shared,learning,handbook,projects,index}.ts` — 11 tabel, 5 enum, `localTimestamp`, FK `onDelete: "restrict"`, unique index | Impor langsung dari `lib/db/schema`; amandemen 2026-11-28: **tidak ada perubahan pada tabel domain; hanya penambahan tabel auth** (migrasi additive Slice 1) |
| Migrasi | `server/src/db/migrations/0000_init.sql`, `0001_add_sessions.sql`, `meta/_journal.json`, snapshot | File SQL yang sama dipakai test/integrasi; prosedur deploy tetap non-destruktif |
| Seed | `server/src/db/seed/seed.ts` | Skrip seed tetap berguna untuk lokal/scratch; perlu pemeriksaan saat dependency diizinkan |
| Zod schema & helper | `server/src/modules/{learning,handbook,projects}/routes.ts`: `contentJsonSchema`, `handbookContentJsonSchema` (6 bagian + provenance), `calendarDateSchema`, `listItemsQuerySchema`, `sanitizeSearchTerm` | Logika validasi dipertahankan, tetapi **diekstraksi** dari `register*Routes` ke modul bersama |
| Logika modul `learning` | `server/src/modules/learning/routes.ts`: transaksi buat lesson + versi 1 `Draft`, next-version, approve (`Draft → Approved`, lama `Deprecated`), progress upsert `PATCH`/`PUT`, `toLessonVersion`/`toLessonProgress` | Query/transaksi Drizzle dipindah ke service `lib/`; tanda tangan Fastify diganti handler web |
| Logika modul `handbook` | `server/src/modules/handbook/routes.ts`: `resolveVersions`, `toItemSummary`, pencarian `ilike`, lock `.for("update")` + backstop partial unique index saat approve | Dipertahankan persis; paritas diuji dengan DB nyata |
| Logika modul `projects` | `server/src/modules/projects/routes.ts`: `countProjectChildren`, `resolveHandbookReferences`, validasi milestone/task, konversi `date` (`toDateValue`/`toDateString`), referensi lintas modul berupa ID | Dipindah ke service; tidak mengubah aturan reference |
| Error envelope | `server/src/modules/shared/core/errors.ts` (`AppError`, `ApiErrorCode`, `ApiErrorBody`) + formatting Zod di `server/src/app.ts` | Dipetakan ke Response `NextResponse`/Route Handler dengan kode/status yang sama |
| Konfigurasi & DB core | `server/src/modules/shared/core/auth/config.ts`, `db.ts`, `logger.ts` (redact cookie/token) | Env/redaksi dipakai ulang; `db.ts` perlu strategi pool serverless (OD-002 migrasi) |
| Test DB | `server/src/test/db-mock.ts` (`installDbMock`, `pushQuery`, `assertDbMockDone`) dan `integration-handbook-project.db.test.ts` (scratch DB + `applyMigrations()` dari file SQL nyata) | Ekspektasi query dan migrasi nyata tetap jadi pengaman aturan bisnis; harness adaptif ke pemanggilan handler |
| Test murni frontend | `src/design-system/tokens.test.ts`, `src/utils/{navigation,settings,dashboardActivity,focusTrap}.test.ts` | Tidak bergantung Fastify/Vite; dapat tetap dijalankan |
| Komponen presentasi React | `src/components/layout/*`, `src/components/ui/*`, `src/components/views/*`, `src/design-system/tokens.ts`, `src/index.css` | Dipertahankan sebagai Client Components; logika `useEffect` fetch disesuaikan jika diperlukan |
| Klien API | `src/lib/api.ts` (`apiFetch`, `ApiClientError`, `credentials: "include"`, `X-CSRF-Token`) | Dipakai ulang bila envelope `/api` tetap sama |

### Ditulis ulang

| Bagian | Bukti di repository | Alasan |
|---|---|---|
| Server entry & wiring | `server/src/server.ts`, `server/src/app.ts` (`buildApp`, `authGuard`, `registerApiErrorHandlers`, `app.listen`, signal handler) | Tidak ada Fastify instance di Next.js; lifecycle digantikan runtime Next/Vercel |
| 34 registrasi route Fastify | `server/src/modules/*/routes.ts` dengan `FastifyInstance`, `request`, `reply` | Ditulis sebagai `app/api/.../route.ts` (Route Handlers) / Server Actions; perlu mapping `Request`/`Response` |
| Auth manual | `server/src/modules/shared/core/auth/{routes,guard,cookies,crypto,oauth-state,sessions}.ts` — OAuth fetch, HMAC state, cookie serialization, guard, session create/revoke | Diganti **Better Auth** (OD-001 diputuskan 2026-11-28; riwayat usulan Auth.js/NextAuth **digantikan oleh amandemen 2026-11-28**); requirement ADR-004/OD-003 tetap mengikat. Tabel `sessions` tidak diubah/dihapus; tabel Better Auth ditambahkan secara additive di Slice 1 |
| Halaman/routing SPA | `src/main.tsx` (`createRoot`), `src/App.tsx` (`pushState`/`popstate`, `resolveRoute`, deep-link `?item`), 5 `src/components/views/*View.tsx` sebagai halaman | Amandemen 2026-11-27: Slice 0 memakai shell `src/App.tsx` sebagai Client Component di Next.js; Slice 5 memecah shell menjadi route App Router (`app/layout.tsx`, segmen halaman) dengan `?item=` dipertahankan; komponen UI anak dipakai ulang |
| Build & dev config | `vite.config.ts` (proxy `/api`, copy asset plugin), `index.html`, `package.json` scripts `dev`/`dev:api`/`build`/`test`, `tsconfig.json`, `server/tsconfig.json`, `drizzle.config.ts`, `.github/workflows/ci.yml`, `README.md` | Perlu konfigurasi Next/build/test baru **hanya setelah izin implementasi** |
| Harness test route | `app.inject()` di `server/src/modules/*/routes.test.ts` dan `e2e-handbook-project.routes.test.ts` | Diganti pemanggilan handler/route Next; ekspektasi SQL dan rule tetap dipertahankan |

## Rencana bertahap per modul dan rollback

Setiap slice memerlukan izin implementasi tersendiri, satu slice kecil, verifikasi, laporan, baru lanjut (sesuai `docs/change-control.md`). Tidak ada slice yang dikerjakan oleh ADR ini.

| Slice | Lingkup | Verifikasi minimal sebelum lanjut |
|---|---|---|
| 0 — Fondasi (diubah M0c; gerbang diperbarui 2026-11-28) | Kerangka Next.js App Router + TypeScript, `GET /api/health`, harness typecheck/lint/test (`node:test` + `tsx`), **serta shell SPA `src/App.tsx` sebagai Client Component** agar aplikasi terlihat berjalan; Fastify masih acuan paritas | Build/typecheck/test lulus; health publik sesuai envelope; shell tampil; **4 gerbang Slice 0 dari amandemen 2026-11-28** (`npm view next dist-tags` + pin exact; TS 7 + CLI checker dengan fallback 6.x; Node 24 di `engines`/`.nvmrc`/`ci.yml`; Cache Components tidak aktif) |
| 1 — Auth (diperbarui 2026-11-28) | **Better Auth** (OD-001 migrasi sudah **Decided 2026-11-28**), Google Login single-owner via `databaseHooks.user.create.before`, cookie/CSRF/OAuth state, `/api/auth/me`, `/api/auth/logout`; tabel auth ditambahkan secara additive, tabel domain termasuk `sessions` tidak diubah | **8 gerbang Slice 1 dari amandemen 2026-11-28** (verifikasi advisory/sumber primer sebelum instal; pin exact; migrasi additive non-destruktif terdokumentasi dan diuji di scratch DB; uji penolakan email non-owner; E2E OAuth kredensial nyata; uji `401/403` dan cookie `HttpOnly`/`SameSite=Lax`/`Secure`; `proxy.ts`, bukan `middleware.ts`; tanpa secret di log/diff) |
| 2 — Learning | 11 endpoint + Zod + transaksi versi/progress (tanpa perubahan tabel domain) | Paritas 11 endpoint; aturan `Draft → Approved`, `Mastered`, dan `PUT`/`PATCH` progress lulus |
| 3 — Handbook | 8 endpoint + pencarian + approval dengan lock/partial unique index | Paritas 8 endpoint; uji DB nyata untuk satu-versi-Approved |
| 4 — Projects | 10 endpoint + milestone/task + referensi handbook | Paritas 10 endpoint; konversi tanggal `YYYY-MM-DD` dan referensi lintas modul lulus |
| 5 — UI (diubah M0c) | **Pecah shell SPA dari Slice 0 menjadi route App Router**; deep link `?item=`, klien `apiFetch`, QA manual | Navigasi/deep link, loading/error/empty state, aksesibilitas/responsive sesuai baseline |
| 6 — Deploy (terpisah) | Vercel + Neon, env/secrets, prosedur migrasi, smoke test; butuh detail OD-002 (migrasi) + izin deploy | Deploy-ready dinyatakan hanya setelah smoke test dan checklist deploy disetujui |

**Rollback per slice:** hentikan slice, alihkan kembali ke artefak/commit terakhir yang lulus sebelum slice tersebut. Kode dapat dikembalikan dari tag lokal `pre-nextjs-migration` (misalnya membuat branch/restore dari tag; **jangan** menyentuh `main` atau melakukan reset tanpa izin). Amandemen 2026-11-28: tidak ada perubahan pada tabel domain; penambahan tabel auth Better Auth di Slice 1 bersifat additive dan tabel lama (termasuk `sessions`) tidak diubah/dihapus, sehingga rollback data domain umumnya tidak diperlukan. Bila suatu slice tetap mengubah data, jangan menghapus/menimpa data — gunakan dump `pg_dump -Fc` + checksum sesuai ADR-008 dan verifikasi restore di DB scratch. Tag dan branch checkpoint telah di-push ke `origin` pada M0c setelah secret scan bersih; repo tetap PUBLIC. Push lain tetap memerlukan izin eksplisit.

## Open questions

| ID | Topik | Status | Yang perlu diputuskan |
|---|---|---|---|
| **OD-001 (migrasi)** | Versi Next.js, Node/TypeScript & library auth — riwayat usulan Auth.js/NextAuth **digantikan oleh amandemen 2026-11-28** | **Decided — 2026-11-28** | Diputuskan: Next.js 16.4.x minimal 16.4.5 pin exact (tanpa Cache Components; bukan 15.5), Node 24 Active LTS, TS 7 + `experimental.useTypeScriptCli` dengan fallback 6.x, dan **Better Auth** (single-owner via `databaseHooks.user.create.before`). Tabel auth Better Auth ditambahkan secara additive; tabel domain/`sessions` tidak diubah. Verifikasi sumber primer/nama tabel/adapter Drizzle menjadi gerbang Slice 1. **Ini bukan OD-001 (pinning Fastify/Zod/Drizzle) di `adr-status.md` yang sudah Approved 2026-11-25**; `OD-001 (migrasi)` dicatat terpisah di register. |
| **OD-002 (migrasi)** | Detail hosting & runtime | **Open** | Konfigurasi Vercel (region/env/secrets/domain default), strategi pool Neon untuk serverless, dan apakah lingkup OD-002 existing (frontend + API di Vercel) tetap dipertahankan tanpa perubahan keputusan. **Ini bukan pengajuan ulang OD-002 yang sudah Approved 2026-11-26**; constraint Fastify long-running masih tercatat di [`od-002-deploy-constraint.md`](../od-002-deploy-constraint.md). |
| **OD-TEST** | Strategi test pasca-migrasi | **Decided — 2026-11-27** | `node:test` + `tsx` dipertahankan; **tidak ada runner baru**. Route Handler diuji sebagai fungsi `Request → Response`; mock `pg.Pool` dan DB integration test tetap dipakai. |

## Verifikasi saat implementasi

- `GET /api/health` publik; seluruh endpoint selain allowlist auth mengembalikan `401` tanpa sesi dan `403` untuk identitas bukan owner.
- 34 endpoint existing memiliki path, method, status code, dan envelope `{ data }` / `{ error }` yang setara (termasuk `PUT` progress yang saat ini ada).
- Aturan versioning learning/handbook, partial unique index, satu versi `Approved`, dan `Mastered` manual lulus test dengan DB nyata.
- Cookie `HttpOnly`, `SameSite=Lax`, `Secure` env-aware; `state`/`nonce`, Origin/Referer, `Content-Type: application/json`, dan `X-CSRF-Token` tetap diverifikasi. Untuk Better Auth, uji penolakan email di luar `OWNER_EMAILS` lewat `databaseHooks.user.create.before` dan E2E Google OAuth dengan kredensial nyata; gunakan `proxy.ts` (Next.js 16), bukan `middleware.ts`.
- Format tanggal `YYYY-MM-DD` dan timestamp lokal Asia/Jakarta tidak berubah (ADR-009/OD-008).
- Seluruh test yang relevan lulus (frontend murni, modul, integrasi DB) dengan harness yang sudah disesuaikan; Route Handler diuji sebagai fungsi `Request → Response` memakai `node:test` + `tsx`, tanpa runner baru; tidak ada test yang dilewati tanpa alasan tercatat.
- Tidak ada secret/token/cookie value di log, diff, atau response; dependency, lockfile, dan konfigurasi baru hanya berubah setelah izin eksplisit. Sebelum instalasi Better Auth, verifikasi advisory resmi GitHub/dokumentasi resmi/npm; migrasi additive pada scratch DB tanpa mengubah tabel domain maupun `sessions`.

## Riwayat perubahan

- 2026-11-27: ADR dibuat dengan status `Proposed` setelah pengguna memutuskan migrasi ke Next.js App Router/Vercel. Tag anotasi `pre-nextjs-migration` dibuat di HEAD `main` `d40df91e...` dan branch `feat/nextjs-migration` dibuat dari commit yang sama. Inventaris disusun dari kode aktual; tidak ada source code, dependency, konfigurasi, database, atau deploy yang diubah. Status ADR lama tidak disentuh.
- 2026-11-27 (M0b): pengguna menyetujui ADR-010 menjadi **Accepted** sebagai keputusan arsitektur. Catatan mengikat: `Accepted` **TIDAK** memberi izin implementasi slice, instalasi dependency, push, atau deploy; tiap slice tetap butuh izin sendiri. Status turunan diselaraskan: Next.js App Router/Route Handlers, Drizzle, Zod, target Vercel, Google Login/single-owner, dan Neon menjadi Accepted; library auth, detail hosting/runtime, serta OD-001/OD-002/OD-TEST (migrasi) tetap `Proposed`/**Open**. Di `docs/adr-status.md`, ADR-002 dan ADR-004 ditandai `Accepted — superseded in part by ADR-010`; ADR-001, ADR-003, ADR-005–ADR-009 tidak diubah. Tidak ada slice atau rencana baru yang ditambahkan.
- 2026-11-27 (M0c): pengguna menolak Usulan A (refactor logika di Fastify sebelum migrasi) dan menyetujui **Usulan B**: Slice 0 memuat shell SPA `src/App.tsx` sebagai Client Component di dalam Next.js, Slice 5 memecah shell menjadi route App Router dengan deep link `?item=` dipertahankan. Mitigasi penolakan A: tiap slice mengekstrak logika ke `lib/` dalam commit terpisah sebelum menulis handler. **OD-TEST Decided**: `node:test` + `tsx`, tanpa runner baru, Route Handler diuji sebagai fungsi `Request → Response`. Gerbang Slice 0 ditambahkan: kompatibilitas Next.js dengan TypeScript 7 dan Node LTS (Node 20 di CI) wajib diverifikasi; bila tidak cocok, versi dikembalikan ke pengguna. Secret scan seluruh history bersih (tanpa `.env*` selain `.env.example`, tanpa pola secret yang dicari, `.env.example` hanya placeholder); remote origin diverifikasi, lalu branch dan tag checkpoint di-push. Repo tetap PUBLIC; tidak ada perubahan kode, dependency, konfigurasi, CI, atau deploy.
- 2026-11-28 (M1): pengguna menyetujui **OD-001 (migrasi) = Decided** berdasarkan riset analis 2026-11-28: Next.js 16.4.x minimal 16.4.5 pin exact (Cache Components nonaktif; bukan 15.5), Node.js 24 Active LTS, TypeScript 7 + `experimental.useTypeScriptCli` dengan fallback 6.x, dan **Better Auth** menggantikan usulan Auth.js/NextAuth (**digantikan oleh amandemen 2026-11-28**). Pernyataan "tidak ada perubahan schema" direvisi menjadi "tidak ada perubahan pada tabel domain; hanya penambahan tabel auth" (migrasi additive Slice 1; `sessions` tidak diubah). Info Better Auth/status v5/advisory Juli 2026 tercatat sebagai sumber sekunder yang wajib diverifikasi di Slice 1. Gerbang verifikasi Slice 0/Slice 1 ditambahkan; OD-002 (migrasi) tetap Open. **Hanya dokumentasi yang diubah** (satu commit dokumentasi ADR/register) — tidak ada dependency, kode, konfigurasi, CI, `engines`, database, push, merge, rebase, reset, atau perubahan pada `main`/tag.

## Rollback

Kembalikan aplikasi ke checkpoint `pre-nextjs-migration` (kode, konfigurasi, dan build terakhir yang dikenal baik) dan hentikan jalur Next.js yang sedang dicoba. Gunakan branch/restore dari tag sesuai mekanisme git yang disetujui; push checkpoint pada M0c sudah dilakukan dengan izin eksplisit. **Jangan** melakukan `push` baru, force push, `reset`, `rebase`, merge, atau perubahan pada `main` tanpa izin. Database tidak diubah oleh ADR ini; bila slice implementasi kemudian mengubah data, lakukan pemulihan hanya dari dump terverifikasi sesuai ADR-008, dengan persetujuan eksplisit untuk operasi destruktif.
