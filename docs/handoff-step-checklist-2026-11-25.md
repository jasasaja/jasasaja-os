# Checklist Step-by-Step Handoff — JASASAJA Personal OS

- **Tanggal disusun:** 2026-11-25
- **Kode sesi berikutnya:** `[implementasi kode]` — diisi oleh pengguna
- **Tujuan:** dari kondisi repository saat ini menuju aplikasi lokal yang **siap jalan** dan Phase 0 yang benar-benar lulus exit review.
- **Sifat:** panduan kerja berdasarkan dokumen `docs/` yang sudah ada. Bukan persetujuan, bukan izin Phase 1, dan bukan perintah commit/push.
- **Sumber:** `README.md`, `docs/README.md`, `docs/phase-0-backlog.md`, `docs/phase-0-exit-review-2026-11-25.md`, `docs/phase-progress-report-2026-11-25.md`, `docs/adr-status.md`, ADR-001–ADR-009, `docs/architecture-proposal.md`, `docs/repository-structure.md`, `docs/change-control.md`, `docs/api-contract.md`, `docs/task-template.md`, `docs/report-template.md`, `docs/provider-verification.md`.

---

## 0. Aturan main sesi berikutnya

- [ ] **Satu langkah kecil per sesi.** Kerjakan satu nomor checklist, verifikasi, laporkan, lalu **berhenti**. Jangan memulai langkah berikutnya tanpa instruksi.
- [ ] Gunakan `docs/task-template.md` untuk merencanakan dan `docs/report-template.md` untuk melaporkan setiap langkah.
- [ ] Sebelum mengubah apa pun: baca `git status --short`, `git diff --stat`, `README.md`, backlog, ADR register, dan dokumen yang disebut pada langkah terkait.
- [ ] **Gate persetujuan = pernyataan tertulis pengguna.** Rekomendasi asisten atau dokumen perencanaan bukan persetujuan (`docs/change-control.md` line 30).
- [ ] Jangan menutup OD yang masih terbuka kecuali pengguna menyetujuinya secara eksplisit.
- [ ] Jangan menyentuh Neon/produksi. Jangan menjalankan `DROP`, `RESET`, `TRUNCATE`, penghapusan volume, `git reset --hard`, `git checkout -- <file>`, `git clean`, atau stash otomatis.
- [ ] Pertahankan seluruh perubahan pengguna yang sudah ada (baseline 29 entri status). Jangan menimpa `.env.example` dan `metadata.json` yang saat ini terhapus tanpa klarifikasi.
- [ ] Jangan menulis secret, token, kredensial, atau `DATABASE_URL` ke file, log, atau output.
- [ ] Jangan commit/push, buat branch, deploy, atau menambah dependency/layanan berbayar tanpa instruksi eksplisit.
- [ ] Jangan mulai Phase 1 sebelum Phase 0 dinyatakan `PASS` dan pengguna memberi sign-off tertulis.

---

## 1. Snapshot handoff (kondisi saat checklist dibuat)

| Item | Nilai |
|---|---|
| Branch / HEAD | `main` @ `76cede7` (`feat: initialize JASASAJA Personal OS foundation`) |
| Remote | `origin` = GitHub; hanya dibaca, tidak ada fetch/pull/push |
| Working tree | 29 entri: 2 file terhapus (`.env.example`, `metadata.json`), 26 termodifikasi, `docs/` untracked |
| Frontend | Terverifikasi: `npm ci --dry-run`, `npm test` 23/23, `typecheck`, `lint`, `build` exit 0; warning `__dirname` di `vite.config.ts:22:40` |
| Phase 0 | **BLOCKED** — 5 PASS, 5 PARTIAL, 5 FAIL dari 15 task |
| Phase 1–5 | **NOT STARTED** — hanya app shell/scaffold frontend |
| Backend / CI / DB milik repo | `server/`, `api/`, `apps/`, `src/server/`, `.github/`: semuanya **MISSING**; tidak ada compose/env/schema/migrasi/seed |
| Tool DB host | `pg_dump` dan `psql` **MISSING** di host; tersedia di dalam image PostgreSQL |
| Container existing | `jasasaja-postgres` milik `/home/memorygroups/Documents/jasasaja-personal-os`, **bukan** repository ini; port host `5432` sudah terpakai |
| Port frontend | `3000` sudah dipakai proses eksternal; untuk verifikasi startup gunakan port episodik bila perlu |
| Baseline `.docx` | Master Blueprint/PRD/Roadmap v1.1 dinyatakan Approved, tetapi file aslinya tidak ada di repository |

