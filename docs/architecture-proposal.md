# Proposal Arsitektur Teknis — JASASAJA Personal OS

- **Status:** Approved untuk keputusan inti yang dikonfirmasi pengguna pada 2026-11-24; detail teknis tertentu tetap **Proposed**
- **Tanggal:** 2026-11-24
- **Sumber:** Master Blueprint v1.1, PRD MVP v1.1, Development Roadmap v1.1 (Approved), brief Phase 0.1/0.2, dan persetujuan keputusan 2026-11-24.
- **Batasan:** Perencanaan dan dokumentasi saja. Tidak ada backend, database, dependency, atau perubahan frontend yang dibuat saat dokumen ini diperbarui. Tidak ada akun/layanan yang dibuat dan tidak ada layanan berbayar yang diaktifkan. Scope MVP tidak diubah.

## 1. Ringkasan keputusan

| Area | Keputusan | Status |
|---|---|---|
| Frontend | Pertahankan React + Vite + TypeScript yang sudah ada | **Accepted** — dikonfirmasi pengguna |
| Backend API | Satu API HTTP JSON TypeScript dalam repository yang sama; Node.js + Fastify | **Accepted** |
| Arsitektur | Modular Monolith; domain `learning`, `handbook`, `projects`, `shared/core` | **Accepted** untuk intinya; rincian internal **Proposed** |
| Database | PostgreSQL; online memakai Neon Free | **Accepted** |
| Biaya | Target Rp0/bulan; tanpa layanan berbayar tanpa persetujuan | **Accepted** |
| ORM & migrasi | Drizzle ORM + Drizzle Kit | **Accepted** |
| Validasi | Zod di server; berbagi schema murni hanya jika terbukti perlu | **Accepted** |
| Autentikasi | Google Login untuk satu owner, tanpa registrasi publik | **Accepted**; detail session **Proposed** |
| Otorisasi | Guard owner di server untuk semua endpoint domain; bukan multi-tenant | **Accepted sebagai requirement** |
| Authoring konten | Rich Text / Block Editor | **Accepted**; format import **Proposed** |
| Lingkungan lokal | Vite `:3000` + API `:3001` + proxy `/api` + PostgreSQL lokal | **Proposed** pada detail |
| Deployment online | Hybrid: lokal tetap penuh, target online dengan Neon Free | **Accepted**; hosting detail **Proposed** |
| Environment & secrets | Environment variable / secret manager; `.env*` sudah diabaikan Git | **Proposed** pada detail |
| Backup & recovery | `pg_dump` + export portabel + restore drill non-produksi | **Proposed** (OD-006) |

Keputusan yang sudah dikonfirmasi pengguna dan dipertahankan apa adanya: arsitektur **Modular Monolith**, **satu repository**, **satu owner**, **tanpa registrasi publik**, **tanpa multi-tenant**, **tanpa offline synchronization pada MVP**, **tanpa AI Assistant internal pada MVP**, **tanpa migrasi framework tanpa ADR dan persetujuan**, stack inti **React + Vite + TypeScript + Fastify + PostgreSQL + Drizzle + Zod**, **Google Login**, **Rich Text / Block Editor**, **deployment hybrid**, **Neon Free**, dan **Rp0/bulan**.

Yang belum disetujui dan tetap terbuka: versi dependency final, detail environment lokal, detail session/cookie/CSRF, format import/export, skema versioning, frekuensi/retensi backup, topologi/hosting online, dan timezone default. Izin implementasi Phase 0 juga belum diberikan.

## 2. Kondisi repository yang menjadi baseline

Hasil inspeksi langsung pada working tree:

- `HEAD` berada di `76cede7 feat: initialize JASASAJA Personal OS foundation`.
- Working tree **tidak bersih**: 2 file terhapus (`.env.example`, `metadata.json`) dan 25 file termodifikasi saat inspeksi awal; setelah P0.1-01, `README.md` juga berubah. Perubahan tersebut dipertahankan; tidak ada reset/checkout.
- `package.json` memakai name `jasasaja-personal-os`, `type: module`, scripts `dev`, `build`, `preview`, `clean`, `lint`, `typecheck`, `test`. Dependency inti yang terpasang tetap menjadi baseline validasi; belum ada dependency backend/ORM/DB client yang dipasang.
- Test: 23 test dalam 5 file (`tokens.test.ts`, `dashboardActivity.test.ts`, `focusTrap.test.ts`, `navigation.test.ts`, `settings.test.ts`). Semua lolos pada stabilisasi sebelumnya; typecheck, lint, dan build juga lolos.
- Routing saat ini sepenuhnya sisi klien: 5 route `dashboard`, `learning`, `handbook`, `projects`, `settings` di `src/utils/navigation.ts`. Belum ada API call, auth, atau state manager global.
- Preferensi workspace disimpan di `localStorage` dengan kunci `jasasaja.personal-os.settings.v1`. Ini bersifat sementara dan **tidak** diubah menjadi data server tanpa keputusan terpisah.
- `tsconfig.json` strict, `noEmit`, alias `@/*`. `vite.config.ts` memuat plugin React, Tailwind, dan plugin copy aset; warning `__dirname` sudah ada sebelumnya dan tidak menggagalkan build.
- `.gitignore` sudah mengabaikan `.env*` (kecuali `!.env.example`) dan `.aistudio/`. File `.env.example` saat ini **tidak ada**, sehingga template environment perlu diputuskan ulang sebelum implementasi.

