# Struktur Repository dan Branch Strategy

- **Status:** Dokumentasi P0.2-01 selesai — struktur inti `Accepted` (ADR-001); susunan folder backend, kontrak internal, dan konvensi branch tetap `Proposed`.
- **Tanggal:** 2026-11-25
- **Sumber:** ADR-001, backlog `P0.2-01`, Development Roadmap v1.1 §3/§8/§9, Master Blueprint v1.1 §8/§12, dan inspeksi repository pada 2026-11-24.
- **Batasan:** Dokumen ini **hanya merencanakan dan mendokumentasikan**. Tidak ada folder baru, branch baru, commit, push, rename massal, perubahan source code, dependency, package/lockfile, konfigurasi aplikasi, atau database yang dibuat pada task ini. Tidak ada reset/checkout destruktif. Persetujuan arsitektur bukan izin implementasi Phase 0.

## 1. Keputusan dan status

| Hal | Status | Keterangan |
|---|---|---|
| Satu repository untuk frontend dan backend | **Accepted** | ADR-001; dikonfirmasi pengguna |
| Satu codebase, bukan multi-repo/package terpisah | **Accepted sebagai konsekuensi** | Tidak ada workspaces/independent package pada MVP |
| Domain `learning`, `handbook`, `projects`, `shared/core` | **Accepted** | ADR-001 / Blueprint §8 |
| Modul bukan microservices dan bukan service terpisah | **Accepted** | ADR-001 |
| Susunan folder backend dan kontrak antar-modul | **Proposed** | Perlu persetujuan sebelum dibuat |
| Konvensi nama branch | **Proposed** | Ditulis sebagai panduan, belum diterapkan |
| `AGENTS.md` | **Proposed — belum dibuat** | Roadmap §3 menyebutkan sebagai deliverable Phase 0; tidak dibuat pada P0.2-01 |
| Izin implementasi Phase 0 | **Belum diberikan** | Persetujuan dokumentasi tidak otomatis menjadi izin kode/deploy |

## 2. Kondisi repository yang menjadi baseline

Inspeksi pada 2026-11-25:

- Branch aktif: `main`. Remote `origin/main` terlihat, tetapi tidak ada operasi fetch/pull/push pada task ini.
- `HEAD`: `76cede7 feat: initialize JASASAJA Personal OS foundation`.
- Working tree **tidak bersih**: 2 file terhapus (`.env.example`, `metadata.json`), 26 file tracked termodifikasi, dan direktori `docs/` untracked. Seluruhnya dipertahankan apa adanya.
- Root berisi `README.md`, `index.html`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `src/`, `docs/`, serta artefak `dist/` dan `node_modules/` yang diabaikan Git.
- `package.json`: `private: true`, `type: module`, satu nama paket `jasasaja-personal-os`, scripts `dev`, `build`, `preview`, `clean`, `lint`, `typecheck`, `test`. Tidak ada field `workspaces`.
- Alias TypeScript `@/*` dan alias Vite `@` keduanya menunjuk ke root repository. Jangan mengubah keduanya tanpa ADR/keputusan terpisah.
- `vite.config.ts` memiliki plugin yang menyalin `src/assets/` ke `dist/src/assets/` saat build bila folder itu ada. Folder `src/assets/` saat ini belum ada; jangan menghapus plugin ini.
- Belum ada direktori backend (`server/`, `api/`, atau sejenisnya) dan belum ada dependency backend/ORM/database client.

Kesimpulan: repository sudah sesuai sebagai frontend foundation. P0.2-01 hanya menetapkan peta area dan aturan kerja di atas kertas; tidak ada reorganisasi fisik.

## 3. Peta area repository

### 3.1 Area frontend — existing, `Accepted`

Area frontend adalah aplikasi React + Vite + TypeScript yang sudah lolos verifikasi sebelumnya.

| Area | Path saat ini | Catatan |
|---|---|---|
| Entry point | `src/main.tsx`, `src/App.tsx`, `src/index.css` | Dipertahankan |
| Shell & navigasi | `src/components/layout/` | `AppShell`, `Sidebar`, `Breadcrumb`, `MobileNavDrawer`, `UserProfileMenu`, `PageHeader` |
| UI primitive | `src/components/ui/` | `Button`, `Card`, `Dialog`, `Tabs`, state views, dll. |
| View/route | `src/components/views/` | Dashboard, Learning, Handbook, Projects, Settings, NotFound; saat ini masih scaffold |
| Design tokens | `src/design-system/` | `tokens.ts` + test |
| Tipe & util | `src/types/`, `src/utils/` | Termasuk test util |
| Aset | `src/assets/` (opsional, belum ada) | Plugin Vite menyiapkan penyalinan bila folder dibuat |

