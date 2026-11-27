# Backlog Phase 2 — Engineering Handbook (Draft)

- **Status:** P2.1–P2.6 implemented/verified locally on 2026-11-26; Phase 2 exit review **local PASS with known gaps** ([phase-2-exit-review-2026-11-26.md](./phase-2-exit-review-2026-11-26.md)). Dokumen ini tetap draft perencanaan: known gaps Phase 1/2 diterima pengguna 2026-11-27 melalui [Gate Phase 1–3](./phase-1-3-acceptance-gate-2026-11-27.md), commit/push dilakukan manual oleh pengguna, dan gate ini bukan izin deploy atau perubahan scope/dependency. Laporan: [p2.1](./p2.1-implementation-report-2026-11-26.md), [p2.2](./p2.2-implementation-report-2026-11-26.md), [p2.3](./p2.3-implementation-report-2026-11-26.md), [p2.4](./p2.4-implementation-report-2026-11-26.md), [p2.5](./p2.5-implementation-report-2026-11-26.md).
- **Catatan P4.1 (2026-11-27):** Repo/remote sinkron di `7d46927`, working tree bersih saat audit, CI run #2 `45956782960` `success` ([bukti](./p4.1-implementation-report-2026-11-27.md)). Melengkapi status historis di atas, bukan menggantinya.
- **Tanggal:** 2026-11-26
- **Prasyarat:** Exit criteria Phase 1 tercapai secara lokal pada API + UI yang command-verified ([phase-1-exit-review-2026-11-26.md](./phase-1-exit-review-2026-11-26.md)), dengan known gaps yang masih terbuka. Phase 1 belum dinyatakan selesai operasional oleh pengguna; Phase 2 hanya dipetakan di dokumen ini.
- **Fokus Phase 2:** Satu tahap engineering memiliki paket standar lengkap dan dapat ditemukan/digunakan (README §Rencana Pengembangan; exit criteria roadmap).
- **Batasan:** Satu active slice pada satu waktu; verifikasi sebelum lanjut; tidak ada commit/push/deploy tanpa instruksi eksplisit; tidak ada dependency baru tanpa persetujuan; tidak ada fitur di luar scope MVP. Status browser/a11y/responsive manual mengikuti keputusan pengguna sebelumnya (dilewati dulu) dan tetap dicatat bila dilewati.

## 1. Kesiapan saat ini

| Area | Kondisi aktual | Sumber |
|---|---|---|
| Domain `handbook` | Tabel `handbook_categories`, `handbook_items`, `handbook_item_versions` sudah ada. Versi memakai `content_json` (A1), status `Draft\|Approved\|Deprecated` (B1), `change_note`, dan `approved_at`. | `server/src/db/schema/handbook.ts` |
| Migrasi | `0000_init.sql` memuat partial unique index `handbook_item_versions_one_approved_uidx` (maksimal satu versi `Approved` per item). | `server/src/db/migrations/0000_init.sql` |
| Seed development | Seed lama `[SEED]` (1 kategori + 1 item + 1 versi `Draft`) tetap utuh. Seed baru `[SEED-P2]` menambah 1 kategori + 1 item + 1 versi `Approved` dengan enam bagian terisi dan provenance. | `server/src/db/seed/seed.ts` |
| Kontrak API | Inventaris `/api/handbook/**` tersedia, tetapi berstatus `Proposed` dan belum diimplementasikan. | `docs/api-contract.md` §6.3 |
| Auth & CSRF | Guard `/api/**`, session DB, `X-CSRF-Token`, dan `GET /api/auth/me` sudah tersedia dari P0.4-03. Tidak perlu dependency baru. | `README.md`, `docs/phase-0-backlog.md` |
| UI | Rute `/handbook` memakai `HandbookView` read-only yang menarik data dari `/api/handbook/**`; rute `projects` tetap `ModuleScaffoldView`. Wrapper `apiFetch` + CSRF sudah tersedia. | `src/App.tsx`, `src/components/views/HandbookView.tsx`, `src/lib/api.ts` |
| Keputusan | A1/OD-004, B1/OD-005, C2/OD-008, OD-003, dan D1/PRD-Q-Mastered sudah Approved. | `docs/adr-status.md` |

**Belum ada:** UI create/edit/approve handbook dan automated backend test. Handler `/api/handbook/**` untuk baca, authoring, riwayat versi, dan approval tersedia secara lokal (P2.1–P2.3), paket standar `Approved` tersedia via seed (P2.4), dan tampilan baca handbook tersedia (P2.5).