---

## 2. Gate persetujuan yang harus diminta sebelum kode

| Gate | Diperlukan sebelum | Status saat ini | Sumber |
|---|---|---|---|
| **OD-001** — pinning versi dependency | Langkah 3 (pasang Fastify/Zod/Drizzle) | Open | ADR-002, `adr-status.md` §3 |
| **Detail environment lokal** — compose, project/volume, port host | Langkah 4 | Proposed | ADR-003, `repository-structure.md` §3.2 |
| **Penanganan `.env.example`** yang terhapus | Langkah 4 | Perubahan pengguna | `git status` |
| **OD-004** — format konten/export | Langkah 5 (schema konten) dan 8 | Open | ADR-006 |
| **OD-005** — versioning handbook/lesson | Langkah 5 | Open | ADR-007 |
| **OD-008** — timezone default | Langkah 5 (tipe timestamp) | Open | ADR-009 |
| **PRD-Q-Mastered** — aturan status `Mastered` | Sebelum field progres Phase 1 (bukan blokir migrasi dasar) | Open | `adr-status.md` §3 |
| **OD-003** — session/cookie/CSRF/callback/owner mapping | Langkah 6 | Open | ADR-004, `api-contract.md` §4.3 |
| **OD-006** — frekuensi/retensi/lokasi backup | Langkah 8 | Open | ADR-008 |
| **OD-002** — hosting/topologi online | Deployment online saja; **tidak** menghalangi langkah lokal | Open | ADR-005 |

Catatan: OD-007 sudah ditutup sebagai `hybrid`. Jangan menutup OD-002, OD-005, OD-008, atau PRD-Q-Mastered tanpa persetujuan eksplisit.

---

## 3. Checklist utama — urutan dari paling basic sampai siap jalan

### Langkah 0 — Orientasi sesi baru (read-only)

- [ ] Rekam `git status --short`, `git diff --stat`, branch, HEAD.
- [ ] Baca: checklist ini, `docs/phase-0-exit-review-2026-11-25.md`, `docs/phase-progress-report-2026-11-25.md`, `docs/phase-0-backlog.md`, `docs/adr-status.md`, `README.md`.
- [ ] Pastikan 29 entri working tree masih ada dan tidak ada file yang hilang.
- [ ] **Verifikasi:** `git diff --check`; status sebelum = sesudah.
- [ ] **Selesai jika:** konteks terbaca, nol perubahan file. **Berhenti.**

### Langkah 1 — Minta persetujuan OD-001 (keputusan, bukan kode)

- [ ] Minta persetujuan tertulis untuk versi final Fastify, Zod, Drizzle ORM/Kit, Node/TypeScript, dan pinning di lockfile.
- [ ] Catat keputusan di `docs/adr/ADR-002-frontend-and-backend-stack.md` dan `docs/adr-status.md` bila disetujui.
- [ ] **Jangan** memasang dependency sebelum persetujuan.
- [ ] **Verifikasi:** baris status OD-001 berubah hanya setelah pernyataan tertulis pengguna.
- [ ] **Selesai jika:** versi final tercatat. **Berhenti.**

### Langkah 2 — Kunci keputusan schema (OD-004, OD-005, OD-008)

- [ ] Minta persetujuan tertulis untuk format konten/export (OD-004), model versi & transisi status (OD-005), dan timezone/tipe timestamp (OD-008).
- [ ] Tunda field/status `Mastered` sampai PRD-Q-Mastered diputuskan; jangan menebak aturannya.
- [ ] Perbarui ADR terkait dan register hanya untuk cakupan yang disetujui.
- [ ] **Verifikasi:** tidak ada keputusan baru yang saya tetapkan sendiri; konsistensi ADR ↔ register ↔ kontrak API.
- [ ] **Selesai jika:** keputusan tercatat. **Berhenti.**

