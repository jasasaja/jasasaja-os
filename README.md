# JASASAJA Personal OS

> Learning & Engineering Operating System untuk penggunaan pribadi.

**Status proyek:** Development planning / Phase 0 --- Scope & Project Foundation\
**Status baseline:** Master Blueprint v1.1, PRD MVP v1.1, dan Development Roadmap v1.1 Approved pada 2026-11-24\
**Versi dokumen acuan:** 1.1 --- Approved 2026-11-24\
**Target pengguna:** Single-user (solo developer)\
**Bahasa utama:** Indonesia\
**Catatan status:** Persetujuan baseline tidak otomatis mengubah status ADR atau memberikan izin implementasi.

## Tentang Proyek

JASASAJA Personal OS adalah sistem kerja personal untuk membantu solo
developer:

1.  Mempelajari teknologi melalui learning path, roadmap, lesson,
    latihan, dan evaluasi.
2.  Mengubah pengetahuan menjadi standar engineering yang dapat
    digunakan kembali.
3.  Menerapkan standar tersebut dalam proyek software melalui tahapan,
    milestone, dan task.

Visi produk adalah membangun lingkungan kerja terpadu yang mengubah
pembelajaran menjadi standar engineering, lalu menerapkan standar
tersebut menjadi hasil proyek yang terukur.

## Scope MVP

MVP dibangun secara bertahap dengan tiga modul inti.

  -----------------------------------------------------------------------
  Modul                               Cakupan utama
  ----------------------------------- -----------------------------------
  **Learning Center**                 Learning paths, roadmap/topics,
                                      lessons, exercises/assessments,
                                      learning progress, dan learning
                                      notes

  **Engineering Handbook**            Kategori dan tahap engineering,
                                      learning guides, SOP, workflows,
                                      templates, prompts, checklists, dan
                                      deliverables

  **Project Workspace**               Projects, project stages,
                                      milestones, tasks, project
                                      documents, dan referensi handbook
  -----------------------------------------------------------------------

Kemampuan pendukung MVP mencakup dashboard aktivitas inti, hubungan
antar-modul, pencarian minimum jika layak, serta backup/export dan
restore yang terdokumentasi.

### Bukan bagian dari MVP

Fitur berikut ditunda sampai kebutuhan nyata terbukti:

-   Productivity suite umum: goals, habits, routines, calendar, dan
    general to-do.
-   AI Assistant internal, model routing, RAG, dan autonomous agent.
-   Advanced knowledge graph atau semantic search.
-   Custom offline synchronization.
-   Multi-tenant, team collaboration, billing, dan public SaaS
    onboarding.
-   Microservices, advanced analytics, dan generic workflow builder.

Ide baru dicatat dalam backlog **Future Ideas** dan tidak otomatis masuk
ke fase aktif.

## Prinsip Pengembangan

-   **Progressive Complexity:** mulai dari alur terkecil; tambahkan
    kompleksitas hanya jika dibutuhkan.
-   **Learn by Building:** keputusan teknis dan hasil AI harus dapat
    dipahami, diperiksa, dan diuji.
-   **Human as Decision Maker:** AI eksternal dapat membantu, tetapi
    bukan dependensi MVP atau pemegang keputusan.
-   **Modular but Integrated:** setiap domain memiliki tanggung jawab
    yang jelas dan terhubung melalui relasi eksplisit.
-   **Cost-Conscious Engineering:** layanan atau API berbayar tidak
    diaktifkan tanpa persetujuan.
-   **Source Transparency:** sumber asli, penjelasan, materi tambahan
    JASASAJA, dan catatan pribadi harus dibedakan.

## Arah Arsitektur

Arah arsitektur yang ditetapkan dalam Master Blueprint adalah **Modular
Monolith** dalam satu aplikasi dan satu repository. Domain awal:

-   `learning`
-   `handbook`
-   `projects`
-   `shared/core`

Microservices dan package terpisah tidak menjadi pilihan awal tanpa
kebutuhan yang jelas. Peta area frontend/backend, batas modul, dan aturan
branch ada di [`docs/repository-structure.md`](./docs/repository-structure.md);
struktur intinya `Accepted`, sedangkan susunan folder backend dan nama
branch masih `Proposed` serta belum diterapkan.