Kesimpulan inspeksi: repository sesuai sebagai frontend foundation. Belum ada jejak backend/database/API yang perlu dipertahankan atau dimigrasikan, sehingga Phase 0 dapat dimulai dari batas yang jelas setelah izin diberikan.

## 3. Detail keputusan

### 3.1 Frontend React + Vite + TypeScript

Pertahankan stack dan struktur yang sudah lolos verifikasi. Versi yang terpasang menjadi baseline, tetapi pinning versi final tetap OD-001. Penambahan Zustand, TanStack Query, Dexie, PWA framework, atau AI adapter **tidak** dilakukan sampai use case MVP membuktikan kebutuhannya.

Yang akan berubah secara bertahap pada fase berikutnya (bukan sekarang): penggantian data contoh di dashboard dengan data API, penambahan API client bertipe, dan pengelolaan state async minimal. Kontrak komponen yang sudah ada tidak diubah dalam perencanaan ini.

### 3.2 Backend API yang kompatibel dengan frontend saat ini

Keputusan: satu proses API HTTP JSON berbasis **Node.js + TypeScript + Fastify**, ditempatkan di satu repository yang sama dengan frontend. Express dan Hono tetap tercatat sebagai alternatif historis, bukan pilihan aktif. Belum ada dependency backend yang dipasang.

Kontrak awal yang akan dipakai saat implementasi:

- Semua endpoint berada di bawah prefix **`/api`**, sehingga tidak bertabrakan dengan 5 route SPA yang sudah ada.
- Respons error seragam: `{ error: { code, message, details? } }` dengan `message` berbahasa Indonesia untuk teks yang ditampilkan ke pengguna; identifier teknis tetap Bahasa Inggris.
- Validasi request di server dengan Zod sebelum masuk ke layer domain.
- Health check `GET /api/health` untuk deployment dan lokal.
- Frontend tetap bisa dijalankan sendiri tanpa backend selama Phase 0; integrasi baru dilakukan pada vertical slice Phase 1.

### 3.3 Modular Monolith

Satu aplikasi, satu repository, satu database. Batas modul mengikuti Blueprint: `learning`, `handbook`, `projects`, `shared/core`. Tiap modul memiliki folder sendiri untuk endpoint, service, repository, dan schema; modul `shared/core` memuat konfigurasi, error, logging, dan primitive lintas modul. Relasi antar-modul memakai ID eksplisit, bukan impor langsung ke lapisan internal modul lain. Microservices dan package terpisah tidak diperkenalkan.

### 3.4 PostgreSQL dan Neon Free

PostgreSQL dipertahankan sebagai database. Alasan: integritas relasional kuat (foreign key, constraint, transaksi) sesuai NFR-07, dukungan migrasi dan backup matang. Untuk online, pengguna menyetujui **Neon Free** dengan target **Rp0/bulan**. development lokal tetap direncanakan, tetapi detail Docker Compose/env belum disetujui. Tidak ada akun atau project database yang dibuat; kuota Neon wajib diverifikasi ulang sebelum aktivasi. Rincian: [`provider-verification.md`](./provider-verification.md).

### 3.5 ORM dan migration tooling

**Drizzle ORM + Drizzle Kit** disetujui: TypeScript-first, SQL terlihat jelas, migration dapat disimpan sebagai file SQL yang dapat ditinjau, dan runtime ringan. Prisma dan SQL manual tetap tercatat sebagai alternatif historis. Migrasi harus berversi, dapat dijalankan ulang dengan aman, dan tidak boleh menghapus data tanpa konfirmasi.

### 3.6 Server-side validation

Zod disetujui sebagai schema validator di server untuk body, query, dan parameter. Frontend boleh memakai schema murni yang sama hanya bila tidak menambah coupling paket; untuk sementara validasi frontend tetap lokal (`validateWorkspaceSettings`) dan validasi server menjadi sumber kebenaran.

### 3.7 Autentikasi Google Login untuk single-owner