### Langkah 3 — Skeleton backend + health endpoint (`P0.3-03`)

- [ ] **Prasyarat:** Langkah 0–1 selesai; `docs/api-contract.md` §9.2 dipakai sebagai acuan.
- [ ] Pasang dependency yang sudah disetujui dengan versi terpin; tambahkan script API (mis. `api` / `dev:api`) di `package.json`.
- [ ] Buat area `server/` dengan `src/app.ts`, bootstrap Fastify, prefix `/api`, `GET /api/health`, error envelope `{ error: { code, message, details? } }`, logging tanpa secret, dan batas modul `learning`/`handbook`/`projects`/`shared/core`.
- [ ] Perbarui `README.md` dan backlog sesuai hasil verifikasi.
- [ ] **Verifikasi:** `npm ci`, `npm test` (tetap 23/23), `npm run typecheck`, `npm run lint`, `npm run build`, jalankan API, `curl /api/health` → `{ "data": { "status": "ok" } }`, payload buruk → `400 VALIDATION_ERROR`, `git diff --check`.
- [ ] **Rollback:** kembalikan `package.json`/lockfile dan hapus area `server/` sebelum ada data; jangan hapus file pengguna lain.
- [ ] **Selesai jika:** health merespons dan frontend tetap lulus. **Berhenti.**

### Langkah 4 — Environment & database lokal milik repository (`P0.4-01`)

- [ ] **Prasyarat:** Langkah 3 selesai; detail environment lokal disetujui; klarifikasi `.env.example` yang terhapus.
- [ ] Buat `docker-compose.yml` dengan **nama project dan volume unik** untuk repository ini. Port host **jangan 5432** (sudah dipakai proyek lain); usulkan port alternatif dan minta persetujuan.
- [ ] Buat/kembalikan `.env.example` **hanya nama variabel + placeholder** setelah klarifikasi; jangan menimpa perubahan pengguna tanpa persetujuan.
- [ ] Pastikan `.gitignore` tetap mengabaikan `.env*` dengan pengecualian `!.env.example`.
- [ ] Jalankan compose tanpa menghapus volume; verifikasi koneksi dari API development. **Jangan** memakai container `jasasaja-postgres` yang ada.
- [ ] **Verifikasi:** `docker compose config`, `docker compose up -d`, koneksi DB dari API berhasil, tidak ada secret di diff/log, `git diff --check`.
- [ ] **Rollback:** `docker compose down` (**tanpa `-v`**), revert file konfigurasi.
- [ ] **Selesai jika:** database lokal milik repo dapat diakses API. **Berhenti.**

### Langkah 5 — Schema, migrasi, dan seed (`P0.4-02`)

- [ ] **Prasyarat:** Langkah 2 dan 4 selesai.
- [ ] Buat Drizzle schema + migrasi SQL berversi untuk `shared/core` dan kerangka tiga domain; foreign key, constraint, tipe timestamp UTC sesuai keputusan OD-008.
- [ ] Seed idempotent (dapat dijalankan ulang tanpa duplikat); beri label jelas pada data contoh.
- [ ] Tidak ada cascade delete yang belum ditinjau; jangan menambah field `Mastered`.
- [ ] Simpan dump sebelum migrasi bila database sudah berisi data.
- [ ] **Verifikasi:** jalankan migrasi + seed **dua kali berturut-turut** pada database development milik repo; uji constraint dengan data invalid; `git diff --check`.
- [ ] **Rollback:** restore dump terakhir yang valid atau migrasi `down` bila tersedia; jangan menghapus data tanpa backup.
- [ ] **Selesai jika:** migrasi/seed rerun aman dan integritas dapat dibuktikan. **Berhenti.**

### Langkah 6 — Validasi server & guard owner (`P0.4-03`)

