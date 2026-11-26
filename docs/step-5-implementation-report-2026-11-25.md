# Implementation Report — Step 5 (P0.4-02)

## 1. Task
**STEP 5 — Database Schema, Migration & Seed (P0.4-02)**

## 2. Status
**PASS**

## 3. Hasil
Fondasi schema/migration/seed development lokal berhasil dibuat dan diverifikasi pada database repo-local `jasasaja-os-dev` (PostgreSQL 16, port host 5433). Tidak ada endpoint domain/auth yang diimplementasikan.

**Yang diimplementasikan:**
- Drizzle config: `drizzle.config.ts` (schema `server/src/db/schema/index.ts`, output `server/src/db/migrations`).
- Schema Drizzle sesuai A1/B1/C2/D1:
  - **A1 (OD-004):** `lesson_versions.content_json` dan `handbook_item_versions.content_json` sebagai `jsonb` (structured JSON block).
  - **B1 (OD-005):** `content_status` enum `Draft|Approved|Deprecated`; version tables append-only by design; partial unique index satu Approved per lesson/handbook item; `approved_at` diset.
  - **C2 (OD-008):** timestamp disimpan sebagai `timestamp without time zone` (mode local Asia/Jakarta); compose mengatur `TZ=Asia/Jakarta`, `PGTZ=Asia/Jakarta`; `target_date`/`due_date` sebagai `date`.
  - **D1 (PRD-Q-Mastered):** `lesson_progress.status` enum mencakup `Mastered`; `mastered_at` ada; transisi manual akan ditegakkan di logic app/auth nanti (tidak di Step 5).
- Batas modul/schema: `shared.ts`, `learning.ts`, `handbook.ts`, `projects.ts`, `index.ts`.
- FK intra-scope memakai `ON DELETE RESTRICT` (no unreviewed cascade delete). Cross-module refs di `project_tasks` (`handbook_item_id`, `lesson_id`) disimpan sebagai UUID tanpa FK lintas batas modul.
- Migrasi: `server/src/db/migrations/0000_init.sql` (+ journal/meta Drizzle) dibuat dan diterapkan.
- Seed idempoten: `server/src/db/seed/seed.ts` dengan fixed UUID, `onConflictDoNothing`, data berlabel `[SEED]`.
- Script npm: `db:generate`, `db:migrate`, `db:seed`.
- Docker compose dev DB diperbarui untuk `TZ`/`PGTZ` Asia/Jakarta.
- Perbaikan kecil verifikasi: hapus import `date` yang tidak terpakai di `server/src/db/schema/learning.ts`.

**Tidak dilakukan (sesuai scope/batasan):**
- Tidak ada autentikasi Google Login/session/guard penuh (OD-003 masih Open).
- Tidak ada endpoint domain baru.
- Tidak ada integrasi Neon/produksi/deploy.
- Tidak ada `docker compose down -v`, DROP/RESET/TRUNCATE, atau operasi destruktif.
- Tidak ada commit/push.

## 4. File Changed
**Baru (Step 5):**
- `drizzle.config.ts`
- `server/src/db/migrations/0000_init.sql`
- `server/src/db/migrations/meta/_journal.json`
- `server/src/db/migrations/meta/0000_snapshot.json` (dibuat drizzle-kit)
- `server/src/db/schema/shared.ts`
- `server/src/db/schema/learning.ts`
- `server/src/db/schema/handbook.ts`
- `server/src/db/schema/projects.ts`
- `server/src/db/schema/index.ts`
- `server/src/db/seed/seed.ts`
- `docs/step-5-implementation-report-2026-11-25.md`

**Diubah (Step 5):**
- `docker-compose.yml` — tambah `TZ=Asia/Jakarta`, `PGTZ=Asia/Jakarta`.
- `package.json` — tambah script `db:generate`, `db:migrate`, `db:seed`.
- `README.md` — update perintah DB/migration/seed dan status implementasi.
- `docs/phase-0-backlog.md` — tandai P0.4-02 Done dengan bukti verifikasi; update ringkasan.

**Pre-existing (tidak disentuh):**
- `metadata.json` tetap terhapus.
- Perubahan user sebelumnya pada file frontend/src/vite/tsconfig/readme/package dll tetap ada sesuai working tree.