### Stack inti yang disetujui --- detail versi masih terbuka

| Area | Keputusan yang disetujui | Status |
|---|---|---|
| Frontend | React + Vite + TypeScript (dipertahankan) | Accepted |
| Backend | Node.js + TypeScript + Fastify | Accepted |
| Database | PostgreSQL; online memakai Neon Free | Accepted |
| ORM/migrations | Drizzle ORM + Drizzle Kit | Accepted |
| Validation | Zod di server | Accepted |
| Authentication | Google Login untuk satu owner, tanpa registrasi publik | Accepted |
| Content authoring | Rich Text / Block Editor | Accepted |
| Testing | `tsx + node:test` untuk frontend yang ada | Accepted sebagai baseline |
| Version control | Private Git repository; feature branches | Direction |
| AI coding | OpenCode dengan human review | Existing direction |
| Versi dependency final | Pinning sebelum pemasangan/upgrade | Proposed (OD-001) |
| Hosting/detail online | Provider, region, domain selain Neon Free | Proposed (OD-002) |

**Catatan:** stack inti sudah disetujui, tetapi tidak ada dependency baru
yang dipasang dalam task dokumentasi ini. Versi dependency, detail session,
format import/export, hosting, frekuensi backup, dan timezone belum
disetujui; rinciannya ada di `docs/adr-status.md`.

Hindari menambahkan Zustand, TanStack Query, Dexie, PWA framework, atau
adapter AI sebelum use case MVP membuktikan kebutuhannya.

## Rencana Pengembangan

Pengembangan mengikuti urutan fase dalam Development Execution Roadmap:

  -----------------------------------------------------------------------
  Fase                    Fokus                   Kriteria keluar utama
  ----------------------- ----------------------- -----------------------
  0                       Scope & project         Dokumen baseline
                          foundation              ditinjau/disetujui,
                                                  repository dan app
                                                  shell siap, keputusan
                                                  teknis minimum tercatat

  1                       Learning Center         Satu learning path
                          vertical slice          dapat dipelajari sampai
                                                  evaluasi dan progress
                                                  tersimpan

  2                       Engineering Handbook    Satu tahap engineering
                                                  memiliki paket standar
                                                  lengkap dan dapat
                                                  ditemukan/digunakan

  3                       Project Workspace       Satu proyek dapat
                                                  dijalankan dengan
                                                  stages, milestones,
                                                  tasks, dan referensi
                                                  handbook

  4                       Integration & MVP       Alur utama teruji,
                          hardening               backup/restore diuji,
                                                  dokumentasi dan release
                                                  checklist tersedia

  5                       Post-MVP expansion      Fitur lanjutan
                                                  dipertimbangkan
                                                  berdasarkan kebutuhan
                                                  penggunaan MVP
  -----------------------------------------------------------------------

Selesaikan exit criteria suatu fase sebelum memperluas scope ke fase
berikutnya.

## Development Workflow

Gunakan siklus kerja berikut untuk setiap task:

1.  **Orient** --- baca PRD, issue, README, arsitektur, dan Git status.
2.  **Plan** --- pecah pekerjaan menjadi task kecil; identifikasi risiko
    dan file terdampak.
3.  **Build** --- implementasikan satu vertical slice.
4.  **Verify** --- jalankan test, lint, typecheck, build, dan
    pemeriksaan manual yang relevan.
5.  **Review** --- periksa diff, UX, security, dan maintainability.
6.  **Document** --- perbarui README, ADR, dokumentasi konten, atau
    migration bila diperlukan.
7.  **Commit** --- buat checkpoint untuk perubahan yang telah lolos
    pemeriksaan.

Setiap task perlu memiliki outcome, acceptance criteria, file/domain
terdampak, test plan, dan pertimbangan rollback. Gunakan template dan
checklist Definition of Done di [`docs/task-template.md`](./docs/task-template.md);
item yang tidak relevan boleh ditandai `N/A` dengan alasan tertulis.
Laporan hasil memakai [`docs/report-template.md`](./docs/report-template.md).

