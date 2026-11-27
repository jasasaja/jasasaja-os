# ADR-010: Migrasi ke Next.js App Router

- **Status:** **Proposed** — menunggu persetujuan pengguna untuk implementasi. ADR ini **tidak** memberi izin mengubah dependency, kode, konfigurasi, data, atau melakukan deploy. ADR-001–ADR-009 tetap `Accepted` pada cakupan yang disetujui; status `Superseded` baru dicatat setelah persetujuan terpisah.
- **Tanggal:** 2026-11-27
- **Sumber:** Keputusan pengguna 2026-11-27 untuk memindahkan aplikasi ke Next.js (App Router) yang di-deploy ke Vercel; [`docs/change-control.md`](../change-control.md) gate arsitektur & dependency; [`docs/adr-status.md`](../adr-status.md); [`docs/od-002-deploy-constraint.md`](../od-002-deploy-constraint.md); inspeksi kode aktual di `src/`, `server/src/`, `package.json`, dan `server/src/db/`.
- **Checkpoint:** tag anotasi `pre-nextjs-migration` pada HEAD `main` `d40df91e04e4eaddc88917e4e47c0cc10be9fce8` (lokal, belum di-push).

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

Persetujuan ini **hanya** mengizinkan checkpoint (`pre-nextjs-migration`), branch `feat/nextjs-migration`, dan ADR proposal ini. Tidak ada izin implementasi, instalasi dependency, perubahan `package.json`/lockfile, deploy, atau perubahan status ADR lama.

## Keputusan yang diusulkan

- **Next.js App Router + TypeScript** sebagai satu aplikasi. Komponen React yang ada dipertahankan sedapat mungkin; halaman dipindah ke App Router (`app/`), dengan Server Components hanya bila tidak mengubah kontrak data dan perilaku auth.
- **Route Handlers dan/atau Server Actions menggantikan seluruh route Fastify** di `server/src/app.ts` dan `server/src/modules/*/routes.ts`. Envelope `{ "data": ... }` / `{ "error": { code, message, details } }` dan prefix `/api` dipertahankan agar klien existing tidak berubah sekaligus. Server Actions dipertimbangkan untuk mutasi yang benar-benar berupa aksi owner, bukan pengganti otomatis semua endpoint.
- **Drizzle + Zod dipertahankan.** Schema dan migrasi tidak diubah pada migrasi ini; Zod diekstraksi dari file route menjadi modul validasi bersama supaya bisa dipakai Route Handlers/Server Actions maupun test.
- **Auth diganti library teruji** (usulan: Auth.js/NextAuth dengan provider Google), bukan menulis ulang OAuth/cookie/CSRF manual. Hasil yang wajib dipertahankan: Google Login, satu owner (`OWNER_EMAILS`), tanpa registrasi publik, cookie HttpOnly/`SameSite=Lax`/`Secure` env-aware, validasi `state`/`nonce`, CSRF defense-in-depth, `GET /api/health` publik, sisanya terlindungi. Detail versi/adaptor dan apakah tabel `sessions` existing dapat dipakai apa adanya masih OD-001 (migrasi).
- **Neon tetap sebagai database online** (Rp0/bulan, OD-002 yang sudah disetujui). Strategi koneksi/pooling untuk runtime serverless Vercel dievaluasi saat implementasi; tidak ada akun/project yang dibuat oleh ADR ini.
- Prioritas adalah **paritas perilaku**: 34 endpoint, aturan versioning, error envelope, dan timezone tetap sama sampai setiap slice dinyatakan lulus verifikasi.

### Status turunan

| Keputusan | Status | Keterangan |
|---|---|---|
| Next.js App Router + TypeScript | **Proposed** | Menunggu persetujuan implementasi |
| Route Handlers/Server Actions menggantikan Fastify | **Proposed** | 34 endpoint `/api` saat ini; paritas kontrak wajib |
| Drizzle schema & migrasi dipertahankan | **Proposed — direncanakan reused** | Tidak ada perubahan schema dalam proposal ini |
| Zod dipertahankan | **Proposed — direncanakan reused** | Perlu diekstraksi dari file route Fastify |
| Library auth teruji menggantikan OAuth manual | **Proposed** | Versi/adaptor/strategi session = OD-001 (migrasi) |
| Google Login, single owner, tanpa registrasi publik | **Accepted sebagai requirement** | ADR-004/OD-003 tetap berlaku |
| Neon Free sebagai DB online | **Accepted** | OD-002 2026-11-26; detail deploy masih terbuka |
| Vercel sebagai target deploy | **Proposed untuk migrasi ini** | OD-002 existing sudah Approved dengan constraint; detail hosting = OD-002 (migrasi) |
| Instalasi dependency / perubahan `package.json` & lockfile | **Tidak diizinkan pada ADR ini** | Butuh izin eksplisit terpisah |
| Status ADR-001–ADR-009 | **Tetap Accepted** | `Superseded` menunggu persetujuan pengguna |
| `git push` / deploy / aktivasi akun | **Tidak diizinkan pada ADR ini** | Tag dan branch bersifat lokal |

