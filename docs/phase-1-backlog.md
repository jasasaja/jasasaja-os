# Backlog Phase 1 — Learning Center (Draft)

- **Status:** P1.1-P1.6 implemented/verified locally on 2026-11-26 (P1.1-P1.2 committed locally; P1.3-P1.6 uncommitted at review time). Exit review: [phase-1-exit-review-2026-11-26.md](./phase-1-exit-review-2026-11-26.md). Known gaps diterima pengguna 2026-11-27 melalui [Gate Phase 1–3](./phase-1-3-acceptance-gate-2026-11-27.md); bukan klaim CI/deploy/browser sign-off.
- **Tanggal:** 2026-11-26 (updated after P1.6)
- **Prasyarat:** Phase 0 sign-off pengguna tercatat 2026-11-26 (`docs/phase-0-exit-review-2026-11-26.md` §10). Batasan/risiko yang ditunda tetap diketahui.
- **Fokus Phase 1:** Satu learning path dapat dipelajari sampai evaluasi dan progress tersimpan (README/roadmap exit criteria).
- **Batasan:** Satu slice kecil pada satu waktu; verifikasi sebelum lanjut; tidak ada commit/push/deploy tanpa instruksi eksplisit; tidak ada dependency baru tanpa persetujuan; tidak ada fitur di luar scope MVP.

## Keputusan yang sudah berlaku
- A1/OD-004: konten JSON block terstruktur; export/import awal JSON.
- B1/OD-005: append-only version rows; `Draft → Approved` hanya oleh aksi eksplisit owner.
- C2/OD-008: waktu lokal Asia/Jakarta (timestamp without timezone, konsisten dengan keputusan C2).
- D1/PRD-Q-Mastered: `Mastered` manual oleh owner.
- OD-003: `/api/**` default-protected; session server-side DB + CSRF/origin/content-type checks.

## Urutan slice yang diusulkan

### P1.1 — Learning API read foundation (vertical slice terkecil)
- **Goal:** Owner terautentikasi dapat membaca daftar learning path dari API.
- **Status:** Done (local, committed `2220655`, 2026-11-26)
- **Scope:**
  - `GET /api/learning/paths` — list paths (paginated sederhana atau semua untuk MVP awal), response envelope `{ data: [...] }`.
  - `GET /api/learning/paths/:id` — detail path + lessons ringkas.
  - Query via Drizzle; validasi param/query dengan Zod.
  - Tetap di balik auth guard (tidak ada bypass).
- **Acceptance criteria:**
  - Request tanpa session valid => 401.
  - Request dengan session valid => 200 dengan envelope konsisten.
  - Data berasal dari DB (seed/existing dev data).
  - Error 404/400 sesuai kontrak API.
- **Dependencies:** P0.4-02 schema, P0.4-03 guard, P0.3-02 contract.
- **Verification:** test/typecheck/lint/build; curl/smoke dengan session dev; `git diff --check`.
- **Risks:** Bentuk response belum final untuk UI; perlu sesuaikan dengan kontrak.

### P1.2 — Learning path create/update (owner authoring dasar)
- **Goal:** Owner dapat membuat dan memperbarui learning path.
- **Status:** Done (local, committed `afca15f`, 2026-11-26)
- **Scope:**
  - `POST /api/learning/paths` — create.
  - `PATCH /api/learning/paths/:id` — update.
  - Zod validation, CSRF/origin/content-type checks sudah berlaku via guard.
  - Tidak ada delete destruktif tanpa keputusan; soft/archive jika diperlukan kemudian.
- **Acceptance criteria:** 201/200 sesuai kontrak; 400 validation; 401/403 sesuai guard.
- **Dependencies:** P1.1.
- **Verification:** API smoke tests, command checks.