Keputusan pengguna: **Google Login** untuk memverifikasi identitas owner, satu akun owner, dan **tanpa endpoint registrasi publik**. Backend memetakan identitas Google yang disetujui ke owner tunggal, lalu membuat sesi aplikasi. Detail mekanisme session, atribut cookie (`HttpOnly`/`Secure`/`SameSite`), dan CSRF belum disetujui serta tetap Proposed.

Usulan lama berupa password hash (Argon2id/bcrypt) sudah digantikan dan tidak menjadi acuan implementasi; alasannya adalah keputusan eksplisit pengguna. Magic link/OTP dan provider identitas lain tidak dipilih. Detail lengkap dan riwayat ada di [`ADR-004`](./adr/ADR-004-authentication-and-authorization.md).

### 3.8 Server-side authorization

Walaupun hanya ada satu pemilik, otorisasi tetap diperiksa di server: middleware session + guard owner diterapkan pada seluruh endpoint domain; query domain dibatasi pada scope owner. Tidak ada tabel tenant, role kompleks, atau invitation flow.

### 3.9 Local development environment

Alur yang direncanakan (detail belum disetujui):

1. `npm ci` untuk frontend; frontend berjalan di `http://localhost:3000` (script `dev` sudah ada).
2. API berjalan di port terpisah (usulan `:3001`) dengan konfigurasi dari environment lokal.
3. Vite proxy meneruskan `/api` ke API agar tidak memerlukan CORS pada development.
4. PostgreSQL development dijalankan lokal; kredensial hanya berada di file environment yang diabaikan Git.
5. Perintah `migrate`, `seed`, `test`, `typecheck`, `lint`, dan `build` didokumentasikan di README setelah detail stack disetujui.

File environment template perlu diputuskan ulang karena `.env.example` saat ini terhapus; `.gitignore` sudah mendukung `!.env.example` bila template ingin dikembalikan. Variabel terkait Google Login akan menggantikan variabel password lama, tetapi nama final belum disetujui.

### 3.10 Online deployment topology

Keputusan yang mengikat: model **hybrid** — lokal tetap didukung penuh, target online disiapkan tanpa menghilangkan kemampuan lokal; database online memakai **Neon Free** dengan target Rp0/bulan. Provider hosting, region, domain, dan topologi frontend/API masih open OD-002. Opsi yang tercatat (reverse proxy, static site gratis, PaaS) belum dipilih. Tidak ada akun, domain, atau layanan yang dibuat.

### 3.11 Environment variables dan secrets

Variabel yang dipertimbangkan (nama final menunggu persetujuan):

| Variabel | Fungsi | Catatan |
|---|---|---|
| `DATABASE_URL` | Koneksi PostgreSQL | Wajib untuk API; tidak pernah dikirim ke frontend |
| `API_PORT` | Port proses API | Usulan lokal `:3001` |
| Konfigurasi client Google Login | Autentikasi owner | Menggantikan `OWNER_PASSWORD_HASH`; nama final belum disetujui |
| `APP_BASE_URL` | URL publik untuk cookie dan redirect | Berbeda lokal/online |
| `CORS_ORIGIN` | Asal frontend bila tidak proxy | Kosong bila same-origin |
| `TZ` / `APP_TIMEZONE` | Zona waktu aplikasi | Lihat ADR-009, masih Proposed |
| `BACKUP_DIR` | Lokasi dump sementara | Hanya bila backup lokal dipakai |

Aturan: secret hanya melalui environment/secret manager, tidak di-commit, tidak masuk log atau error response. Frontend hanya boleh menerima variabel yang aman untuk publik (awalan `VITE_`). `.env*` sudah diabaikan Git; pola ini dipertahankan.

### 3.12 Backup, export, dan restore

Tiga lapis yang dipertimbangkan:

1. **Database:** `pg_dump` logical backup portabel; frekuensi/retensi/lokasi masih OD-006.
2. **Export aplikasi:** endpoint authorized yang mengekspor konten domain ke format portabel yang ditetapkan ADR-006/OD-004; belum ada format final yang disetujui.
3. **Restore drill:** restore ke database non-produksi/scratch dan verifikasi jumlah record serta tautan lintas modul sebelum aplikasi dipakai sebagai satu-satunya tempat penyimpanan.

Karena Neon Free tidak menyediakan scheduled snapshot pada Free, lapisan portabel tetap penting. Layanan backup berbayar tidak diaktifkan tanpa persetujuan. Restore penuh tetap menjadi exit criteria Phase 4; Phase 0 hanya menyiapkan prosedur terdokumentasi.

## 4. Perbandingan opsi yang relevan

Skala: Kompleksitas/Biaya/Lock-in — **R** = rendah, **S** = sedang, **T** = tinggi.

### 4.1 Frontend

| Opsi | Status | Catatan |
|---|---|---|
| Pertahankan React + Vite + TS | **Accepted** | Sudah lolos 23 test, typecheck, lint, build |
| Migrasi ke Next.js / framework lain | **Tidak dipilih** | Melanggar larangan migrasi tanpa ADR dan persetujuan |