### Branch dan checkpoint

Satu repository dipakai untuk frontend dan backend. Branch aktif saat ini
adalah `main`; konvensi branch untuk task berikutnya
(`docs/`, `feat/`, `fix/`, `chore/`) masih `Proposed` dan belum diterapkan.
Commit dibuat hanya setelah verifikasi task lolos dan diff ditinjau.
Jangan membuat/menukar branch, commit, push, reset, atau checkout
destruktif saat working tree belum bersih tanpa instruksi eksplisit.
Detail lengkap ada di [`docs/repository-structure.md`](./docs/repository-structure.md).

## Content Governance

Materi Learning Center dan Engineering Handbook harus memiliki status
editorial yang jelas. Konten yang belum lengkap atau belum ditinjau
tidak boleh diperlakukan sebagai standar yang disetujui.

Gunakan label yang membedakan:

-   `Source Material`
-   `Indonesian Explanation`
-   `AI-generated Explanation`
-   `JASASAJA Supplement`
-   `Personal Note`

Untuk materi pembelajaran, catat provenance yang relevan, seperti source
URL, source title/publisher, retrieval date, last reviewed date, content
version, dan verification status.

Untuk handbook, gunakan status seperti `Draft`, `Approved`, dan
`Deprecated` sesuai kebijakan versioning yang ditetapkan. Jangan
mengklaim konten AI sebagai terjemahan sumber apabila sumber aslinya
belum diperiksa. Hormati lisensi, hak cipta, atribusi, dan batas
penggunaan ulang sumber.

## Keamanan, Data, dan Keandalan

Prinsip minimum yang harus diterapkan:

-   Validasi input dan pemeriksaan authorization/ownership dilakukan di
    server.
-   Gunakan versioned migrations, foreign keys, constraints, dan
    transaksi untuk perubahan atomik.
-   Simpan secrets melalui environment atau secret management; jangan
    commit secrets atau memasukkannya ke log.
-   Tinjau kebijakan penghapusan agar relasi data tidak rusak tanpa
    sengaja.
-   Sediakan loading, empty, error, dan success states pada alur utama.
-   Dokumentasikan backup dan export data penting, lalu uji proses
    restore pada lingkungan non-production.
-   Jangan mengaktifkan layanan berbayar/API berbayar tanpa persetujuan.

## Definition of Done

Task belum dianggap selesai hanya karena kode telah ditulis. Minimal:

-   Acceptance criteria terpenuhi.
-   Input tervalidasi dan error handling jelas.
-   Authorization server-side diperiksa untuk data privat.
-   Test relevan ditambahkan/diubah dan lulus.
-   Loading, empty, error, dan success states ditangani bila relevan.
-   Tidak ada secret atau data sensitif di diff/log.
-   Dokumentasi dan migration diperbarui bila diperlukan.
-   Diff ditinjau serta risiko dan cara rollback dipahami.

## Open Decisions dan keputusan yang sudah disetujui

### Sudah disetujui pengguna (2026-11-24)

-   Arsitektur Modular Monolith, satu repository, domain `learning`,
    `handbook`, `projects`, dan `shared/core`.
-   Stack inti React + Vite + TypeScript, Node.js + TypeScript + Fastify,
    PostgreSQL, Drizzle, dan Zod.
-   Database online Neon Free dengan target Rp0/bulan; tanpa layanan
    berbayar tanpa persetujuan.
-   Google Login untuk satu owner, tanpa registrasi publik.
-   Content authoring Rich Text / Block Editor.
-   Deployment hybrid: lokal tetap penuh dan target online (OD-007).

### Masih memerlukan konfirmasi

1.  OD-001 --- versi dependency final/pinning.
2.  OD-002 --- detail hosting/topologi online, region, dan domain; Neon
    Free sebagai database sudah diputuskan.