**Batasan terbawa dari Phase 1 yang perlu diingat:** perubahan P1.3–P1.6 masih uncommitted pada saat exit review; CI remote belum diverifikasi oleh agent; browser smoke manual dilewati sesuai persetujuan pengguna; E2E Google OAuth adalah user-reported; belum ada test backend otomatis; OD-002 (constraint Fastify saat deploy) masih terbuka. Tidak ada yang diperbaiki otomatis oleh perencanaan ini.

## 2. Keputusan dan asumsi desain

| Hal | Status | Perlakuan di Phase 2 (Proposed) |
|---|---|---|
| A1 / OD-004 | Approved | Konten tetap JSON block terstruktur; tidak menambah editor/library baru. |
| B1 / OD-005 | Approved | Baris versi append-only; `Draft → Approved` hanya oleh aksi eksplisit owner; versi `Approved` terbaru menjadi standar aktif. |
| C2 / OD-008 | Approved | Timestamp lokal Asia/Jakarta konsisten dengan implementasi learning. |
| OD-003 | Approved | Semua `/api/handbook/**` berada di balik guard owner + CSRF; tidak ada bypass. |
| Field paket standar | Accepted sebagai requirement | `Purpose`, `When to use`, `Procedure`, `Checklist`, `Templates/prompts`, `Deliverables` mengikuti ADR-006 dan `docs/repository-structure.md`. |
| Bentuk `contentJson` handbook | **Approved — 2026-11-26 (diterima pengguna)** | Objek dengan bagian bernama (`purpose`, `whenToUse`, `procedure`, `checklist`, `templates`, `deliverables`), masing-masing array block A1 (boleh kosong pada Draft), plus `provenance` berisi minimal satu label. Divalidasi Zod di P2.2. |
| Batas `PATCH /api/handbook/items/:id` | **Approved — 2026-11-26 (diterima pengguna)** | `PATCH` hanya metadata (`title`, `summary`, `categoryId`); perubahan konten wajib lewat endpoint versi di P2.3 agar versi append-only tidak tertimpa. Diterapkan di P2.2. |
| Pagination `meta` | **Proposed, belum konsisten** | Phase 1 memakai `{ data: [...] }` tanpa `meta`. Rekomendasi P2.1: ikuti pola tersebut dulu dan catat `meta` sebagai gap, bukan menambah kontrak baru diam-diam. |

## 3. Urutan slice yang diusulkan

Satu slice aktif pada satu waktu. Status tiap slice mengikuti penandaan pada bagian masing-masing; P2.1–P2.6 sudah `Done` secara lokal, dengan exit review Phase 2 di [phase-2-exit-review-2026-11-26.md](./phase-2-exit-review-2026-11-26.md).

### P2.1 — Handbook read foundation (API)

- **Status:** Done (local, verified 2026-11-26) — see [p2.1-implementation-report-2026-11-26.md](./p2.1-implementation-report-2026-11-26.md)
- **Priority:** `Must`
- **Goal / Outcome:** Owner terautentikasi dapat membaca kategori, daftar item handbook, dan detail item beserta versi standar aktifnya dari API.
- **Why now:** Ini fondasi untuk "dapat ditemukan/digunakan" dan mirror langsung dari P1.1 yang sudah terbukti pada modul learning.
- **Scope / In-scope:** `GET /api/handbook/categories` (urut `sortOrder`); `GET /api/handbook/items` (filter `categoryId`, `status`, `q`); `GET /api/handbook/items/:id` (detail + resolusi versi `Approved` terbaru). Envelope `{ data: ... }`.
- **Non-scope:** Write/authoring, approval, UI, export/import, pagination `meta` final, rich text rendering.
- **Acceptance criteria:** tanpa sesi → `401`; sesi valid → `200`; query/param invalid → `400`; id tidak ditemukan → `404`; item tanpa versi `Approved` mengembalikan `activeVersion: null` dan tidak menampilkan `Draft` sebagai standar; `q` menyaring judul/ringkasan secara case-insensitive; kategori terurut sesuai `sortOrder`.
- **Files / areas affected:** `server/src/modules/handbook/routes.ts` (baru), `server/src/app.ts` (registrasi route), dokumentasi kontrak bila konvensi berubah.
- **Dependencies:** P0.4-02 schema, P0.4-03 guard, kontrak `docs/api-contract.md` §6.3.
- **Verification plan:** `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`; API smoke dengan session sementara (401/400/404/200) dan cleanup session.
- **Risks / assumptions:** resolusi "standar aktif" belum pernah diimplementasikan; bentuk filter `q` dan pagination masih usulan; drift antara migrasi dan deklarasi partial unique index belum ditinjau.
- **Rollback consideration:** hapus file route baru dan registrasinya; tidak ada perubahan schema/data permanen.
- **Definition of Done:** lihat §5.

