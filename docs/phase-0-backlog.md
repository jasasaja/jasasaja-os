# Backlog Phase 0 — Scope Freeze & Foundation

- **Status:** Draft untuk persetujuan
- **Tanggal:** 2026-11-24
- **Sumber:** Development Roadmap v1.1 §3 (Phase 0 work packages dan exit criteria), Master Blueprint v1.1, PRD MVP v1.1.
- **Status review:** **Phase 0 SIGNED OFF (dengan batasan diterima pengguna).** P0.1-01 s.d. P0.5-02 selesai pada 2026-11-24/26. P0.5-03 refresh review: [`phase-0-exit-review-2026-11-26.md`](./phase-0-exit-review-2026-11-26.md). Pengguna memberikan persetujuan tertulis eksplisit 2026-11-26 untuk menutup Phase 0 dan mulai Phase 1; risiko/batasan ditangani kemudian; CI remote akan diverifikasi oleh pengguna; browser/a11y/responsive dilewati dulu. Phase 1 belum diimplementasikan di sesi ini.
- **Catatan:** Ini adalah **rencana kerja masa depan**. Tidak ada task implementasi yang dikerjakan dalam sesi perencanaan ini; P0.1-01, P0.1-02, P0.1-03, P0.2-01, P0.2-02, P0.2-03, P0.3-02, P0.3-03, P0.4-01, P0.4-02, P0.4-03, P0.5-01, dan P0.5-02 diselesaikan pada 2026-11-24/26. Setiap task tunduk pada Definition of Done di roadmap: acceptance criteria terpenuhi, input divalidasi, otorisasi server diperiksa, test relevan lulus, state loading/empty/error/success ditangani, tidak ada secret di diff, dokumentasi/migration diperbarui, serta risiko dan rollback dipahami.

## Urutan dan ketergantungan

```
P0.1 (scope & keputusan) → P0.2 (repo & workflow) → P0.3 (stack & kontrak API)
    → P0.4 (database & server guard) → P0.5 (verifikasi & exit gate)
```

Satu active phase dan satu active slice pada satu waktu. Jangan memulai Phase 1 sebelum exit criteria Phase 0 terpenuhi.

---

## P0.1 — Scope Freeze & Decision Register

### P0.1-01 — Setujui dokumen baseline v1.1

- **Status:** Done — baseline v1.1 Approved pada 2026-11-24. Audit P0.5-03: **PARTIAL** — status persetujuan tercatat di `README.md`/`docs/README.md`/`adr-status.md`, tetapi file `.docx` baseline tidak hadir di repository sehingga isi tidak dapat dibandingkan.
- **Goal:** Mengunci Master Blueprint v1.1, PRD MVP v1.1, dan Development Roadmap v1.1 sebagai acuan implementasi yang konsisten.
- **Acceptance criteria:**
  - Ketiga dokumen ditinjau dan dinyatakan `Approved` (bukan lagi `Draft for approval`) oleh pengguna.
  - Scope, non-goal, dan prioritas Must/Should/Could/Won't now tidak berubah secara diam-diam.
  - Status dokumen dan tanggal persetujuan dicatat.
- **Files/areas affected:** Dokumen v1.1 di luar repository; `README.md` bagian status proyek (setelah disetujui); `docs/README.md`.
- **Dependencies:** Tidak ada.
- **Verification plan:** Bandingkan isi akhir dengan daftar non-goal Blueprint §10 dan PRD §3/§11; pastikan tidak ada fitur Phase 2–5 yang masuk MVP.
- **Risks:** Scope creep lewat "small addition"; dokumen turunan menjadi tidak sinkron.
- **Rollback consideration:** Kembalikan status dokumen ke `Draft` dan buat change request tertulis bila ada perubahan scope.

### P0.1-02 — Finalisasi ADR-001–ADR-009 dan tutup open decisions