3.  OD-003 --- detail session/cookie/CSRF setelah Google Login.
4.  OD-004 --- format import/export konten.
5.  OD-005 --- skema versioning handbook dan lesson.
6.  OD-006 --- frekuensi, retensi, dan lokasi backup.
7.  OD-008 --- timezone default aplikasi.
8.  Pertanyaan PRD --- aturan status `Mastered` pada lesson.

Jangan mengasumsikan keputusan di atas sudah final sebelum dicatat dan
disetujui. Izin implementasi Phase 0 juga belum diberikan.

## Dokumentasi Acuan

Dokumen baseline proyek:

-   **Master Blueprint v1.1** --- visi, prinsip, scope, arah arsitektur,
    governance, dan open decisions.
-   **PRD MVP v1.1** --- user journeys, functional requirements,
    non-functional requirements, acceptance criteria, dan Definition of
    Done.
-   **Development Execution Roadmap v1.1** --- urutan fase, work
    packages, exit criteria, dan development loop.

Pastikan ketiga dokumen tetap konsisten. Master Blueprint menjadi
dokumen induk; PRD dan roadmap merupakan dokumen turunannya.

## Setup dan Perintah Proyek

Bagian ini menjelaskan **frontend existing** yang tersedia saat ini.
Backend, database, autentikasi, dan integrasi provider belum
diimplementasikan; lihat **Current Implementation Status** di bawah.

### Prerequisites

-   **Node.js:** repository tidak mendeklarasikan field `engines`.
    Berdasarkan `package-lock.json`, Vite `8.3.8` dan
    `@vitejs/plugin-react` `6.3.0` memerlukan Node
    `^20.19.0 || >=22.12.0`. Gunakan Node 20.19+ (misalnya 20.20.x)
    atau 22.12+. Versi di luar rentang itu belum divalidasi.
-   **npm:** `package-lock.json` tersedia dengan `lockfileVersion: 3`,
    sehingga package manager yang sesuai adalah npm. Instalasi memakai
    `npm ci`, bukan `npm install`, agar hasil sesuai lockfile.
-   **Git:** diperlukan untuk clone repository.
-   **Browser modern:** diperlukan untuk membuka frontend pada port
    lokal.
-   **Tidak diperlukan sekarang:** PostgreSQL/Neon, Docker, kredensial
    Google OAuth, dan variabel environment backend tidak dibutuhkan
    untuk menjalankan frontend existing.

Versi yang terlihat saat verifikasi dokumentasi ini: Node `v20.20.2`
dan npm `10.8.2`. Angka tersebut adalah kondisi lingkungan pemeriksaan,
bukan pinning versi dari repository.

### Installation

```bash
git clone <URL-repository>
cd jasasaja-personal-os
npm ci
```

Ganti `<URL-repository>` dengan URL repository private Anda. README ini
sengaja tidak menebak alamat remote karena URL repository belum
diverifikasi. Jika folder hasil clone bernama lain, sesuaikan perintah
`cd`.

`npm ci` memakai `package-lock.json` yang ada di root repository. Jangan
mengubah lockfile sebagai bagian dari setup frontend.

### Environment Configuration

-   `.env.example` tersedia sebagai **template lokal saja** (nama variabel + placeholder). Salin ke `.env` jika perlu untuk development lokal, lalu sesuaikan nilainya di mesin Anda. **Jangan commit `.env` atau secret nyata.**
-   `.gitignore` sudah mengabaikan `.env*` dan tetap mengizinkan `!.env.example`.
-   Frontend existing saat ini belum membaca `import.meta.env`, `process.env`, atau `VITE_*` di `src/`, `index.html`, atau `vite.config.ts`.
-   Backend skeleton membaca variabel environment seperti `API_PORT`, `API_HOST`, `LOG_LEVEL`, dan `DATABASE_URL` (bila dikonfigurasi). Jangan mencetak nilai secret/connection string ke log atau laporan.

### Local Database (Development)

Repository ini punya `docker-compose.yml` untuk PostgreSQL development lokal milik repository ini.

-   Project name Compose: `jasasaja-os-dev`
-   Service/container: `postgres` / `jasasaja-os-dev-postgres`
-   Volume: `jasasaja_os_dev_pgdata`
-   Port host: `5433` (dipetakan ke `5432` di container)