### P2.2 — Authoring item handbook dasar

- **Status:** Done (local, verified 2026-11-26) — see [p2.2-implementation-report-2026-11-26.md](./p2.2-implementation-report-2026-11-26.md)
- **Priority:** `Must`
- **Goal / Outcome:** Owner dapat membuat item handbook baru dan memperbarui metadata item melalui API, dengan versi awal `Draft` v1.
- **Why now:** P2.4 memerlukan cara membuat paket standar; P2.1 saja hanya bisa membaca seed `Draft`.
- **Scope / In-scope:** `POST /api/handbook/items` (item + versi awal `Draft` v1 dalam transaksi); `PATCH /api/handbook/items/:id` (metadata saja, sesuai asumsi §2); Zod untuk field standar dan batas panjang; `changeNote` pada versi awal.
- **Non-scope:** Perubahan konten langsung via `PATCH`, approval, versi baru, delete/archive, upload, import, editor UI.
- **Acceptance criteria:** `201`/`200` sesuai kontrak; `400` untuk field wajib kosong/format `contentJson` invalid; `401`/`404` sesuai guard; versi awal selalu `Draft` v1; tidak ada auto-approve; tidak ada cascading delete.
- **Files / areas affected:** `server/src/modules/handbook/routes.ts`, kemungkinan schema Zod lokal di modul yang sama.
- **Dependencies:** P2.1; konfirmasi bentuk `contentJson` handbook dan batas `PATCH` (§2).
- **Verification plan:** command checks + API smoke (create → patch metadata → baca ulang via P2.1) dengan cleanup row test.
- **Risks / assumptions:** bentuk `contentJson` masih Proposed; batas metadata vs konten perlu disetujui agar tidak melanggar B1.
- **Rollback consideration:** hapus hanya row test yang dibuat saat smoke berdasarkan ID yang dicatat; tidak menghapus data seed/user lain.
- **Definition of Done:** lihat §5.

### P2.3 — Riwayat versi dan approval eksplisit (B1)

- **Status:** Done (local, verified 2026-11-26) — see [p2.3-implementation-report-2026-11-26.md](./p2.3-implementation-report-2026-11-26.md)
- **Priority:** `Must`
- **Goal / Outcome:** Perubahan konten standar tersimpan append-only dan owner dapat menetapkan satu versi `Approved` sebagai standar aktif lewat aksi eksplisit.
- **Why now:** Tanpa ini tidak ada standar yang sah untuk "dapat digunakan" oleh modul lain atau UI.
- **Scope / In-scope:** `POST /api/handbook/items/:id/versions` (nomor versi naik, status `Draft`); `GET /api/handbook/items/:id/versions`; `POST /api/handbook/items/:id/approve` dengan `{ versionId }` (transaksi: versi `Approved` lama → `Deprecated`, target `Draft` → `Approved` + `approvedAt`).
- **Non-scope:** Auto-approve, approval oleh import/AI, delete versi, edit versi `Approved`, migrasi schema baru.
- **Acceptance criteria:** nomor versi monoton; hanya `Draft` yang bisa di-approve (`409` untuk status lain); `versionId` harus milik item yang bersangkutan (`404`); setelah approve hanya ada satu versi `Approved` per item; riwayat tetap terbaca; konflik/status salah ditolak dengan envelope error yang sudah ada.
- **Files / areas affected:** `server/src/modules/handbook/routes.ts`; tinjauan `server/src/db/schema/handbook.ts` dan migrasi `0000_init.sql` tanpa mengubah keduanya tanpa instruksi.
- **Dependencies:** P2.2; keputusan B1; partial unique index pada migrasi awal.
- **Verification plan:** command checks + smoke 401/400/404/409/201/200; verifikasi constraint satu `Approved` setelah dua kali approve; cleanup row test.
- **Risks / assumptions:** partial unique index ada di migrasi tetapi belum tercermin di file schema Drizzle — jangan menjalankan `db:generate` tanpa meninjau drift; transaksi approve harus menutup race condition.
- **Rollback consideration:** tidak ada update destruktif permanen selain status pada row test; hapus row test setelah verifikasi; jangan menghapus versi user/seed.
- **Definition of Done:** lihat §5.

### P2.4 — Satu paket standar tahap engineering lengkap

