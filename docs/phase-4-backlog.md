# Backlog Phase 4 — Integration & MVP Hardening (Draft)

- **Status:** P4.1 `Done` (local PASS + CI remote success) pada 2026-11-27; P4.2 `Done` (local PASS, command-verified; pending commit manual pengguna + CI remote untuk commit baru) pada 2026-11-27; P4.3 `Done` (local command-verified; browser/a11y/responsive manual NOT RUN di CLI; deep-link edge case fixed) pada 2026-11-27; P4.4 `Done` (scoped: handbook→project→deep-link; learning skipped per explicit user instruction 2026-11-27) pada 2026-11-27; P4.5 `Done` (local restore drill PASS; release checklist & OD-002 constraint note created; export-portable app endpoint not implemented) pada 2026-11-27; P4.6 `Done` (exit review documented; local PASS with known gaps) pada 2026-11-27. Dokumen ini bukan izin deploy/produksi, dependency baru, migrasi, atau perubahan scope MVP.
- **Tanggal:** 2026-11-27
- **Prasyarat:** Gate penerimaan known gaps Phase 1–3 tertutup ([phase-1-3-acceptance-gate-2026-11-27.md](./phase-1-3-acceptance-gate-2026-11-27.md)); commit/push manual pengguna dan CI remote terverifikasi di [P4.1](./p4.1-implementation-report-2026-11-27.md).
- **Fokus Phase 4:** Alur utama teruji, backup/restore diuji, dokumentasi dan release checklist tersedia (README §Rencana Pengembangan / roadmap exit criteria).
- **Batasan:** Satu active slice pada satu waktu; verifikasi sebelum lanjut; browser/a11y/responsive manual tetap harus dicatat bila dilewati; deploy online dan produksi butuh approval terpisah; OD-002 sudah Approved dengan constraint adaptasi Fastify → Vercel.

## 1. Kesiapan saat ini