Perintah dasar:

```bash
docker compose config
docker compose up -d
docker compose ps
```

Catatan penting:
-   **Jangan** menggunakan container `jasasaja-postgres` milik proyek lain.
-   **Jangan** menjalankan `docker compose down -v` kecuali ada instruksi eksplisit, karena itu menghapus volume data lokal.
-   Migration/seed development lokal tersedia (Step 5/P0.4-02): gunakan `npm run db:generate`, `npm run db:migrate`, `npm run db:seed` pada database lokal repo ini.
-   Fondasi auth/session/guard (Step 6/P0.4-03, OD-003) tersedia: session server-side DB, cookie HttpOnly `SameSite=Lax` (Secure env-aware), CSRF/Origin/content-type check untuk mutasi, guard default-protected `/api/**`, `GET /api/health` tetap publik. **E2E Google OAuth dengan kredensial nyata belum diverifikasi**; endpoint auth mengembalikan 503 jika konfigurasi Google/owner belum lengkap.

### Development

```bash
npm run dev
```

Script aktual di `package.json` adalah
`vite --port=3000 --host=0.0.0.0`. Buka `http://localhost:3000`.
Karena Vite dijalankan dengan host `0.0.0.0`, server juga dapat
diakses dari perangkat lain dalam jaringan yang sama melalui alamat IP
host pada port `3000`, bila firewall mengizinkan. Hot module replacement
aktif sesuai `vite.config.ts`.

Hentikan development server dengan `Ctrl+C` di terminal tempat perintah
dijalankan.

### Verification Commands

| Tujuan | Perintah | Sumber aktual | Catatan |
|---|---|---|---|
| Install dependency | `npm ci` | `package-lock.json` (`lockfileVersion: 3`) | Menghasilkan `node_modules/` sesuai lockfile |
| Development server (frontend) | `npm run dev` | `scripts.dev` = `vite --port=3000 --host=0.0.0.0` | URL lokal `http://localhost:3000` |
| Development server (API skeleton) | `npm run dev:api` | `scripts.dev:api` = `tsx watch --env-file-if-exists=.env server/src/server.ts` | Default `API_PORT=3001`, `API_HOST=0.0.0.0`; endpoint health: `GET /api/health` |
| Jalankan API (sekali jalan) | `npm run api` | `scripts.api` = `tsx --env-file-if-exists=.env server/src/server.ts` | Untuk startup sederhana tanpa watch |
| Production build (frontend) | `npm run build` | `scripts.build` = `vite build` | Output ke `dist/` |
| Typecheck | `npm run typecheck` | `scripts.typecheck` = `tsc --noEmit && tsc --noEmit -p server/tsconfig.json` | Mengecek frontend + server skeleton |
| Lint | `npm run lint` | `scripts.lint` = `tsc --noEmit && tsc --noEmit -p server/tsconfig.json` | Belum ada ESLint; skrip ini alias typecheck |
| Test | `npm test` | `scripts.test` = `tsx --test src/**/*.test.ts` | Test frontend existing; belum ada test backend |
| Generate migration (Drizzle) | `npm run db:generate` | `scripts.db:generate` = `drizzle-kit generate` | Membutuhkan `DATABASE_URL`; gunakan DB lokal repo ini |
| Apply migration (Drizzle) | `npm run db:migrate` | `scripts.db:migrate` = `drizzle-kit migrate` | Jalankan pada DB lokal development repo ini |
| Seed development data | `npm run db:seed` | `scripts.db:seed` = `tsx --env-file-if-exists=.env server/src/db/seed/seed.ts` | Idempoten; data contoh berlabel `[SEED]`, bukan data produksi |
| Preview build | `npm run preview` | `scripts.preview` = `vite preview` | Jalankan setelah build; port default Vite tidak ditetapkan repository |

Belum ada script auth/session/domain endpoint di `package.json`. Jangan menganggap fitur autentikasi, endpoint domain, atau integrasi Neon sudah tersedia.

Script `npm run clean` memang ada, tetapi isinya
`rm -rf dist server.js` sehingga menghapus output build. Script ini
tidak termasuk alur verifikasi normal.