- **Status:** Done (local, verified 2026-11-26) — see [p2.4-implementation-report-2026-11-26.md](./p2.4-implementation-report-2026-11-26.md)
- **Priority:** `Must`
- **Goal / Outcome:** Satu kategori/tahap engineering memiliki item standar lengkap (enam field) berstatus `Approved` dan dapat ditemukan lewat API.
- **Why now:** Ini adalah bukti langsung exit criteria Phase 2, bukan sekadar endpoint yang berfungsi.
- **Scope / In-scope:** Tambahan seed idempoten dengan ID baru dan label `[SEED-P2]` pada `server/src/db/seed/seed.ts`; isi enam bagian standar + provenance/label sumber; status `Approved` sesuai B1; verifikasi pencarian `q` dan detail via API.
- **Non-scope:** Mengubah seed P0 yang sudah ada, data produksi, import/export, scraping, promosi ide baru ke scope MVP.
- **Acceptance criteria:** `npm run db:seed` dua kali menghasilkan jumlah row stabil; `GET /api/handbook/items?q=...` menemukan item; detail menampilkan enam field dengan label jelas dan `activeVersion.status = "Approved"`; data diberi label seed development, bukan klaim standar produksi.
- **Files / areas affected:** `server/src/db/seed/seed.ts`, catatan singkat di backlog/laporan bila diperlukan.
- **Dependencies:** P2.1–P2.3.
- **Verification plan:** hitungan row DB sebelum/sesudah seed, API smoke, command checks, `git diff --check`.
- **Risks / assumptions:** seed dapat keliru dianggap konten produksi; konflik ID bila seed lama diubah. Mitigasi: ID baru dan label `[SEED-P2]`.
- **Rollback consideration:** hapus hanya baris dengan ID seed baru bila ada instruksi eksplisit; `onConflictDoNothing` menjaga seed lama tetap utuh.
- **Definition of Done:** lihat §5.

### P2.5 — Handbook UI MVP

- **Status:** Done (local, verified 2026-11-26) — see [p2.5-implementation-report-2026-11-26.md](./p2.5-implementation-report-2026-11-26.md)
- **Priority:** `Should` (wajib bila "dapat ditemukan/digunakan" dimaknai juga lewat UI)
- **Goal / Outcome:** Rute `/handbook` menampilkan data nyata dari API dan memungkinkan owner menemukan serta membuka satu paket standar lengkap.
- **Why now:** Menutup kesenjangan UI yang masih berupa scaffold dan memakai pola yang sudah terbukti di `LearningView`.
- **Scope / In-scope:** `HandbookView.tsx` baru; penyesuaian `src/App.tsx` hanya untuk route `handbook` (route `projects` tetap scaffold); auth check + CTA login seperti `LearningView`; daftar kategori/item, pencarian via `q`, detail dengan enam bagian dan badge status editorial; state loading/empty/error/success; label jelas bila hanya ada `Draft`.
- **Non-scope:** UI create/edit/approve, block/rich-text editor, dependency baru, perubahan route lain, a11y/responsive manual sign-off.
- **Acceptance criteria:** command checks lulus; data berasal dari `/api/handbook/**`, bukan data contoh hard-coded; `Draft` tidak ditampilkan sebagai standar aktif; rute `projects`, dashboard, learning, settings tidak berubah; status browser manual dicatat bila dilewati.
- **Files / areas affected:** `src/App.tsx`, `src/components/views/HandbookView.tsx` (baru), dokumentasi status bila perlu.
- **Dependencies:** P2.1–P2.4; `apiFetch` dan CSRF yang sudah ada.
- **Verification plan:** `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`; smoke browser manual opsional sesuai keputusan pengguna dan dicatat statusnya.
- **Risks / assumptions:** UI hanya read-only agar slice tetap kecil; format `contentJson` harus stabilize di P2.2 agar renderer tidak dibuat dua kali.
- **Rollback consideration:** kembalikan `App.tsx` ke `ModuleScaffoldView` untuk `handbook` dan hapus file view baru; tidak ada data yang dihapus.
- **Definition of Done:** lihat §5.

### P2.6 — Phase 2 exit review

