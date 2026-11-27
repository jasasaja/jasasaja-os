# Backlog Phase 3 — Project Workspace & Handbook Integration (Draft)

- **Status:** P3.1–P3.6 implemented/verified locally on 2026-11-27; P3.6 `Done` (documentation-only). Dokumen ini tetap draft perencanaan: known gaps Phase 1/2/3 diterima pengguna 2026-11-27 melalui [Gate Phase 1–3](./phase-1-3-acceptance-gate-2026-11-27.md), commit/push dilakukan manual oleh pengguna, dan gate ini bukan izin deploy atau perubahan dependency/migrasi. Laporan: [p3.1](./p3.1-implementation-report-2026-11-27.md), [p3.2](./p3.2-implementation-report-2026-11-27.md), [p3.3](./p3.3-implementation-report-2026-11-27.md), [p3.4](./p3.4-implementation-report-2026-11-27.md), [p3.5](./p3.5-implementation-report-2026-11-27.md); exit review: [phase-3-exit-review-2026-11-27.md](./phase-3-exit-review-2026-11-27.md).
- **Tanggal:** 2026-11-27
- **Instruksi pengguna:** Lewati dulu route learning. Fokus ke route **Handbook** dan **Project**. Tidak ada perubahan pada `LearningView`, `src/App.tsx` cabang `learning`, atau endpoint `/api/learning/**` dalam Phase 3.
- **Prasyarat:** Phase 2 exit review lokal selesai dengan known gaps ([phase-2-exit-review-2026-11-26.md](./phase-2-exit-review-2026-11-26.md)). Known gaps Phase 1/2 diterima pengguna 2026-11-27 melalui [Gate Phase 1–3](./phase-1-3-acceptance-gate-2026-11-27.md); dokumen ini tidak menutup gate CI/deploy/browser.
- **Fokus Phase 3:** Satu proyek dapat dijalankan dengan stages, milestones, tasks, dan referensi handbook (README §Rencana Pengembangan / roadmap exit criteria).
- **Batasan:** Satu active slice pada satu waktu; verifikasi sebelum lanjut; tidak ada commit/push/deploy/dependency/migrasi tanpa instruksi eksplisit; browser/a11y/responsive manual tetap dilewati dan dicatat; CI remote tidak diklaim.

## 1. Kesiapan saat ini

| Area | Kondisi aktual | Sumber |
|---|---|---|
| Domain `projects` | Tabel `projects`, `project_milestones`, `project_tasks` sudah ada. Status proyek `Planned\|Active\|Completed\|Archived`; milestone `Planned\|In Progress\|Completed`; task `Todo\|In Progress\|Done\|Blocked`. | `server/src/db/schema/projects.ts` |
| Tanggal | `targetDate`/`dueDate` memakai kolom `date` (C2, Asia/Jakarta), bukan timestamp. | `server/src/db/schema/projects.ts` |
| Referensi lintas modul | `project_tasks.handbookItemId` dan `lessonId` tersimpan sebagai UUID eksplisit, tanpa foreign key lintas modul. | `server/src/db/schema/projects.ts`, `docs/api-contract.md` §6.4 |
| Modul API | `server/src/modules/projects/routes.ts` menyediakan delapan endpoint project, termasuk milestone/task dan referensi handbook; terdaftar di `app.ts`. | `server/src/modules/projects/routes.ts`, `server/src/app.ts` |
| Seed development | Seed P0 memiliki 1 project + 1 milestone + 1 task berlabel `[SEED]`; P3.4 menambah paket `[SEED-P3]` yang mereferensikan item `[SEED-P2]` berstatus `Approved`. | `server/src/db/seed/seed.ts` |
| UI | Rute `/projects` memakai `ProjectsView` yang membaca API; rute `/handbook` menerima deep-link `?item=<id>` sejak P3.5. | `src/App.tsx`, `src/components/views/ProjectsView.tsx`, `src/components/views/HandbookView.tsx` |
| Kontrak API | Inventaris `/api/projects/**` masih `Proposed` dan memakai istilah `stage`; schema hanya memiliki `status`. | `docs/api-contract.md` §6.4 |

**Keputusan kerja Phase 3 (diterapkan, bukan perubahan scope diam-diam):**
- Karena schema tidak memiliki kolom `stage`, API Phase 3 memakai `status` sebagai label tahap proyek. Istilah `stage` di kontrak tetap `Proposed` dan dicatat sebagai gap sampai ada keputusan perubahan schema.
- Referensi `handbookItemId` boleh di-resolve menjadi ringkasan judul/status/versi dengan membaca tabel di shared DB schema. Tidak mengimpor file internal modul handbook.
- Referensi `lessonId` dikembalikan sebagai UUID mentah saja. Tidak ada resolusi, endpoint, atau UI learning yang disentuh sesuai instruksi pengguna.