| Area | Kondisi aktual | Sumber |
|---|---|---|
| Repo & remote | `HEAD = origin/main = 7d46927` pada audit P4.1; working tree bersih sebelum dokumentasi P4.1 dibuat. | [P4.1](./p4.1-implementation-report-2026-11-27.md) |
| CI workflow | `.github/workflows/ci.yml` menjalankan `npm ci`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` pada Node 20. | `.github/workflows/ci.yml` |
| CI remote | GitHub Actions run #2 (`45956782960`) untuk `7d46927` berstatus `completed` / `success`; semua langkah Test, Typecheck, Lint, Build lulus. | [P4.1](./p4.1-implementation-report-2026-11-27.md) |
| Backup/restore | Prosedur dan restore drill scratch DB lokal sudah tercatat di P0.5-02; export portabel aplikasi belum ada. | [step-8](./step-8-p0.5-02-backup-restore-report-2026-11-26.md), [backup-and-recovery.md](./backup-and-recovery.md) |
| Modul MVP | Learning, Handbook, dan Project memiliki API + UI baca/sunting minimal; gate Phase 1–3 diterima dengan known gaps. | [Gate Phase 1–3](./phase-1-3-acceptance-gate-2026-11-27.md) |
| Test otomatis | 23 test frontend existing; belum ada automated backend/DB/UI test. | `npm test`, laporan Phase 1–3 |
| Deploy | OD-002 Approved (Vercel Free + Neon Free, Rp0) dengan constraint adaptasi Fastify long-running; belum ada deploy. | [adr-status.md](./adr-status.md), ADR-005 |

## 2. Urutan slice yang diusulkan

### P4.1 — Repo hygiene & CI checkpoint

- **Status:** Done (local PASS + CI remote success, verified 2026-11-27) — lihat [p4.1-implementation-report-2026-11-27.md](./p4.1-implementation-report-2026-11-27.md)
- **Priority:** `Must`
- **Goal / Outcome:** Pastikan working tree/remote sinkron, command checks lulus, dan CI remote hijau untuk commit yang memuat Phase 1–3.
- **Scope / In-scope:** Audit git status/remote/HEAD; verifikasi workflow CI; jalankan command checks lokal; dokumentasi bukti; catatan commit/push manual oleh pengguna.
- **Non-scope:** Commit/push oleh agent, deploy, dependency/migrasi, perubahan source.
- **Acceptance criteria:** `HEAD = origin/main`; working tree bersih pada saat audit; CI run untuk HEAD berstatus success; local checks lulus; agent tidak commit/push.
- **Verification plan:** `npm ci --dry-run --ignore-scripts`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `git diff --check`, GitHub Actions API read-only.

### P4.2 — Automated test minimum

- **Status:** Done (local PASS, command-verified 2026-11-27; pending commit manual pengguna + CI remote untuk commit baru) — lihat [p4.2-implementation-report-2026-11-27.md](./p4.2-implementation-report-2026-11-27.md)
- **Priority:** `Must`
- **Goal / Outcome:** Utang test backend/UI mulai ditutup dengan test otomatis minimal yang tidak mengubah perilaku fitur.
- **Scope / In-scope:** Test untuk modul `projects`, `handbook`, dan `learning`; pakai pola `tsx`/`node:test` yang sudah ada; kemungkinan penyesuaian script test.
- **Non-scope:** Dependency baru tanpa persetujuan, perubahan schema, refactor besar, deploy.
- **Acceptance criteria:** Test berjalan di lokal dan CI; 23 test existing tetap lulus; tidak ada dependency baru tanpa approval.
- **Verification plan:** command checks + CI run berikutnya setelah commit manual pengguna.
- **Hasil lokal:** 40 test lulus (23 existing + 17 backend baru); `typecheck`, `lint`, `build`, `git diff --check` lulus. CI remote belum dibuktikan untuk commit yang memuat P4.2 karena agent tidak commit/push.

### P4.3 — Browser/a11y/responsive smoke

- **Status:** Done (local command-verified 2026-11-27; browser/a11y/responsive manual NOT RUN di lingkungan CLI; deep-link edge case fixed) — lihat [p4.3-implementation-report-2026-11-27.md](./p4.3-implementation-report-2026-11-27.md)
- **Priority:** `Should`
- **Goal / Outcome:** Status final untuk interaksi klik, fokus, keyboard, dan tampilan responsive tidak lagi menjadi asumsi.
- **Scope / In-scope:** Checklist manual browser/a11y/responsive; perbaikan kecil edge-case deep-link Handbook bila diputuskan.
- **Non-scope:** Library test browser baru tanpa approval, redesign UI.
- **Acceptance criteria:** Hasil smoke dicatat jujur (PASS/FAIL per item); perbaikan bila ada tetap satu slice kecil.
- **Verification plan:** checklist manual + `git diff --check` bila ada perbaikan kode.
- **Hasil lokal:** command checks lulus; edge-case deep-link Handbook diperbaiki (`App.tsx`, `HandbookView.tsx`); checklist browser/a11y/responsive dicatat dengan item NOT RUN karena tidak ada browser GUI.

### P4.4 — Continuous E2E lintas modul

- **Status:** Done (scoped 2026-11-27; learning skipped per explicit user instruction) — lihat [p4.4-implementation-report-2026-11-27.md](./p4.4-implementation-report-2026-11-27.md)
- **Priority:** `Must`
- **Goal / Outcome:** Satu skenario berurutan terbukti: learning → handbook → project → deep-link handbook.
- **Scope / In-scope:** Skenario E2E dengan data development; bukti otomatis atau smoke terdokumentasi.
- **Non-scope:** Perubahan fitur baru, produksi, deploy.
- **Acceptance criteria:** Satu eksekusi kontinu (bukan smoke terpisah) dengan cleanup; hasil tercatat.
- **Verification plan:** test/smoke + command checks.
- **Catatan gate:** Menyentuh route learning memerlukan instruksi eksplisit baru karena Phase 3 sengaja melewatkannya.
- **Hasil scoped:** Continuous mock-backed flow handbook→project→deep-link handbook lulus (`server/src/modules/e2e-handbook-project.routes.test.ts`, 41 tests total pass). **Learning sengaja tidak disentuh** sesuai instruksi pengguna 2026-11-27; acceptance asli P4.4 yang mencakup learning belum sepenuhnya tertutup.

### P4.5 — Backup/restore & release readiness

- **Status:** Done (local drill PASS 2026-11-27; release checklist & OD-002 constraint note created; export-portable app endpoint not implemented) — lihat [p4.5-implementation-report-2026-11-27.md](./p4.5-implementation-report-2026-11-27.md)
- **Priority:** `Must`
- **Goal / Outcome:** Exit criteria backup/restore dan release checklist Phase 4 tertutup.
- **Scope / In-scope:** Refresh drill P0.5-02; evaluasi export portabel; release checklist; rencana penanganan constraint OD-002.
- **Non-scope:** Aktivasi akun/hosting/produksi tanpa approval; perubahan data destruktif.
- **Acceptance criteria:** Restore drill non-produksi tercatat; release checklist tersedia; keputusan deploy/OD-002 jelas.
- **Verification plan:** drill non-produksi + review checklist + `git diff --check`.
- **Hasil lokal:** Dump fresh `backups/jasasaja_os_dev_20261127T083544Z.dump` (SHA256 OK), restore ke scratch DB `jasasaja_os_restore_drill_p45` PASS, count(*) 11 tabel MATCH, FK/PK/partial unique Approved indexes terverifikasi, scratch DB di-drop. Release checklist: [release-readiness-checklist.md](./release-readiness-checklist.md). OD-002 constraint: [od-002-deploy-constraint.md](./od-002-deploy-constraint.md). Export portabel aplikasi: belum diimplementasikan (gap).

### P4.6 — Phase 4 exit review

- **Status:** Done (2026-11-27) — lihat [phase-4-exit-review-2026-11-27.md](./phase-4-exit-review-2026-11-27.md)
- **Priority:** `Must`
- **Goal / Outcome:** Review bukti lokal + remote Phase 4 dengan known gaps dan rekomendasi.
- **Scope / In-scope:** `docs/phase-4-exit-review-<tanggal>.md`; pembaruan backlog dan `docs/README.md`.
- **Non-scope:** Klaim sign-off tambahan, deploy, perubahan kode di luar koreksi dokumentasi.
- **Verification plan:** `git diff --check`; tinjau konsistensi dokumen.
- **Hasil:** Exit review mendokumentasikan P4.1–P4.5 sebagai local PASS with known gaps; CI remote hanya hijau untuk `7d46927`; P4.2–P4.6 belum di-commit/push; browser manual NOT RUN; learning E2E scoped/skipped; OD-002/export-portable belum diimplementasikan.

## 3. Risiko dan open items lintas slice

- **Commit manual masih bergantung pengguna.** Dokumen P4.1 sendiri dibuat setelah audit remote, sehingga perlu commit manual berikutnya.
- **CI hijau hanya untuk commit `7d46927`.** Pekerjaan P4.2–P4.6 ada di working tree lokal dan belum dibuktikan oleh CI remote; commit manual pengguna berikutnya perlu verifikasi run baru.
- **Cakupan test backend masih minimal.** P4.2 menambah 17 test route-level untuk `projects`, `handbook`, dan `learning` dengan mock DB; belum ada integration test DB nyata atau UI browser test.
- **Warning masih ada:** EBADENGINE `cookie@2.0.2` pada Node 20 dan Vite `__dirname` di `vite.config.ts:22`; keduanya tidak memblokir CI saat ini.
- **Branch protection / required checks belum dikonfigurasi atau diverifikasi.**
- **Browser/a11y/responsive manual masih NOT RUN.** P4.3 mencatat checklist jujur tetapi environment CLI tidak menjalankan browser GUI/screen reader/responsive viewport nyata.
- **P4.4 asli belum sepenuhnya tertutup.** Skenario learning→handbook→project→deep-link sengaja dipangkas menjadi handbook→project→deep-link sesuai instruksi pengguna 2026-11-27; E2E learning tetap tertunda.
- **OD-002 constraint deploy belum diimplementasi.** P4.5 mendokumentasikan constraint dan opsi di [od-002-deploy-constraint.md](./od-002-deploy-constraint.md); deploy-ready tetap **NO** sampai adaptasi/keputusan deploy eksplisit diimplementasikan.

## 4. Definition of Done per slice

- [ ] Acceptance criteria slice terpenuhi dan buktinya dicatat.
- [ ] Input divalidasi server-side dengan Zod bila ada perubahan API.
- [ ] Guard/otorisasi server diperiksa untuk data privat bila ada perubahan API.
- [ ] Test/check relevan lulus (`npm test`, `typecheck`, `lint`, `build` bila kode tersentuh); `git diff --check`.
- [ ] State loading/empty/error/success ditangani bila ada perubahan UI/API.
- [ ] Tidak ada secret atau data sensitif di diff/log.
- [ ] Tidak ada perubahan learning route/API tanpa instruksi baru.
- [ ] Dokumentasi dan migrasi diperbarui bila diperlukan; migrasi hanya dengan instruksi eksplisit.
- [ ] Diff ditinjau; risiko dan rollback dipahami.
- [ ] Item yang tidak relevan ditandai `N/A` dengan alasan tertulis.