### P1.3 — Lesson CRUD + versioning dasar (B1)
- **Goal:** Owner dapat membuat lesson dalam path dan menyimpan versi konten (A1 JSON block, B1 append-only).
- **Status:** Done (local, uncommitted, verified 2026-11-26)
- **Scope:**
  - `POST /api/learning/paths/:pathId/lessons` create lesson + initial version (Draft).
  - `GET /api/learning/lessons/:id` detail lesson + current draft/approved version sesuai aturan.
  - `POST /api/learning/lessons/:id/versions` append-only version baru.
  - `POST /api/learning/lessons/:id/approve` aksi eksplisit owner: Draft -> Approved (transisi terbatas B1).
  - Validasi struktur JSON block minimal (A1) di server.
- **Acceptance criteria:** append-only terjaga; approve eksplisit; invalid block ditolak; status/transisi sesuai B1.
- **Dependencies:** P1.1, P1.2.
- **Verification:** constraint/status tests/smoke; no cascade delete.

### P1.4 — Lesson progress & mastery manual (D1)
- **Goal:** Owner dapat menandai progres lesson dan status Mastered secara manual.
- **Status:** Done (local, uncommitted, verified 2026-11-26)
- **Scope:**
  - `GET /api/learning/lessons/:id/progress`
  - `PUT/PATCH /api/learning/lessons/:id/progress` dengan status `Not Started|In Progress|Completed|Mastered`.
  - `Mastered` hanya manual oleh owner (D1), tanpa perhitungan otomatis.
  - Timestamps konsisten C2.
- **Acceptance criteria:** status enum tervalidasi; update idempotent/aman; 401/400/404 sesuai kontrak.
- **Dependencies:** P1.3.
- **Verification:** smoke tests untuk tiap status.

### P1.5 — Learning Center UI integration (MVP minimal)
- **Goal:** Route `/learning` menampilkan data nyata dari API untuk satu learning path.
- **Status:** Done (local, uncommitted, command-verified 2026-11-26; browser manual skipped)
- **Scope:**
  - Ganti scaffold Learning Center dengan tampilan list/detail minimal.
  - Loading/empty/error/success states.
  - Gunakan fetch wrapper bertipe minimal; jangan tambah dependency state manager tanpa persetujuan.
  - Jangan ubah route SPA lain.
- **Acceptance criteria:** satu path dapat dibuka, lesson dibaca, progress/mastered manual dapat diubah oleh owner.
- **Dependencies:** P1.1-P1.4, auth/session frontend flow (perlu slice terpisah bila belum ada).
- **Verification:** npm test/typecheck/lint/build, smoke browser manual (status dicatat).

### P1.6 — Learning exit criteria review
- **Goal:** Buktikan exit criteria Phase 1: satu learning path dapat dipelajari sampai evaluasi dan progress tersimpan.
- **Status:** Done (local, 2026-11-26) — see [phase-1-exit-review-2026-11-26.md](./phase-1-exit-review-2026-11-26.md)
- **Scope:** evidence end-to-end pada dev lokal, laporan, known gaps.
- **Dependencies:** P1.1-P1.5.
- **Verification:** command checks + manual flow evidence.

## Risiko / Open items
- Frontend belum punya alur login/session nyata; P1.5 butuh keputusan/slice integrasi auth UI.
- E2E Google OAuth dilaporkan terverifikasi oleh pengguna (2026-11-26) tapi belum ada bukti otomatis di repo; catat sebagai user-reported.
- OD-002 deploy constraint (Fastify on Vercel) tidak menghalangi Phase 1 lokal, tapi relevan sebelum deploy.
- CI remote belum diverifikasi oleh workflow run (pengguna menyatakan akan verifikasi).

## Definition of Done per slice
- Acceptance criteria terpenuhi.
- Input divalidasi server-side.
- Guard/otorisasi server diperiksa.
- Test/check relevan lulus.
- State loading/empty/error/success ditangani (untuk UI).
- Tidak ada secret di diff/log.
- Dokumentasi/migrasi diperbarui bila perlu.
- Risiko dan rollback dipahami.