Route SPA saat ini: `/dashboard`, `/learning`, `/handbook`, `/projects`, `/settings`. Kontrak API akan memakai prefix `/api` agar tidak bertabrakan; detail ini tercatat di ADR-002 dan tidak diubah di sini.

### 3.2 Area backend — `Proposed`, belum dibuat

Backend direncanakan sebagai **satu proses HTTP JSON TypeScript** dalam repository yang sama. Nama folder, file, dan susunan di bawah adalah **usulan**, bukan keputusan final dan bukan struktur aktual.

```text
jasasaja-os/                         # satu repository, satu package.json
├─ README.md
├─ package.json                      # satu package; skrip backend ditambahkan nanti
├─ tsconfig.json                     # alias @/* -> root
├─ vite.config.ts                    # frontend + copy-asset plugin
├─ index.html
├─ .gitignore
├─ docs/                             # ADR, backlog, change control, template task
├─ src/                              # frontend React (existing, Accepted)
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ index.css
│  ├─ components/
│  │  ├─ layout/
│  │  ├─ ui/
│  │  └─ views/
│  ├─ design-system/
│  ├─ types/
│  ├─ utils/
│  └─ assets/                        # opsional; belum ada
└─ server/                           # PROPOSED — belum dibuat
   ├─ src/
   │  ├─ app.ts                      # bootstrap Fastify, prefix /api
   │  └─ modules/
   │     ├─ learning/
   │     ├─ handbook/
   │     ├─ projects/
   │     └─ shared/
   │        └─ core/
   ├─ migrations/                    # SQL berversi (Drizzle Kit)
   └─ test/                          # test API/kontrak bila diperlukan
```

Nama `server/` dipilih dalam usulan ini sebagai penanda area backend. Alternatif seperti `api/` tidak dibuat dan tidak ditutup secara eksplisit; bila nama final berubah, perubahan tetap tercatat sebagai revisi dokumentasi, bukan reorganisasi diam-diam.

### 3.3 Batas modul domain — `Accepted` pada prinsip, layout `Proposed`

| Modul | Tanggung jawab | Batas yang dijaga |
|---|---|---|
| `learning` | Lesson, kategori, provenance, status/verifikasi, progres dasar | Tidak mengimpor file internal `handbook` atau `projects` |
| `handbook` | Item standar, Purpose/When to use/Procedure/Checklist/Deliverables, versi dan status editorial | Tidak mengimpor file internal modul lain |
| `projects` | Project, milestone, task, relasi ke materi | Referensi ke `learning`/`handbook` memakai ID eksplisit |
| `shared/core` | Konfigurasi, error envelope, logging, koneksi database, guard owner, utilitas lintas modul | Boleh dipakai semua modul; bukan tempat logika domain |

Aturan batas modul (dari ADR-001, tetap dijaga):

1. Setiap modul mengekspos kontrak publik minimal, misalnya `index.ts` pada usulan struktur.
2. Modul lain hanya mengimpor kontrak publik atau `shared/core`, bukan file `service.ts`, `repository.ts`, atau `schema.ts` internal.
3. Relasi lintas modul memakai referensi ID eksplisit, bukan coupling objek/entity langsung.
4. Satu proses API melayani semua modul; tidak ada service terpisah, package terpisah, atau database terpisah per modul.
5. Perubahan batas modul yang berdampak arsitektur wajib melalui ADR/decision register sesuai `docs/change-control.md`.

Struktur frontend per-domain (misalnya pengelompokan UI `learning`/`handbook`/`projects`) belum diputuskan dan tidak dibuat pada P0.2-01. Saat ini frontend tetap memakai struktur existing agar alias `@/*` dan plugin Vite tidak terganggu.

## 4. Strategi branch — `Proposed`

Blueprint §8 menetapkan arah "private Git repository; feature branches" sebagai `Direction`. Konvensi berikut ditulis untuk memandu kerja solo developer, **belum diterapkan** pada repository.

| Branch | Fungsi | Status |
|---|---|---|
| `main` | Baseline stabil dan titik awal task berikutnya | Branch aktif saat ini |
| `docs/<task-id>` | Task dokumentasi/perencanaan, mis. `docs/P0.2-01` | Proposed |
| `feat/<task-id>` | Vertical slice implementasi, mis. `feat/P0.3-01` | Proposed |
| `fix/<task-id>` | Perbaikan kecil setelah verifikasi menemukan masalah | Proposed |
| `chore/<task-id>` | Maintenance tanpa perubahan fitur | Proposed |