- [ ] **Prasyarat:** Langkah 3–5 selesai dan **OD-003 disetujui tertulis**.
- [ ] Terapkan Zod pada params/query/body di boundary server; kembalikan `400 VALIDATION_ERROR` sesuai kontrak.
- [ ] Implementasikan sesi owner dari mekanisme yang disetujui; protected endpoints menolak request tanpa sesi (`401`) dan identitas bukan owner (`403`/`404` sesuai kebijakan non-disclosure).
- [ ] Jangan pernah mempercayai `ownerId` dari client; protected endpoints fail closed.
- [ ] Ikuti atribut cookie/CSRF yang disetujui; jangan mengarang kebijakan.
- [ ] **Verifikasi:** test payload valid/invalid, request tanpa sesi, sesi invalid, bypass via `ownerId` client, CSRF bila cookie-based; pastikan log tidak memuat secret/token/cookie; `npm test`, `typecheck`, `lint`, `build`, `git diff --check`.
- [ ] **Selesai jika:** seluruh test keamanan benar-benar dijalankan dan lulus. **Berhenti.**

### Langkah 7 — CI minimal (`P0.5-01`)

- [ ] **Prasyarat:** Langkah 3–6 selesai.
- [ ] Buat workflow CI minimal pada `.github/workflows/` yang menjalankan `npm ci`, lint, typecheck, test, build dengan tooling yang sudah ada.
- [ ] Tambahkan service database **hanya bila** test memerlukannya dan setelah ada justifikasi/persetujuan; jangan konfigurasikan secret produksi atau deployment otomatis.
- [ ] Pastikan CI memakai konfigurasi test terisolasi dan tidak pernah mengarah ke Neon/produksi.
- [ ] Perbarui `README.md` dan `docs/README.md` dengan perintah verifikasi lokal.
- [ ] **Verifikasi:** validasi sintaks workflow; jalankan semua check secara lokal; `git diff --check`. Bedakan hasil lokal vs eksekusi remote yang baru terbukti setelah push oleh pengguna.
- [ ] **Selesai jika:** workflow ada, sintaks valid, dan check lokal lulus. **Berhenti.**

### Langkah 8 — Backup, export, restore drill (`P0.5-02`)

- [ ] **Prasyarat:** Langkah 5 selesai; **OD-006 disetujui**; OD-004 bila export konten diperlukan.
- [ ] Tulis `docs/backup-and-recovery.md`: prerequisite, perintah `pg_dump`, format, lokasi di luar file tracked, konvensi penamaan + checksum, retensi, dan penanganan secret.
- [ ] Kecualikan direktori backup dari Git; jangan menimpa backup yang sudah ada.
- [ ] Gunakan `pg_dump` dari dalam container PostgreSQL bila host tidak memilikinya; jangan memasang dependency baru.
- [ ] Lakukan **restore drill nyata** ke database scratch lokal terpisah yang identitasnya eksplisit. Jangan restore ke source database, Neon, atau produksi.
- [ ] Verifikasi skema, status migrasi, jumlah record, foreign key, dan tautan `lesson ↔ handbook ↔ project` yang relevan; catat hasil aktual.
- [ ] **Verifikasi:** dump ada dan tidak kosong, format dikenal tooling restore, restore berhasil, source tidak berubah, tidak ada file backup/secret yang ter-stage, `git diff --check`.
- [ ] **Selesai jika:** restore drill benar-benar berhasil dan tercatat. **Berhenti.**

### Langkah 9 — Ulangi exit review & sign-off (`P0.5-03`)

- [ ] **Prasyarat:** Langkah 1–8 selesai dengan bukti verifikasi.
- [ ] Buat laporan exit review baru dengan tanggal terkini; audit ulang 15 task dan kriteria A–F.
- [ ] Perbarui `docs/phase-0-backlog.md` **hanya** untuk status terverifikasi dan hasil review.
- [ ] Jangan menandai Phase 0 `Done`/`Approved` bila ada kriteria yang gagal atau belum diverifikasi.
- [ ] Minta **persetujuan tertulis pengguna** untuk masuk Phase 1.
- [ ] **Verifikasi:** klasifikasi akhir `PASS`, seluruh OD penghalang Phase 1 ditutup, sign-off tertulis ada.
- [ ] **Selesai jika:** sign-off diberikan. **Berhenti.**

---

## 4. Definisi "siap jalan"

Phase 0 dinyatakan siap jalan hanya jika semua poin ini benar-benar terpenuhi dan diverifikasi:

- [ ] `npm ci && npm run dev` menyajikan frontend lokal (README sesuai kenyataan).
- [ ] Proses API berjalan dan `GET /api/health` merespons `200`.
- [ ] Database lokal milik repository ini dapat diakses dari API; bukan container proyek lain.
- [ ] Migrasi + seed dapat dijalankan ulang dua kali tanpa error atau duplikat.
- [ ] Endpoint domain menolak request tanpa sesi; bypass `ownerId` dari client gagal.
- [ ] Workflow CI ada dan seluruh check lulus lokal.
- [ ] Restore drill berhasil pada database scratch non-produksi dan hasilnya tercatat.
- [ ] Tidak ada secret di file, log, diff, atau workflow.
- [ ] Tidak ada akses Neon/produksi dan tidak ada operasi destruktif.
- [ ] `docs/phase-0-exit-review-*.md` terbaru berklasifikasi `PASS` dan pengguna memberi sign-off tertulis.

**Setelah itu saja** Phase 1 boleh dipertimbangkan. Kecil pertama: satu vertical slice Learning Center sesuai exit criteria README. Ini **tidak** termasuk checklist ini dan tidak dimulai otomatis.

---

## 5. Referensi perintah cepat

| Tujuan | Perintah | Catatan |
|---|---|---|
| Install sesuai lockfile | `npm ci` | Dampak pada `node_modules/` (diabaikan Git), bukan source |
| Test frontend | `npm test` | Baseline 23/23 |
| Typecheck / lint | `npm run typecheck` / `npm run lint` | `lint` saat ini alias `tsc --noEmit` |
| Build | `npm run build` | Output `dist/` (diabaikan Git); warning `__dirname` sudah diketahui |
| Cek diff | `git diff --check` | Wajib di setiap langkah |
| Startup frontend verifikasi | `npx vite --port <port-episodik> --host 127.0.0.1` | Port 3000 dipakai proses eksternal |
| Konfigurasi compose | `docker compose config` | Read-only |
| Jalankan DB lokal | `docker compose up -d` | Jangan `down -v`; jangan hapus volume |
| Backup | `docker compose exec -T <service> pg_dump ...` | Output ke luar path tracked; redaksi credential tidak dicetak |
| Restore drill | tool restore PostgreSQL ke DB scratch eksplisit | Jangan ke source/Neon/produksi |

---

## 6. File yang sudah ada vs yang akan dibuat

**Sudah ada (dipertahankan):** seluruh isi `docs/`, `README.md`, `package.json`, `package-lock.json`, `src/`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `index.html`.

**Akan dibuat sesuai langkah (setelah gate masing-masing):**

| Langkah | File/area baru |
|---|---|
| 3 | `server/`, script API di `package.json`, pembaruan README/backlog |
| 4 | `docker-compose.yml`, `.env.example` (setelah klarifikasi) |
| 5 | `server/` schema/migrations/seed, dokumentasi schema |
| 6 | middleware validasi/guard, test keamanan |
| 7 | `.github/workflows/`, pembaruan docs |
| 8 | `docs/backup-and-recovery.md`, konfigurasi ignore backup |
| 9 | laporan exit review baru, pembaruan status backlog |

---

## 7. Metadata handoff untuk sesi berikutnya

- **Kode sesi:** `[kode]`
- **Baseline:** branch `main`, HEAD `76cede7`, 29 entri `git status --short`
- **Terakhir dikerjakan:** dokumen progres fase dan checklist handoff ini; tidak ada kode/dependency/database yang diubah
- **Tindakan pertama:** Langkah 0 (orientasi read-only), lalu Langkah 1 (minta persetujuan OD-001)
- **Tindakan yang dilarang sebelum waktunya:** memulai Phase 1, memasang dependency, membuat compose/env, menjalankan database, commit/push, atau menutup OD tanpa persetujuan

*Checklist ini adalah peta kerja, bukan bukti bahwa langkah-langkah tersebut sudah dikerjakan. Setiap langkah tetap memerlukan eksekusi, verifikasi, laporan, dan persetujuan sesuai aturan di atas.*