- **Status:** Done untuk cakupan keputusan yang disetujui pengguna pada 2026-11-24; OD-001, OD-002 (hosting), OD-003, OD-004, OD-005, OD-006, OD-008, dan PRD-Q-Mastered tetap terbuka. Audit P0.5-03: **PARTIAL** — acceptance criteria "tidak ada `Proposed` yang tertinggal" tidak terpenuhi karena ADR-007/008/009 tetap `Proposed`.
- **Hasil:** ADR-001–ADR-006 `Accepted` pada cakupan yang disetujui; ADR-007–ADR-009 tetap `Proposed` karena belum ada persetujuan pengguna. Register lengkap: [adr-status.md](./adr-status.md).
- **Goal:** Mengubah rekomendasi menjadi keputusan yang tercatat, serta menyelesaikan OD yang menghambat Phase 1.
- **Acceptance criteria:**
  - ADR-001–009 memiliki status final `Accepted` atau `Rejected` dengan alasan; tidak ada status `Proposed` yang tertinggal pada keputusan utama.
  - OD-001–OD-008 memiliki status dan pemilik keputusan; OD-007 tercatat `hybrid` sesuai konfirmasi pengguna.
  - Keputusan yang menambah biaya atau layanan berbayar memiliki persetujuan eksplisit tertulis.
- **Files/areas affected:** `docs/adr/*.md`, `docs/architecture-proposal.md`, `docs/README.md`, daftar open decisions di `README.md`.
- **Dependencies:** P0.1-01.
- **Verification plan:** Audit status seluruh ADR; cek konsistensi antara rekomendasi proposal dan status ADR; pastikan tidak ada dependency yang dipasang sebelum persetujuan.
- **Risks:** Keputusan setengah disetujui; provider/hosting berubah biaya sebelum keputusan final.
- **Rollback consideration:** ADR yang ditolak tetap arsip dengan alasan; ADR baru supersedes ADR lama, bukan menimpa riwayat.

### P0.1-03 — Kunci Definition of Done dan aturan change control

- **Status:** Done — 2026-11-24.
- **Hasil:** Template task dan checklist DoD tersedia di [`task-template.md`](./task-template.md); aturan persetujuan scope, biaya, deployment produksi, dan penghapusan data tercatat di [`change-control.md`](./change-control.md).
- **Goal:** Menyamakan kriteria selesai task dan perlakuan ide baru agar tidak masuk sprint aktif tanpa proses.
- **Acceptance criteria:**
  - Checklist DoD dari roadmap tersedia dan dipakai sebagai template task.
  - Label `Must/Should/Could/Won't now` dan kategori `Future Ideas` digunakan konsisten.
  - Aturan persetujuan untuk perubahan scope, biaya, deployment produksi, dan penghapusan data tertulis jelas.
- **Files/areas affected:** `docs/` (template task/DoD), `README.md` bagian Kontribusi dan Perubahan.
- **Dependencies:** P0.1-01.
- **Verification plan:** Tinjau satu contoh task backlog dengan checklist DoD; pastikan setiap field wajib terisi.
- **Risks:** DoD terlalu berat untuk slice kecil; aturan tidak dipraktikkan.
- **Rollback consideration:** Checklist dapat disederhanakan lewat revisi docs, tanpa mengubah scope.

---

## P0.2 — Repository & Workflow Baseline

### P0.2-01 — Konfirmasi struktur repository dan branch strategy

- **Status:** Done — 2026-11-25.
- **Hasil:** Peta frontend/backend dan batas modul tercatat di [`repository-structure.md`](./repository-structure.md); branch strategy serta aturan checkpoint ditulis sebagai konvensi `Proposed`. Tidak ada folder/branch fisik yang dibuat dan tidak ada perubahan uncommitted yang dihapus.
- **Goal:** Menetapkan satu repository dengan batas modul yang jelas dan alur branch yang dapat diikuti solo developer.
- **Acceptance criteria:**
  - Satu repository untuk frontend dan backend; tidak ada multi-repo/package terpisah.
  - Area modul `learning`, `handbook`, `projects`, `shared/core` serta area frontend/backend terdokumentasi.
  - Strategi branch dan aturan checkpoint (commit hanya setelah verifikasi lolos) tertulis.
  - Perubahan uncommitted yang sudah ada dipertahankan; tidak ada reset/checkout destruktif.