- **Status:** Done (local, documentation-only, verified 2026-11-26) — see [phase-2-exit-review-2026-11-26.md](./phase-2-exit-review-2026-11-26.md)
- **Priority:** `Must`
- **Goal / Outcome:** Laporan bukti lokal yang menunjukkan apakah exit criteria Phase 2 terpenuhi, lengkap dengan known gaps.
- **Why now:** Menutup siklus Phase 2 dengan bukti dan batasan yang jelas, konsisten dengan pola Phase 1.
- **Scope / In-scope:** `docs/phase-2-exit-review-<tanggal>.md`; pembaruan status `docs/phase-2-backlog.md` dan `docs/README.md` sesuai hasil aktual.
- **Non-scope:** Klaim sign-off pengguna, klaim CI remote hijau, klaim deploy, dan perubahan kode di luar koreksi dokumentasi.
- **Acceptance criteria:** tabel bukti slice, langkah E2E API, hasil command checks, known gaps, dan rekomendasi tersedia; status "local PASS" hanya bila benar-benar terverifikasi.
- **Files / areas affected:** dokumen `docs/`.
- **Dependencies:** P2.1–P2.5.
- **Verification plan:** `git diff --check`; tinjau konsistensi dengan README/roadmap dan laporan Phase 1.
- **Risks / assumptions:** bukti bisa lebih lemah bila browser/CI remote tidak diverifikasi; catat sebagai gap, jangan dianggap lulus.
- **Rollback consideration:** revisi dokumen; tidak ada perubahan data.
- **Definition of Done:** lihat §5.

## 4. Risiko dan open items lintas slice

- **Gate Phase 1:** Known gaps Phase 1 diterima pengguna 2026-11-27 melalui [Gate Phase 1–3](./phase-1-3-acceptance-gate-2026-11-27.md); perencanaan ini tidak menutup gate CI/deploy/browser.
- **Working tree:** perubahan P1.3–P1.6 belum di-commit pada saat review. Jangan reset, checkout destruktif, commit, atau push tanpa instruksi eksplisit.
- **Format konten:** bentuk `contentJson` handbook dan batas `PATCH` sudah disetujui pengguna 2026-11-26 dan diterapkan di P2.2; tidak ada keputusan baru yang tertunda untuk ini.
- **Kontrak API:** pagination `meta`, `sort`, dan daftar field final masih Proposed; kontrak §6.3 perlu diselaraskan dengan implementasi yang dipilih.
- **Drift schema/migrasi:** partial unique index ada di `0000_init.sql` tetapi tidak tercantum di `server/src/db/schema/handbook.ts`. Jangan membuat migrasi baru hanya untuk "merapikan" tanpa peninjauan dan persetujuan.
- **Kualitas verifikasi:** belum ada automated backend test; smoke manual saja tidak cukup untuk mengklaim hardening. Usulkan test otomatis minimal sebagai slice terpisah bila disetujui, bukan disisipkan diam-diam.
- **Deploy:** OD-002 (Fastify long-running vs serverless/Vercel) tetap terbuka dan tidak masuk Phase 2.
- **Perubahan scope/dependency:** editor rich text, import/export, pencarian lanjutan, dan fitur Phase 3 tetap di luar slice ini; ide baru masuk Future Ideas lebih dulu sesuai `docs/change-control.md`.

## 5. Definition of Done per slice

- [ ] Acceptance criteria slice terpenuhi dan buktinya dicatat.
- [ ] Input divalidasi server-side dengan Zod; error envelope konsisten.
- [ ] Guard/otorisasi server diperiksa untuk data privat (`401`/`403`).
- [ ] Test/check relevan lulus (`npm test`, `typecheck`, `lint`, `build` bila kode tersentuh); `git diff --check`.
- [ ] State loading/empty/error/success ditangani bila ada perubahan UI/API.
- [ ] Tidak ada secret atau data sensitif di diff/log.
- [ ] Dokumentasi dan migrasi diperbarui bila diperlukan; perubahan migrasi hanya dengan instruksi eksplisit.
- [ ] Diff ditinjau; risiko dan rollback dipahami.
- [ ] Item yang tidak relevan ditandai `N/A` dengan alasan tertulis (misalnya UI/test untuk slice dokumentasi).
- [ ] Backup tersedia untuk perubahan berisiko (misalnya sebelum menyentuh seed/data), sesuai kebijakan yang berlaku.

## 6. Gate sebelum implementasi

- [ ] Pengguna memberi instruksi eksplisit untuk memulai satu slice tertentu (usulan: P2.1 lebih dulu).
- [ ] Status akhir Phase 1 (sign-off atau penerimaan known gaps) dicatat bila dibutuhkan sebagai prasyarat.
- [x] Bentuk `contentJson` handbook dan batas `PATCH` dikonfirmasi pengguna 2026-11-26 dan diterapkan di P2.2.
- [ ] Tidak menyentuh perubahan working tree pengguna tanpa instruksi; commit/push hanya bila diminta eksplisit.
- [ ] Dokumen ini tetap `Draft/Proposed` sampai pengguna menyetujui atau mengubah urutan slice.