## 2. Urutan slice yang diusulkan

Satu slice aktif pada satu waktu. Status tiap slice mengikuti penandaan pada bagian masing-masing.

### P3.1 — Project read foundation (API)

- **Status:** Done (local, verified 2026-11-27) — see [p3.1-implementation-report-2026-11-27.md](./p3.1-implementation-report-2026-11-27.md)
- **Priority:** `Must`
- **Goal / Outcome:** Owner terautentikasi dapat membaca daftar project dan detail project beserta ringkasan milestone/task serta referensi handbook dari API.
- **Scope / In-scope:** `GET /api/projects` (filter `status`, `q`), `GET /api/projects/:projectId`; registrasi route di `app.ts`; envelope `{ data: ... }`; resolusi `handbookItemId` sebagai ringkasan.
- **Non-scope:** Write/authoring, approval, UI, seed P3, export/import, pagination `meta`, resolusi `lessonId`, perubahan schema/migrasi.
- **Acceptance criteria:** tanpa sesi → `401`; query/param invalid → `400`; project tidak ada → `404`; sesi valid → `200`; `q` case-insensitive pada nama/deskripsi; detail memuat milestone/task dan `handbookItem`ringkasan bila ID valid.
- **Files / areas affected:** `server/src/modules/projects/routes.ts` (baru), `server/src/app.ts`, dokumentasi.
- **Verification plan:** `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`; API smoke dengan session sementara dan cleanup.
- **Rollback consideration:** hapus route file dan registrasinya; tidak ada perubahan data permanen.

### P3.2 — Authoring project dan status tahap

- **Status:** Done (local, verified 2026-11-27) — see [p3.2-implementation-report-2026-11-27.md](./p3.2-implementation-report-2026-11-27.md)
- **Priority:** `Must`
- **Goal / Outcome:** Owner dapat membuat project dan memperbarui field dasar/status lewat API.
- **Scope / In-scope:** `POST /api/projects`, `PATCH /api/projects/:projectId`, validasi Zod, guard/CSRF existing.
- **Non-scope:** Milestone/task, referensi edit, perubahan schema, UI.
- **Acceptance criteria:** `201`/`200`; `400` untuk field invalid; `401`/`404` sesuai guard/resource; tidak ada auto-complete milestone/task.
- **Verification plan:** command checks + smoke create/patch/read-back dengan cleanup row test.

### P3.3 — Milestone, task, dan referensi handbook

- **Status:** Done (local, verified 2026-11-27) — see [p3.3-implementation-report-2026-11-27.md](./p3.3-implementation-report-2026-11-27.md)
- **Priority:** `Must`
- **Goal / Outcome:** Owner dapat mengelola milestone dan task, termasuk mengaitkan task ke item handbook eksplisit.
- **Scope / In-scope:** `GET/POST /api/projects/:projectId/milestones`, `PATCH .../milestones/:milestoneId`, `GET/POST .../tasks`, `PATCH .../tasks/:taskId`; validasi `milestoneId` milik project; `handbookItemId` harus merujuk item handbook yang ada; `lessonId` diterima sebagai UUID mentah tanpa resolusi.
- **Non-scope:** Import internal modul lain, delete, assign user, notifikasi, perubahan schema.
- **Acceptance criteria:** nomor/ID konsisten; referensi silang ditolak `404`/`400`; status enum valid; tanggal `YYYY-MM-DD`; `401`/`403`/`404` sesuai kontrak.
- **Verification plan:** command checks + smoke guard/validasi/konflik referensi dengan cleanup.

### P3.4 — Satu paket project lengkap dengan referensi handbook

- **Status:** Done (local, verified 2026-11-27) — see [p3.4-implementation-report-2026-11-27.md](./p3.4-implementation-report-2026-11-27.md)
- **Priority:** `Must`
- **Goal / Outcome:** Tersedia satu seed development `[SEED-P3]` berisi project + milestone + task yang mereferensikan item handbook `Approved` dari `[SEED-P2]`.
- **Scope / In-scope:** ID baru dan label `[SEED-P3]` di `server/src/db/seed/seed.ts`; `onConflictDoNothing`; verifikasi hitungan stabil dan detail API menampilkan referensi handbook.
- **Non-scope:** Data produksi, perubahan seed lama, migrasi.
- **Acceptance criteria:** dua kali seed stabil; pencarian `q` menemukan project; detail menampilkan milestone, task, dan `handbookItem` ringkasan; label development jelas.
- **Verification plan:** command checks + hitungan DB + API smoke + cleanup session.