- **Files/areas affected:** `AGENTS.md` (rencana), `docs/repository-structure.md` (rencana), README.
- **Dependencies:** P0.1-01, P0.1-03.
- **Verification plan:** `git status --short` dan `git diff --stat` menunjukkan tidak ada file pengguna yang hilang; struktur folder sesuai ADR-001.
- **Risks:** Reorganisasi folder mengganggu path alias `@/*` atau Vite copy-asset plugin.
- **Rollback consideration:** Perubahan struktur dapat dibatalkan lewat Git sebelum commit; hindari rename massal saat working tree belum bersih.

### P0.2-02 — Lengkapi README Setup dan perintah proyek

- **Status:** Done — 2026-11-25.
- **Hasil:** Bagian setup README diperbarui berdasarkan `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, dan kondisi environment aktual. Hanya frontend existing yang didokumentasikan; backend, migration/seed, database, dan Google Login dinyatakan belum tersedia.
- **Goal:** Mengganti placeholder README dengan instruksi yang benar-benar dapat dijalankan.
- **Acceptance criteria:**
  - Bagian Setup dan Perintah Proyek berisi langkah `npm ci`, `dev`, `test`, `typecheck`, `lint`, `build`.
  - Instruksi backend, migration, seed, dan environment mengikuti keputusan ADR yang sudah final.
  - Tidak ada perintah yang menyarankan layanan berbayar tanpa catatan persetujuan.
  - Tidak ada secret atau kredensial contoh yang tampak seperti nilai produksi.
- **Files/areas affected:** `README.md`, `docs/README.md`.
- **Dependencies:** P0.1-02, P0.3-01 (validasi versi), P0.4-01 (environment).
- **Verification plan:** Jalankan setiap perintah dari README pada environment development bersih; bandingkan hasilnya dengan dokumentasi.
- **Risks:** README menjadi usang saat stack berubah; perintah lint/typecheck tumpang tindih.
- **Rollback consideration:** Kembalikan bagian README ke versi sebelumnya lewat Git bila instruksi terbukti menyesatkan.

### P0.2-03 — Template backlog dan progress report

- **Status:** Done — 2026-11-25.
- **Hasil:** `docs/task-template.md` diperluas dengan field `Scope / In-scope` dan `Non-scope`; `docs/report-template.md` dibuat dengan 12 topik wajib; indeks `docs/README.md`, README root, dan `docs/change-control.md` ditautkan ke kedua template.
- **Goal:** Menyeragamkan pencatatan task dan laporan kemajuan sesuai roadmap §9/§12.
- **Acceptance criteria:**
  - Template task memuat Goal, Acceptance criteria, Files/areas affected, Dependencies, Verification plan, Risks, Rollback.
  - Template laporan memuat Phase/Slice, Goal, Status, Changed files, Verification, Risks/assumptions, Next smallest action.
  - Status yang dipakai: `Not Started`, `In Progress`, `Blocked`, `Done`.
- **Files/areas affected:** `docs/` (template), sistem issue/backlog yang dipilih.
- **Dependencies:** P0.1-03.
- **Verification plan:** Buat satu contoh task dan satu contoh laporan memakai template; cek kelengkapan field.
- **Risks:** Duplikasi antara dokumen dan issue tracker.
- **Rollback consideration:** Template dapat diganti tanpa menyentuh kode.

---

## P0.3 — Stack Validation & API Contract

### P0.3-01 — Validasi baseline frontend dan kompatibilitas versi

- **Status:** PARTIAL (audit P0.5-03, 2026-11-25) — `npm ci --dry-run`, `npm test` 23/23, `typecheck`, `lint`, `build`, dan startup Vite HTTP 200 terverifikasi pada audit ini, tetapi laporan validasi task tidak dipersisten sebagai file dokumen.
- **Goal:** Memastikan frontend yang sudah lulus QA tetap sehat sebelum backend ditambahkan.
- **Acceptance criteria:**
  - `npm ci`, `npm test` (23/23), `npm run typecheck`, `npm run lint`, `npm run build` lulus.
  - Nama file test dan jumlah test terdokumentasi: `tokens.test.ts` 2, `dashboardActivity.test.ts` 5, `focusTrap.test.ts` 5, `navigation.test.ts` 6, `settings.test.ts` 5.
  - Versi Node dan dependency dicatat sesuai ADR-002; tidak ada perubahan `package.json`/lockfile dalam task ini.
  - Warning `__dirname` di `vite.config.ts` dicatat sebagai utang teknis kecil, bukan blocker.
- **Files/areas affected:** `docs/` (catatan validasi), tidak ada perubahan kode.
- **Dependencies:** P0.1-02.
- **Verification plan:** Jalankan seluruh perintah di atas dan simpan hasilnya pada laporan validasi.
- **Risks:** Perbedaan Node/Windows menyebabkan glob test atau build berbeda.
- **Rollback consideration:** Tidak ada perubahan kode; cukup perbarui catatan bila hasil berbeda.

### P0.3-02 — Rancang kontrak API `/api`

- **Status:** Done — 2026-11-25.
- **Hasil:** `docs/api-contract.md` dibuat sebagai kontrak `Proposed` untuk ditinjau. Dokumen memuat conventions `/api`, error envelope, validasi Zod, batas auth/OD-003, batas modul, inventaris endpoint MVP, pagination, dan versioning. Tidak ada ADR atau Open Decision yang ditutup; tidak ada endpoint/server/dependency yang dibuat.
- **Goal:** Menetapkan batas kontrak yang tidak bertabrakan dengan 5 route SPA yang sudah ada.
- **Acceptance criteria:**
  - Prefix `/api`, health check, dan error envelope `{ error: { code, message, details? } }` terdokumentasi.
  - Aturan validasi request, pagination/filter dasar, dan status HTTP tercantum.
  - Pesan error user-facing berbahasa Indonesia; identifier teknis Inggris.
  - Tidak ada perubahan pada route `dashboard`, `learning`, `handbook`, `projects`, `settings`.
- **Files/areas affected:** `docs/api-contract.md` (dibuat), `docs/README.md` dan backlog (penandaan selesai); `src/utils/navigation.ts` hanya dibaca, tidak diubah.
- **Dependencies:** P0.1-02, P0.3-01.
- **Verification plan:** Tinjau kontrak bersama daftar route SPA; pastikan tidak ada overlap path; contoh request/responses valid.
- **Risks:** Kontrak berubah saat Phase 1 sehingga memerlukan revisi frontend.
- **Rollback consideration:** Kontrak versi pertama dapat ditandai `v1` dan dipertahankan bila versi baru diperlukan.

### P0.3-03 — Bootstrap skeleton backend dan health endpoint

- **Status:** Done — 2026-11-25 (Step 3). Skeleton backend dibuat: `server/` dengan Fastify+TS, prefix `/api`, `GET /api/health` mengembalikan `{ data: { status: "ok" } }`, error envelope terpusat, logging redaksi dasar, batas modul `learning/handbook/projects/shared/core`. Dependency OD-001 dipasang dengan pin eksplisit.
- **Goal:** Menyiapkan proses API minimal yang dapat dijalankan lokal tanpa mengubah frontend.
- **Acceptance criteria:**
  - Proses API berjalan pada port lokal yang ditentukan (usulan `:3001`) dengan konfigurasi dari environment.
  - `GET /api/health` merespons status siap.
  - Middleware error, logging tanpa secret, dan struktur modul sesuai ADR-001 tersedia.
  - Dependency baru hanya dipasang setelah ADR-002 disetujui.
- **Files/areas affected:** Area `server/` atau `apps/api/` (rencana), `.env` template (rencana), `package.json`/lockfile (hanya bila sudah disetujui).
- **Dependencies:** P0.1-02, P0.3-02, persetujuan dependency ADR-002.
- **Verification plan:** Jalankan API lokal, panggil health endpoint, pastikan frontend `npm test` tetap 23/23 dan build lulus.
- **Risks:** Port bentrok dengan Vite; perubahan lockfile mengganggu frontend.
- **Rollback consideration:** Hapus area backend dan kembalikan lockfile ke versi sebelum bootstrap bila verifikasi gagal; lakukan sebelum ada data.

---

## P0.4 — Database & Server Foundation

### P0.4-01 — Siapkan PostgreSQL lokal dan template environment

- **Status:** Done — 2026-11-25 (Step 4). `docker-compose.yml` dibuat (project `jasasaja-os-dev`, volume `jasasaja_os_dev_pgdata`, port host `5433`), `.env.example` template dibuat ulang, modul koneksi DB API ditambah. Verifikasi: compose config/up/ps healthy, cek koneksi DB dari modul API berhasil, tidak ada secret di diff/log, `git diff --check` lulus.
- **Goal:** Menyediakan database development tanpa biaya dan tanpa secret di Git.
- **Acceptance criteria:**
  - PostgreSQL lokal dapat dijalankan dan diakses sesuai ADR-003.
  - Template environment berisi nama variable saja dengan placeholder jelas; nilai nyata tidak di-commit.
  - `.gitignore` tetap mengabaikan `.env*`; pola `!.env.example` dipertahankan bila template dipakai.
- **Files/areas affected:** `docker-compose.yml` atau setara (rencana), `.env.example` (rencana — saat ini tidak ada), dokumentasi setup.
- **Dependencies:** P0.1-02 (ADR-003, ADR-005, ADR-009), P0.2-02, P0.3-03.
- **Verification plan:** Hapus volume lokal lalu jalankan ulang; pastikan koneksi berhasil dari API development.
- **Risks:** Port database bentrok; kredensial development tertulis di dokumentasi sebagai nilai produksi.
- **Rollback consideration:** Hentikan container dan hapus volume development; tidak ada data produksi yang tersentuh.

### P0.4-02 — Migrasi pertama dan seed yang dapat dijalankan ulang

- **Status:** Done — 2026-11-25 (Step 5). Drizzle schema/config/migrasi/seed dibuat sesuai A1/B1/C2/D1. Migrasi `0000_init.sql` diterapkan; seed idempoten (dijalankan dua kali, tidak duplikat). Constraint/FK/partial unique index Approved diverifikasi. Verifikasi: `npm ci`, `npm test` 23/23, `typecheck`, `lint`, `build`, `git diff --check` lulus.
- **Goal:** Membuat fondasi skema dengan integritas data sesuai NFR-07.
- **Acceptance criteria:**
  - Satu migrasi berversi menghasilkan tabel `shared/core` dan kerangka tabel domain sesuai ADR-001/ADR-007/ADR-009.
  - Foreign key, constraint, dan tipe timestamp UTC sesuai ADR-003/ADR-009.
  - Seed dapat dijalankan ulang (idempotent) tanpa duplikat.
  - Tidak ada cascade delete yang belum ditinjau.
- **Files/areas affected:** Folder migrasi dan seed di area backend (rencana), dokumentasi skema.
- **Dependencies:** P0.4-01, ADR-003/ADR-007/ADR-009 final.
- **Verification plan:** Jalankan migrasi + seed dua kali berturut-turut pada database development; uji constraint dengan data invalid; restore dump sesuai ADR-008.
- **Risks:** Migrasi destruktif merusak relasi; seed mengisi data contoh yang disalahartikan sebagai data nyata.
- **Rollback consideration:** Simpan dump sebelum migrasi; sediakan migrasi `down` bila tool mendukung; beri label jelas pada data seed.

### P0.4-03 — Validasi server dan guard owner

- **Status:** Done — 2026-11-25 (Step 6). Fondasi auth/session/guard/CSRF diimplementasikan sesuai OD-003: session server-side DB, opaque HttpOnly cookie, guard default-protected `/api/**`, allowlist publik `GET /api/health` + auth flow Google start/callback, CSRF/Origin/JSON checks untuk mutasi, `/api/auth/me`, `/api/auth/logout`. Verifikasi lokal: guard 401 tanpa session, 200 dengan session DB-inserted, CSRF/origin/content-type ditolak, logout mencabut session, health tetap publik, OAuth start/callback mengembalikan 503 saat belum dikonfigurasi. E2E Google OAuth dengan kredensial nyata belum diverifikasi.
- **Goal:** Menerapkan aturan keamanan minimum sebelum endpoint domain dibuat.
- **Acceptance criteria:**
  - Semua input divalidasi dengan schema server sesuai ADR-002/ADR-004.
  - Endpoint domain menolak request tanpa session owner yang valid.
  - Error tidak membocorkan secret, stack trace, atau data privat.
  - Status HTTP dan pesan error sesuai kontrak API P0.3-02.
- **Files/areas affected:** Middleware dan utilitas validasi di area backend (rencana), test validasi/otorisasi.
- **Dependencies:** P0.3-02, P0.3-03, P0.4-02, ADR-004 final.
- **Verification plan:** Test request tanpa session, dengan session, dan dengan payload invalid; periksa log tidak berisi secret.
- **Risks:** Guard terlewat pada endpoint baru; validation error tidak ramah pengguna.
- **Rollback consideration:** Nonaktifkan endpoint domain yang terdampak dan kembalikan middleware sebelumnya; jangan menonaktifkan seluruh otorisasi di online.

---

## P0.5 — Verification Pipeline & Exit Gate

### P0.5-01 — Perintah verifikasi dan CI dasar

- **Status:** Done (local) — 2026-11-25 (Step 7). Workflow GitHub Actions dasar Rp0 dibuat di `.github/workflows/ci.yml` untuk `npm ci`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` (Node 20, ubuntu-latest). Perintah terdokumentasi di README. **Eksekusi CI remote belum diverifikasi** karena tidak ada commit/push ke GitHub.
- **Goal:** Memastikan seluruh check dapat dijalankan konsisten sebelum setiap checkpoint.
- **Acceptance criteria:**
  - Perintah test, typecheck, lint, build, dan pemeriksaan diff terdokumentasi.
  - CI dasar menjalankan check yang sama bila sesuai keputusan ADR; tidak ada layanan berbayar tanpa persetujuan.
  - Laporan verifikasi mencantumkan hasil tiap perintah, bukan klaim umum "lulus".
- **Files/areas affected:** Konfigurasi CI (rencana), `README.md`, `docs/`.
- **Dependencies:** P0.2-02, P0.3-01, P0.4-03.
- **Verification plan:** Jalankan seluruh perintah pada environment development dan pada CI bila diaktifkan; bandingkan hasilnya.
- **Risks:** CI berbeda dengan lokal; check gagal karena versi dependency.
- **Rollback consideration:** Nonaktifkan workflow CI yang bermasalah; kembalikan konfigurasi lewat Git.

### P0.5-02 — Dokumentasi prosedur backup/export/restore

- **Status:** Done (local drill) — 2026-11-26 (Step 8). OD-006 disetujui. Prosedur didokumentasikan di `docs/backup-and-recovery.md`. `./backups/` ditambahkan ke `.gitignore`. Drill restore non-produksi dijalankan pada scratch DB lokal melalui container postgres compose (`jasasaja-os-dev-postgres`); host tidak memiliki `pg_dump`/`psql`, tetapi container memiliki `pg_dump`/`pg_restore`/`psql`/`sha256sum`. **Tidak ada operasi destruktif pada DB dev existing.**
- **Goal:** Menyiapkan prosedur yang dapat diuji sebelum Phase 4 sesuai ADR-008.
- **Acceptance criteria:**
  - Langkah backup `pg_dump`, export JSON/Markdown, dan restore ke database scratch tertulis. ✅ (prosedur `pg_dump -Fc` + restore scratch; export JSON/Markdown aplikasi masih rencana/terpisah dari domain endpoint)
  - Frekuensi, retensi, lokasi penyimpanan, dan penanganan secret backup ditetapkan (OD-006). ✅
  - Restore drill minimal dilakukan sekali pada lingkungan non-production dengan hasil tercatat. ✅
- **Files/areas affected:** `docs/backup-and-recovery.md`, `.gitignore` (entry `/backups/`), `backups/` (gitignored, artefak lokal).
- **Dependencies:** P0.4-02 (Done), ADR-008/OD-006 (Approved).
- **Verification plan (hasil):** Dump `pg_dump -Fc` dibuat; SHA256 dibuat dan `sha256sum -c` OK; restore ke scratch DB `jasasaja_os_restore_drill` exit 0; jumlah record 11 tabel cocok dengan baseline dev; FK public 8, PK public/drizzle 12, 2 partial unique Approved index hadir; scratch DB di-drop setelah verifikasi.
- **Risks:** Backup berisi data sensitif; restore drill hanya memverifikasi struktur/data dev saat ini; export portabel aplikasi (JSON/Markdown endpoint) belum diimplementasikan.
- **Rollback consideration:** Jangan menimpa backup terakhir yang valid; simpan checksum dan versi prosedur.

### P0.5-03 — Exit criteria review dan sign-off Phase 0

- **Status:** Done — Signed off oleh pengguna 2026-11-26. Refresh report: [`phase-0-exit-review-2026-11-26.md`](./phase-0-exit-review-2026-11-26.md). Persetujuan tertulis eksplisit pengguna: "Saya menyetujui Phase 0 exit review 2026-11-26. Adapun risiko/batasan kita kerjakan kemudian. CI remote saya verifikasi. Silakan implementasikan. Browser/a11y/responsive: bisa dilewati dulu. Saya memberikan persetujuan tertulis untuk mulai Phase 1." Batasan diterima/ditunda: CI remote diverifikasi pengguna; browser/a11y/responsive dilewati dulu; risiko/batasan lain ditangani kemudian.
- **Goal:** Memastikan Phase 0 benar-benar selesai sebelum Phase 1 dimulai.
- **Acceptance criteria:**
  - Aplikasi dapat dijalankan lokal hanya dari README.
  - Satu migrasi dan seed dapat dijalankan ulang pada database development.
  - Semua check commands terdokumentasi dan lulus.
  - Semua open decisions yang menghambat Phase 1 sudah ditutup.
  - Pemeriksaan browser/aksesibilitas/responsive yang tidak dapat dijalankan otomatis diberi status jelas, bukan diklaim lulus.
  - Pengguna memberikan persetujuan tertulis untuk masuk Phase 1.
- **Files/areas affected:** `docs/phase-0-exit-report.md` (rencana), status backlog.
- **Dependencies:** Seluruh task P0.1–P0.5 sebelumnya.
- **Verification plan:** Kunjungi checklist exit criteria Roadmap §3 satu per satu; lampirkan bukti hasil perintah dan keputusan.
- **Risks:** Tekanan untuk mulai Phase 1 sebelum exit criteria lengkap; keputusan masih mengambang.
- **Rollback consideration:** Bila sign-off ditunda, Phase 0 tetap terbuka dan Phase 1 tidak dimulai; tidak ada perubahan data yang perlu dibatalkan.

---

## Ringkasan cakupan backlog

| Grup | Jumlah task | Fokus utama |
|---|---|---|
| P0.1 | 3 | Scope freeze, ADR, open decisions, DoD |
| P0.2 | 3 | Repository, README, template kerja |
| P0.3 | 3 | Validasi frontend, kontrak API, skeleton backend |
| P0.4 | 3 | PostgreSQL, migrasi/seed, validasi & otorisasi server |
| P0.5 | 3 | Verifikasi, backup/restore doc, exit gate |

**Total: 15 task.** Tidak ada task yang mengubah frontend, scope MVP, atau dependency tanpa persetujuan ADR terlebih dahulu.