Aturan penggunaan:

1. Satu active phase dan satu active slice pada satu waktu, sesuai roadmap §9.
2. Branch task dibuat dari `main` yang **bersih** dan baseline-nya sudah diverifikasi.
3. Karena working tree saat ini tidak bersih, **jangan membuat atau berpindah branch** sampai pengguna menentukan penanganan perubahan uncommitted yang sudah ada.
4. Jangan menimpa, me-reset, atau menghapus perubahan pengguna. Dilarang `reset --hard`, `checkout -- <file>`, `git clean`, stash otomatis, atau rebase destruktif tanpa persetujuan eksplisit.
5. Tidak ada push, merge, atau deploy otomatis. Push hanya dilakukan bila pengguna memerintahkan.
6. Branch lama tidak dihapus sebagai bagian dari P0.2-01.

## 5. Aturan checkpoint/commit

Checkpoint mengikuti Definition of Done di `docs/task-template.md`:

1. **Orient:** baca `git status --short`, `git diff`, README, ADR, dan backlog sebelum mulai.
2. **Satu slice selesai:** selesaikan satu task kecil; jangan mencampur task lain ke dalam checkpoint yang sama.
3. **Verifikasi sebelum commit:** jalankan pemeriksaan yang relevan.
   - Dokumentasi: `git diff --check`, tinjauan diff, konsistensi antar-dokumen.
   - Kode: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, dan pemeriksaan manual yang relevan.
   - Item yang tidak relevan boleh `N/A` dengan alasan tertulis, bukan dihapus dari checklist.
4. **Review diff:** pastikan tidak ada secret/data sensitif, tidak ada perubahan di luar scope, dan rollback dipahami.
5. **Commit hanya setelah lolos:** bila ada item yang gagal, perbaiki dalam slice yang sama; jangan membuat checkpoint.
6. **Pesan commit:** format usulan `P0.2-01: ringkasan singkat`. Format ini `Proposed` dan belum dipakai karena tidak ada commit pada task ini.
7. **Tidak ada commit/push pada P0.2-01:** aturan ini ditulis sebagai panduan, bukan tindakan yang dijalankan sekarang.
8. **Rollback:** sebelum commit, kembalikan potongan perubahan dari backup/diff; setelah commit, gunakan revert yang disetujui. Jangan menghapus data atau menimpa backup valid.

## 6. Rencana `AGENTS.md`

Roadmap v1.1 §3 mencantumkan `AGENTS.md` sebagai deliverable Phase 0. File tersebut **belum ada** dan **tidak dibuat** pada P0.2-01 karena kontennya akan menetapkan aturan kerja agen dan memerlukan ruang tersendiri.

Jika disetujui pada task berikutnya, isi minimal yang direncanakan:

- pointer ke `README.md`, `docs/repository-structure.md`, `docs/adr-status.md`, `docs/task-template.md`, dan `docs/change-control.md`;
- prinsip satu task kecil, verifikasi, laporan, lalu berhenti;
- larangan perubahan kode/dependency/config/database tanpa izin;
- larangan commit/push/reset/checkout destruktif tanpa instruksi eksplisit;
- larangan secret di diff/log.

Status `AGENTS.md`: **Proposed**.

## 7. Risiko dan mitigasi

| Risiko | Mitigasi |
|---|---|
| Reorganisasi folder merusak alias `@/*` atau plugin copy-asset Vite | P0.2-01 hanya dokumentasi; jangan ubah `tsconfig.json`, `vite.config.ts`, atau path `src/` |
| Working tree tidak bersih sehingga branch/checkout bisa menimpa kerja pengguna | Tetap di `main`; tidak ada branch/checkout/stash/reset |
| Branch nama baru dianggap keputusan final | Semua nama branch dan struktur `server/` ditandai `Proposed` |
| Modul saling mengimpor detail internal | Tinjau diff per slice; ekspor kontrak publik saja; uji relasi pada phase berikutnya |
| Dokumen struktur dianggap izin implementasi | Status doc dan bagian batasan menyatakan sebaliknya |

## 8. Rollback dan lanjutan

Rollback P0.2-01 cukup dengan mengembalikan/merevisi dokumen ini dan tautan README terkait; tidak ada perubahan kode, folder fisik, data, atau branch yang dibatalkan. Cadangan sebelum perubahan tersedia di `/tmp/opencode/p0.2-01-backup/`.

Task berikutnya adalah **P0.2-02 — Lengkapi README Setup dan perintah proyek**, dan **tidak dimulai** pada P0.2-01.