## 5. Verification
| Pemeriksaan | Hasil aktual | Status |
|---|---|---|
| `docker compose ps` | `jasasaja-os-dev-postgres` Up (healthy), port host 5433 | PASS |
| DB timezone | `SHOW timezone;` => `Asia/Jakarta` | PASS |
| `npm run db:seed` (run 1) | `SEED_OK { learningPath: 1, lesson: 1, handbookItem: 1, project: 1 }` | PASS |
| `npm run db:seed` (run 2, idempotency) | Output sama; tidak duplikat | PASS |
| Cek jumlah row seed tables | Semua tabel seed = 1, `lesson_progress` = 0 | PASS |
| FK invalid (`lesson_versions.lesson_id` nonexistent) | ERROR FK constraint `lesson_versions_lesson_id_lessons_id_fk` | PASS |
| Restrict delete (delete lesson yang punya versions) | ERROR FK restrict | PASS |
| Unique partial index Approved (lesson_versions) | Insert Approved kedua untuk lesson sama gagal dengan `lesson_versions_one_approved_uidx` | PASS |
| Unique partial index Approved (handbook_item_versions) | Insert Approved kedua untuk handbook item sama gagal dengan `handbook_item_versions_one_approved_uidx` | PASS |
| Unique (lesson_id, version) | Duplicate version gagal dengan `lesson_versions_lesson_version_uidx` | PASS |
| Unique (lesson_progress.lesson_id) | Duplicate progress gagal dengan `lesson_progress_lesson_uidx` | PASS |
| NOT NULL | Insert lesson title NULL gagal | PASS |
| Invalid enum | Insert project status invalid gagal | PASS |
| FK delete rules (catalog) | Semua 8 FK `confdeltype = r` (ON DELETE RESTRICT) | PASS |
| Stray-row cleanup check | Tidak ada row uji tersisa; counts kembali ke seed baseline | PASS |
| `npm ci` | Berhasil; warning engine/deprecation/vulnerabilities npm diketahui, tidak di-force-fix | PASS (warning) |
| `npm test` | 23/23 pass, 0 fail | PASS |
| `npm run typecheck` | Pass setelah hapus import `date` tidak terpakai | PASS |
| `npm run lint` | Pass | PASS |
| `npm run build` | Pass; warning Vite `__dirname` diketahui | PASS (warning) |
| `git diff --check` | Pass | PASS |

## 6. Acceptance Criteria
| Kriteria Step 5 / P0.4-02 | Status | Catatan |
|---|---|---|
| Satu migrasi berversi menghasilkan tabel shared/core + kerangka domain | Terpenuhi | `0000_init.sql` diterapkan; tabel learning/handbook/projects/shared dibuat |
| Foreign key, constraint, tipe timestamp sesuai keputusan | Terpenuhi | FK RESTRICT; timestamp tanpa timezone (C2); date untuk target/due |
| Seed idempoten, tanpa duplikat | Terpenuhi | Dijalankan dua kali, counts tetap 1 |
| Tidak ada cascade delete yang belum ditinjau | Terpenuhi | Semua FK ON DELETE RESTRICT |
| Struktur modul/boundary konsisten | Terpenuhi | Schema dipisah per domain; cross-module refs tanpa FK |
| A1/B1/C2/D1 tercermin | Terpenuhi | JSONB content, version status + partial unique Approved, local timestamp Asia/Jakarta, Mastered manual enum/field |

## 7. Risks & Limitations
- **C2 (local timestamp) tradeoff:** Timestamp disimpan tanpa timezone; bergantung pada konvensi Asia/Jakarta. Risiko konversi/DST/ambiguity dicatat di ADR-009; perlu disiplin saat query/display/backup.
- **`updated_at` defaultNow saja:** `updated_at` punya default now() tetapi belum ada trigger auto-update pada UPDATE; perlu ditangani di layer aplikasi/migrasi berikutnya.
- **Seed memakai fixed UUID:** Aman untuk dev lokal; jangan dipakai sebagai pola data produksi.
- **Belum ada test DB otomatis:** Verifikasi constraint dilakukan manual via psql; belum ada test suite backend/DB.
- **Drizzle config fallback URL:** `drizzle.config.ts` punya fallback URL dev lokal jika `DATABASE_URL` kosong; ini memudahkan dev tapi perlu dijaga agar tidak dipakai di lingkungan non-lokal tanpa env yang benar.
- **Auth/guard belum ada:** Schema mendukung owner-only app nanti, tapi endpoint belum ada; OD-003 masih Open.
- **npm warnings:** EBADENGINE cookie@2.0.2 (Node 22 dibutuhkan, env Node 20.20.2), deprecated @esbuild-kit/*, 4 moderate vulnerabilities - tidak diperbaiki paksa.

## 8. Documentation
- `README.md` diperbarui: perintah db:generate/db:migrate/db:seed, status Step 5.
- `docs/phase-0-backlog.md` diperbarui: P0.4-02 Done, ringkasan status.
- `docs/step-5-implementation-report-2026-11-25.md` (laporan ini).

## 9. Git Status
- **Branch:** `main`
- **HEAD:** `76cede7`
- **Ringkasan:** working tree tetap dirty/uncommitted; pre-existing deletions/modifications user masih ada. Step 5 menambah file schema/migration/seed/config/report dan perubahan docker-compose/package/readme/backlog.
- **`git diff --check`:** PASS.

## 10. Recommendation
**STOP — tunggu instruksi eksplisit.**

Langkah berikutnya yang logis adalah **STEP 6 — Validation, Auth Guard & Session (P0.4-03)**, tetapi **OD-003 (session/cookie/CSRF) masih Open** dan menjadi prasyarat keputusan sebelum implementasi auth penuh. Jangan lanjut Step 6 tanpa instruksi eksplisit dan keputusan OD-003.

Sebelum Step 6: konfirmasi strategi session/cookie/CSRF, ruang lingkup guard, dan apakah `GET /api/health` tetap publik.