### P3.5 — Project UI MVP + deep-link Handbook

- **Status:** Done (local, verified 2026-11-27; browser manual masih ditunda) — see [p3.5-implementation-report-2026-11-27.md](./p3.5-implementation-report-2026-11-27.md)
- **Priority:** `Should` (dibutuhkan agar "dapat dijalankan/ditemukan" terlihat di UI)
- **Goal / Outcome:** Rute `/projects` menampilkan data nyata dari API; task dengan referensi handbook dapat dibuka ke item handbook terkait. Rute `/handbook` menerima deep-link `?item=<id>` untuk membuka detail langsung.
- **Scope / In-scope:** `ProjectsView.tsx` baru; penyesuaian `App.tsx` hanya cabang `projects`; perubahan kecil `HandbookView.tsx` untuk deep-link; state loading/empty/error/success.
- **Non-scope:** Route learning, editor create/edit/approve project, a11y/responsive manual sign-off, dependency baru.
- **Acceptance criteria:** data dari `/api/projects/**`; tidak ada konten hard-coded; route learning/dashboard/settings tidak berubah; deep-link handbook membuka detail dari ID; command checks lulus.
- **Verification plan:** command checks + tinjauan bundle + status browser manual dicatat.

### P3.6 — Phase 3 exit review

- **Status:** Done (local, documentation-only, verified 2026-11-27) — see [phase-3-exit-review-2026-11-27.md](./phase-3-exit-review-2026-11-27.md)
- **Goal / Outcome:** Laporan bukti lokal Phase 3 dengan known gaps, konsisten dengan pola Phase 1/2.
- **Scope / In-scope:** `docs/phase-3-exit-review-<tanggal>.md`; pembaruan backlog dan `docs/README.md`.
- **Non-scope:** Klaim sign-off/CI/deploy; perubahan kode di luar koreksi dokumentasi.

## 3. Risiko dan open items lintas slice

- **Gate penerimaan Phase 1–3 tertutup.** Known gaps diterima pengguna 2026-11-27 melalui [Gate Phase 1–3](./phase-1-3-acceptance-gate-2026-11-27.md); CI/deploy/browser tetap terbuka.
- **Exit review Phase 3 lokal selesai.** [Review ini](./phase-3-exit-review-2026-11-27.md) menyatakan local PASS with known gaps dan tidak mengubah status bukti lokal.
- **Working tree uncommitted.** Commit/push dilakukan manual oleh pengguna via GitHub Desktop; jangan reset/checkout/stash destruktif.
- **Istilah `stage` vs `status`.** Kontrak API memakai `stage`, schema memakai `status`; akan dicatat sebagai gap, bukan diubah dengan migrasi diam-diam.
- **Referensi `lessonId`.** Sengaja tidak di-resolve sesuai instruksi pengguna; ini gap desain yang disadari, bukan bug tersembunyi.
- **Validasi referensi handbook.** P3.3 membaca tabel handbook dari shared schema; tidak mengimpor internal modul handbook.
- **Kualitas verifikasi.** Belum ada automated backend test; smoke manual + cleanup tetap menjadi gap sampai slice hardening disetujui.
- **Deploy/CI/browser.** Constraint deploy OD-002 (Fastify → Vercel serverless), CI remote, dan browser/a11y/responsive manual tetap terbuka seperti Phase 2.
- **Scope creep.** UI create/edit/approve, editor blok, import/export, dan fitur Phase 4 masuk Future Ideas bila muncul.

## 4. Definition of Done per slice

- [ ] Acceptance criteria slice terpenuhi dan buktinya dicatat.
- [ ] Input divalidasi server-side dengan Zod; error envelope konsisten.
- [ ] Guard/otorisasi server diperiksa untuk data privat (`401`/`403`).
- [ ] Test/check relevan lulus (`npm test`, `typecheck`, `lint`, `build` bila kode tersentuh); `git diff --check`.
- [ ] State loading/empty/error/success ditangani bila ada perubahan UI/API.
- [ ] Tidak ada secret atau data sensitif di diff/log.
- [ ] Tidak ada perubahan learning route/API tanpa instruksi baru.
- [ ] Dokumentasi dan migrasi diperbarui bila diperlukan; migrasi hanya dengan instruksi eksplisit.
- [ ] Diff ditinjau; risiko dan rollback dipahami.
- [ ] Item yang tidak relevan ditandai `N/A` dengan alasan tertulis.
