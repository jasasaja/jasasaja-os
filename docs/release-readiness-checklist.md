# Release Readiness Checklist — JASASAJA Personal OS

- **Status:** Draft operasional (P4.5, 2026-11-27)
- **Cakupan:** MVP lokal/dev hardening untuk handbook + project. **Bukan** persetujuan deploy produksi.
- **Catatan:** Item learning E2E sengaja tertunda sesuai instruksi pengguna 2026-11-27.

## 1. Kode & verifikasi lokal

- [x] `npm run typecheck` PASS (terakhir diverifikasi P4.5: 2026-11-27)
- [x] `npm run lint` PASS
- [x] `npm test` PASS (41 pass, 0 fail; mock-backed route tests + scoped continuous E2E handbook+project)
- [x] `npm run build` PASS (warning Vite `__dirname` known non-blocking)
- [x] `git diff --check` PASS
- [ ] Browser/a11y/responsive manual smoke PASS — **NOT RUN** (CLI environment)
- [ ] Continuous E2E termasuk learning — **SKIPPED** per instruksi pengguna; scoped handbook+project PASS

## 2. Repo & CI

- [x] P4.1 repo hygiene/CI checkpoint tercatat (CI run `45956782960` success untuk `7d46927`)
- [ ] Commit manual pengguna untuk P4.2–P4.5 dibuat
- [ ] Push ke remote dan CI run baru hijau untuk commit yang memuat P4.2–P4.5
- [ ] Branch protection / required checks dikonfigurasi — **belum diverifikasi**

## 3. Data, backup, restore

- [x] Prosedur backup/restore terdokumentasi (`docs/backup-and-recovery.md`, OD-006)
- [x] Restore drill non-produksi P4.5 PASS pada scratch DB (`jasasaja_os_restore_drill_p45`, sudah di-drop)
- [x] Dump fresh + SHA256: `backups/jasasaja_os_dev_20261127T083544Z.dump` (`.sha256` OK)
- [x] Count(*) 11 tabel, FK/PK, partial unique Approved indexes terverifikasi
- [ ] Export portabel aplikasi (JSON/Markdown endpoint/domain export) — **belum diimplementasikan**
- [ ] Backup automation/scheduling produksi — **N/A / belum diputuskan**; bukan scope dev

## 4. Keamanan & konfigurasi

- [x] Tidak ada secret/token/password di diff/log/dokumen
- [x] `.env*` dan `backups/` gitignored
- [x] Auth guard / API error shape konsisten pada route yang diuji
- [ ] Secret scanning / dependency audit policy — belum diformalkan
- [ ] Review env vars produksi/Neon/Vercel — **blocked by OD-002 deploy adaptation; no production env configured**

## 5. Deployment / OD-002

- [x] OD-002 Approved dengan constraint tercatat (`docs/od-002-deploy-constraint.md`, `docs/adr-status.md`)
- [ ] Adaptasi Fastify long-running untuk target Vercel API — **belum diimplementasikan**
- [ ] Keputusan deploy konkret (serverless adapter vs alternatif hosting API) — **dibutuhkan sebelum deploy**
- [ ] Akun/proyek Vercel/Neon produksi dibuat — **TIDAK**; butuh persetujuan eksplisit terpisah
- [ ] Domain/SSL/env produksi — **TIDAK**; butuh persetujuan eksplisit terpisah

## 6. Known gaps yang harus tetap jujur sebelum release claim

- Browser/a11y/responsive manual NOT RUN.
- Learning E2E/scoped P4.4 asli belum tertutup.
- CI remote belum membuktikan P4.2–P4.5.
- Export portabel aplikasi belum ada.
- OD-002 deploy constraint belum diimplementasikan; **jangan klaim deploy-ready**.

## 7. Go/No-Go (saat ini)

- **Go untuk:** hardening lokal/dev handbook+project, commit manual + verifikasi CI baru.
- **No-Go untuk:** klaim production/deploy-ready/public release, aktivasi akun/hosting tanpa persetujuan eksplisit, klaim E2E learning tertutup.