## Opsi yang dipertimbangkan

| Opsi | Kompleksitas | Biaya | Satu origin/auth | Deploy Vercel | Status |
|---|---|---|---|---|---|
| **C — Next.js App Router, satu app (usulan)** | Tinggi saat migrasi, rendah setelahnya | Rp0/bulan sesuai target existing | Baik: cookie & callback satu origin | Native | **Proposed** |
| **A — Vite + Fastify host terpisah** | Sedang | Rp0–rendah (tergantung host API) | Buruk/rapuh: dua origin, CORS/allowlist, cookie lintas host, dua deploy | Frontend mudah; API butuh adaptasi serverless | **Tidak dipilih** — tidak menyelesaikan constraint OD-002 |
| **B — Vite + Fastify satu server** (Fastify menyajikan `dist/` + `/api`) | Sedang | Rp0–rendah | Baik: satu origin | Tidak native: proses long-running tetap perlu host Node/adaptor | **Tidak dipilih** — constraint OD-002 tetap ada |

Opsi A/B tetap dicatat sebagai arsip perbandingan; keduanya tidak mengubah kode atau dependency sekarang.

## Konsekuensi dan risiko

**Positif yang diharapkan:** satu codebase dan satu origin untuk UI + API; proxy development dan constraint Fastify-on-Vercel hilang; konfigurasi cookie/OAuth/CSRF lebih sederhana; stack selaras dengan keahlian pengguna dan platform deploy yang sudah dipilih.

**Negatif / biaya:** seluruh lapisan HTTP (34 endpoint) dan auth manual harus ditulis ulang; halaman SPA/routing buatan sendiri harus dipindah ke App Router; harness test berbasis `app.inject()` perlu diganti; diperlukan waktu untuk verifikasi paritas per modul. Selama transisi dapat terjadi dua sumber kebenaran bila Fastify dan Next dijalankan bersamaan — harus dihindari dengan slice yang jelas.

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Regresi aturan bisnis (append-only version, satu versi `Approved`, `FOR UPDATE`, partial unique index, `Mastered` manual) | Data/status konten salah | Pindahkan logika Drizzle apa adanya ke `lib/`, uji ulang tiap modul sebelum modul berikutnya |
| Regresi auth/cookie/CSRF/OAuth callback | Owner terkunci atau akses tidak sah | Uji paritas `401/403`, cookie flags, `state`/`nonce`, CSRF sebelum slice UI/deploy |
| Schema Zod berada di dalam file route Fastify | Validasi tidak bisa langsung diimpor Next | Ekstraksi ke modul validasi bersama sebagai bagian dari slice modul |
| `sessions` existing tidak cocok dengan skema library auth | Perlu migrasi session / logout massal | Putuskan adapter/strategi session di OD-001 (migrasi); jangan mengubah tabel tanpa izin |
| Pool `pg` long-running vs runtime serverless Vercel | Koneksi habis / cold start | Pilih strategi koneksi di OD-002 (migrasi); smoke test sebelum deploy |
| Perubahan dependency/library belum disetujui | Melanggar gate change-control | Tidak ada instalasi sampai izin terpisah; versi masuk OD-001 (migrasi) |
| Timezone `timestamp without time zone` + `date` | Salah tampil tanggal | Pertahankan konvensi ADR-009/OD-008; uji nilai batas hari |
| Rollback hanya kode, bukan data | Data tak sengaja terhapus | Tidak ada migrasi destruktif; gunakan dump ADR-008 bila pemulihan data benar-benar diperlukan |

## Inventaris berdasarkan kode aktual

### Dipakai ulang (dengan adaptasi boundary)