### CI Dasar (GitHub Actions, Rp0)

- Workflow: `.github/workflows/ci.yml`
- Trigger: `push`/`pull_request` ke `main`, dan `workflow_dispatch`.
- Langkah: `npm ci`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` pada Node 20 (ubuntu-latest).
- **Status:** file workflow dibuat dan perintah sudah lulus lokal; **eksekusi CI remote belum diverifikasi** karena belum ada commit/push ke GitHub.

### Current Implementation Status

-   **Frontend existing** berbasis React + Vite + TypeScript masih aktif dan menjadi baseline yang harus tetap lulus verifikasi.
-   **Backend skeleton (Step 3 / P0.3-03)** sudah ada secara minimal: Fastify + TypeScript, prefix `/api`, `GET /api/health`, error envelope standar, centralized error handling, logging dengan redaksi field sensitif dasar, dan batas modul `learning`/`handbook`/`projects`/`shared/core`.
-   **Local DB development (Step 4 / P0.4-01)** sudah disiapkan: `docker-compose.yml` untuk PostgreSQL lokal repo ini (`jasasaja-os-dev`, port host `5433`, volume `jasasaja_os_dev_pgdata`), `.env.example` template, dan modul koneksi DB API yang bisa diuji.
-   **Schema/migration/seed (Step 5 / P0.4-02)** sudah ada secara minimal: Drizzle schema/config, migrasi awal, dan seed idempoten sesuai keputusan A1/B1/C2/D1. DB lokal repo sudah bisa dimigrasi dan diseed.
-   **Auth guard/session foundation (Step 6 / P0.4-03)** sudah ada secara minimal: tabel `sessions`, guard `/api/**`, CSRF/origin checks, `/api/auth/google/start|callback|me|logout`, dan `GET /api/health` tetap publik. Google OAuth E2E dengan kredensial nyata belum diverifikasi.
-   **CI dasar (Step 7 / P0.5-01)** sudah disiapkan: `.github/workflows/ci.yml` menjalankan `npm ci/test/typecheck/lint/build` (Node 20, Rp0). Eksekusi remote belum diverifikasi karena belum ada commit/push.
-   **Belum tersedia:** endpoint domain, integrasi Neon, backup/restore drill, dan deployment. Jangan menganggap fitur-fitur ini sudah aktif.
-   Dokumentasi arsitektur dan keputusan tetap mengacu ke folder `docs/`, terutama `docs/architecture-proposal.md`, `docs/repository-structure.md`, `docs/adr/`, dan `docs/adr-status.md`.
-   Working tree memiliki perubahan uncommitted pengguna. Jangan melakukan reset, checkout destruktif, commit, atau push sebagai bagian dari setup.

## Kontribusi dan Perubahan

Untuk saat ini proyek ditujukan bagi penggunaan personal oleh satu solo
developer. Perubahan scope MVP harus disertai alasan, dampak, dan
persetujuan eksplisit. Keputusan arsitektur penting dicatat sebagai ADR
atau decision register. Perubahan destruktif, deployment production,
penghapusan data, dan pengeluaran biaya memerlukan persetujuan
eksplisit.

Aturan lengkap ada di [`docs/change-control.md`](./docs/change-control.md).
Ringkasannya: ide baru masuk **Future Ideas** dengan label
`Must/Should/Could/Won't now` sebelum dipertimbangkan; perubahan scope,
biaya, deployment produksi, penghapusan data, dan dependency/ADR tidak
dilakukan diam-diam. Persetujuan arsitektur tidak otomatis menjadi izin
implementasi atau izin biaya. Setiap slice memakai template dan checklist
DoD pada [`docs/task-template.md`](./docs/task-template.md).

------------------------------------------------------------------------

*Dokumen ini berbasis Master Blueprint v1.1, PRD MVP v1.1, dan
Development Execution Roadmap v1.1. Bagian setup kini mencerminkan
kondisi frontend aktual; status proyek tetap mengikuti Phase 0 sampai
ada izin dan implementasi lanjutan.*