### 4.2 Backend API

| Opsi | Status | Catatan |
|---|---|---|
| Node + TS + Fastify | **Accepted** | Satu bahasa dengan frontend; belum dipasang |
| Node + TS + Express / Hono | **Tidak dipilih** | Arsip alternatif |
| BaaS/serverless | **Rejected** untuk MVP | Lock-in dan batas free tier |

### 4.3 Database

| Opsi | Status | Catatan |
|---|---|---|
| PostgreSQL + Drizzle + Neon Free | **Accepted** | Integritas data kuat; Rp0/bulan |
| Prisma / SQL manual | **Tidak dipilih** | Arsip alternatif |
| SQLite / MySQL | **Rejected** | Bukan arah Blueprint / lemah untuk target online |

### 4.4 Autentikasi

| Opsi | Status | Catatan |
|---|---|---|
| Google Login + owner tunggal | **Accepted** | Tanpa registrasi publik; detail session Proposed |
| Password hash + cookie session | **Rejected** | Digantikan Google Login |
| Magic link/OTP email | **Rejected** | Provider eksternal tambahan |
| Tanpa autentikasi | **Rejected** | Tidak kompatibel dengan target online |

### 4.5 Hosting & deployment

| Opsi | Status | Catatan |
|---|---|---|
| Hybrid + Neon Free | **Accepted** | Lokal penuh + target online Rp0 |
| Reverse proxy / PaaS detail | **Proposed** | OD-002 belum ditutup |
| Serverless penuh / hanya lokal | **Rejected** | Bertentangan dengan scope atau menambah kompleksitas |

## 5. Kompatibilitas dengan frontend yang sudah ada

| Fakta frontend | Implikasi arsitektur |
|---|---|
| Route SPA `/dashboard`, `/learning`, `/handbook`, `/projects`, `/settings` | API memakai prefix `/api`; tidak ada perubahan route yang disetujui |
| `history.pushState` + `popstate`, tanpa router library | Backend tidak perlu SSR; cukup fallthrough ke `index.html` |
| Belum ada API client atau state manager global | Tambahkan wrapper `fetch` bertipe secara minimal pada Phase 1; hindari dependency baru |
| Settings di `localStorage` | Tidak dipindahkan ke server tanpa ADR/keputusan terpisah |
| Copy antarmuka Bahasa Indonesia, `lang="id"` | Error message user-facing berbahasa Indonesia |
| Warning `__dirname` di `vite.config.ts` | Dipertahankan; dicatat sebagai risiko kecil |

## 6. Yang tidak berubah

- Tiga modul inti dan daftar non-goal MVP dari Blueprint/PRD tidak diubah.
- Tidak ada multi-tenant, tim, billing, AI Assistant internal, RAG, offline sync, kalender, habit, atau general to-do.
- Tidak ada dependency baru yang dipasang dalam task dokumentasi ini, meskipun stack inti sudah disetujui.
- Tidak ada perubahan pada `package.json`, `package-lock.json`, file frontend, atau perintah Git yang destruktif.

## 7. Approved decisions dan open decisions

### Sudah disetujui pengguna (2026-11-24)

1. Arsitektur Modular Monolith, satu repository, domain `learning`/`handbook`/`projects`/`shared/core`.
2. Stack inti: React + Vite + TypeScript, Node.js + TypeScript + Fastify, PostgreSQL, Drizzle, Zod.
3. Database online Neon Free dengan target Rp0/bulan; tidak ada layanan berbayar tanpa persetujuan.
4. Autentikasi Google Login untuk satu owner, tanpa registrasi publik.
5. Authoring Rich Text / Block Editor.
6. Deployment hybrid: lokal penuh + target online.

### Masih memerlukan konfirmasi

1. OD-001 — versi dependency final/pinning.
2. OD-002 — detail hosting/topologi online, region, dan domain (Neon Free sudah diputuskan).
3. OD-003 — detail session/cookie/CSRF setelah Google Login.
4. OD-004 — format import/export konten.
5. OD-005 — skema versioning handbook dan lesson.
6. OD-006 — frekuensi, retensi, dan lokasi backup.
7. OD-008 — timezone default aplikasi.
8. PRD §13 — aturan status `Mastered`.

Izin implementasi Phase 0 **belum** diberikan. Persetujuan keputusan arsitektur tidak otomatis menjadi izin implementasi. Register lengkap ada di [`adr-status.md`](./adr-status.md); hasil verifikasi provider tanpa aktivasi ada di [`provider-verification.md`](./provider-verification.md). Setelah izin diberikan, pekerjaan teknis dilakukan satu task kecil pada satu waktu dengan verifikasi sebelum melanjutkan.