| Bagian | Bukti di repository | Catatan pemakaian ulang |
|---|---|---|
| Schema Drizzle | `server/src/db/schema/{shared,learning,handbook,projects,index}.ts` — 11 tabel, 5 enum, `localTimestamp`, FK `onDelete: "restrict"`, unique index | Impor langsung dari `lib/db/schema`; tidak ada perubahan schema yang diusulkan |
| Migrasi | `server/src/db/migrations/0000_init.sql`, `0001_add_sessions.sql`, `meta/_journal.json`, snapshot | File SQL yang sama dipakai test/integrasi; prosedur deploy tetap non-destruktif |
| Seed | `server/src/db/seed/seed.ts` | Skrip seed tetap berguna untuk lokal/scratch; perlu pemeriksaan saat dependency diizinkan |
| Zod schema & helper | `server/src/modules/{learning,handbook,projects}/routes.ts`: `contentJsonSchema`, `handbookContentJsonSchema` (6 bagian + provenance), `calendarDateSchema`, `listItemsQuerySchema`, `sanitizeSearchTerm` | Logika validasi dipertahankan, tetapi **diekraksi** dari `register*Routes` ke modul bersama |
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
| Auth manual | `server/src/modules/shared/core/auth/{routes,guard,cookies,crypto,oauth-state,sessions}.ts` — OAuth fetch, HMAC state, cookie serialization, guard, session create/revoke | Diganti library teruji; requirement ADR-004/OD-003 tetap mengikat. Tabel `sessions` dievaluasi di OD-001 (migrasi) |
| Halaman/routing SPA | `src/main.tsx` (`createRoot`), `src/App.tsx` (`pushState`/`popstate`, `resolveRoute`, deep-link `?item`), 5 `src/components/views/*View.tsx` sebagai halaman | Dipindah ke App Router (`app/layout.tsx`, segmen halaman); komponen UI anak dipakai ulang |
| Build & dev config | `vite.config.ts` (proxy `/api`, copy asset plugin), `index.html`, `package.json` scripts `dev`/`dev:api`/`build`/`test`, `tsconfig.json`, `server/tsconfig.json`, `drizzle.config.ts`, `.github/workflows/ci.yml`, `README.md` | Perlu konfigurasi Next/build/test baru **hanya setelah izin implementasi** |
| Harness test route | `app.inject()` di `server/src/modules/*/routes.test.ts` dan `e2e-handbook-project.routes.test.ts` | Diganti pemanggilan handler/route Next; ekspektasi SQL dan rule tetap dipertahankan |

## Rencana bertahap per modul dan rollback

Setiap slice memerlukan izin implementasi tersendiri, satu slice kecil, verifikasi, laporan, baru lanjut (sesuai `docs/change-control.md`). Tidak ada slice yang dikerjakan oleh ADR ini.

| Slice | Lingkup | Verifikasi minimal sebelum lanjut |
|---|---|---|
| 0 — Fondasi | Kerangka Next.js App Router + TypeScript, `GET /api/health`, harness typecheck/lint/test; Fastify masih menjadi acuan paritas | Build/typecheck/test lulus; health publik merespons sesuai envelope |
| 1 — Auth | Library auth teruji, Google Login single-owner, cookie/CSRF/OAuth state, `/api/auth/me`, `/api/auth/logout`; OD-001 (migrasi) harus diputuskan | Uji `401/403`, cookie flags, callback, CSRF, allowlist owner; tidak ada secret di log |
| 2 — Learning | 11 endpoint + Zod + transaksi versi/progress (tanpa perubahan schema) | Paritas 11 endpoint; aturan `Draft → Approved`, `Mastered`, dan `PUT`/`PATCH` progress lulus |
| 3 — Handbook | 8 endpoint + pencarian + approval dengan lock/partial unique index | Paritas 8 endpoint; uji DB nyata untuk satu-versi-Approved |
| 4 — Projects | 10 endpoint + milestone/task + referensi handbook | Paritas 10 endpoint; konversi tanggal `YYYY-MM-DD` dan referensi lintas modul lulus |
| 5 — UI | 5 halaman ke App Router, deep link `?item=`, klien `apiFetch`, QA manual | Navigasi/deep link, loading/error/empty state, aksesibilitas/responsive sesuai baseline |
| 6 — Deploy (terpisah) | Vercel + Neon, env/secrets, prosedur migrasi, smoke test; butuh detail OD-002 (migrasi) + izin deploy | Deploy-ready dinyatakan hanya setelah smoke test dan checklist deploy disetujui |

**Rollback per slice:** hentikan slice, alihkan kembali ke artefak/commit terakhir yang lulus sebelum slice tersebut. Kode dapat dikembalikan dari tag lokal `pre-nextjs-migration` (misalnya membuat branch/restore dari tag; **jangan** menyentuh `main` atau melakukan reset tanpa izin). Karena migrasi ini tidak merencanakan perubahan schema, rollback data umumnya tidak diperlukan; bila suatu slice tetap mengubah data, jangan menghapus/menimpa data — gunakan dump `pg_dump -Fc` + checksum sesuai ADR-008 dan verifikasi restore di DB scratch. Tag belum di-push; sebelum kolaborasi perlu keputusan terpisah untuk mempublikasikan checkpoint.

## Open questions

| ID | Topik | Status | Yang perlu diputuskan |
|---|---|---|---|
| **OD-001 (migrasi)** | Versi Next.js & library auth (Auth.js/NextAuth) | **Open** | Versi final dan kompatibilitas React 19/TypeScript 7, adapter/strategi session (apakah tabel `sessions` existing dipakai), serta persetujuan dependency. **Ini bukan OD-001 di `adr-status.md`** (pinning Fastify/Zod/Drizzle yang sudah Approved). |
| **OD-002 (migrasi)** | Detail hosting & runtime | **Open** | Konfigurasi Vercel (region/env/secrets/domain default), strategi pool Neon untuk serverless, dan apakah lingkup OD-002 existing (frontend + API di Vercel) tetap dipertahankan tanpa perubahan keputusan. **Ini bukan pengajuan ulang OD-002 yang sudah Approved 2026-11-26**; constraint Fastify long-running masih tercatat di [`od-002-deploy-constraint.md`](../od-002-deploy-constraint.md). |
| **OD-TEST (label usulan)** | Strategi test pasca-migrasi | **Open** | `node:test` existing vs runner baru (mis. Vitest), cara menguji Route Handlers/Server Actions, apakah mock `pg.Pool` tetap dipakai, ruang lingkup DB integration test, dan kebutuhan e2e browser. Tidak ada runner baru dipasang sebelum persetujuan. |

## Verifikasi saat implementasi

- `GET /api/health` publik; seluruh endpoint selain allowlist auth mengembalikan `401` tanpa sesi dan `403` untuk identitas bukan owner.
- 34 endpoint existing memiliki path, method, status code, dan envelope `{ data }` / `{ error }` yang setara (termasuk `PUT` progress yang saat ini ada).
- Aturan versioning learning/handbook, partial unique index, satu versi `Approved`, dan `Mastered` manual lulus test dengan DB nyata.
- Cookie `HttpOnly`, `SameSite=Lax`, `Secure` env-aware; `state`/`nonce`, Origin/Referer, `Content-Type: application/json`, dan `X-CSRF-Token` tetap diverifikasi.
- Format tanggal `YYYY-MM-DD` dan timestamp lokal Asia/Jakarta tidak berubah (ADR-009/OD-008).
- Seluruh test yang relevan lulus (frontend murni, modul, integrasi DB) dengan harness yang sudah disesuaikan; tidak ada test yang dilewati tanpa alasan tercatat.
- Tidak ada secret/token/cookie value di log, diff, atau response; dependency, lockfile, dan konfigurasi baru hanya berubah setelah izin eksplisit.

## Riwayat perubahan

- 2026-11-27: ADR dibuat dengan status `Proposed` setelah pengguna memutuskan migrasi ke Next.js App Router/Vercel. Tag anotasi `pre-nextjs-migration` dibuat di HEAD `main` `d40df91e...` dan branch `feat/nextjs-migration` dibuat dari commit yang sama. Inventaris disusun dari kode aktual; tidak ada source code, dependency, konfigurasi, database, atau deploy yang diubah. Status ADR lama tidak disentuh.

## Rollback

Kembalikan aplikasi ke checkpoint `pre-nextjs-migration` (kode, konfigurasi, dan build terakhir yang dikenal baik) dan hentikan jalur Next.js yang sedang dicoba. Gunakan branch/restore dari tag sesuai mekanisme git yang disetujui; **jangan** melakukan `push`, `reset`, `rebase`, atau perubahan pada `main` tanpa izin. Database tidak diubah oleh ADR ini; bila slice implementasi kemudian mengubah data, lakukan pemulihan hanya dari dump terverifikasi sesuai ADR-008, dengan persetujuan eksplisit untuk operasi destruktif.
