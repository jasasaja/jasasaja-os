# Backlog Phase 5 — Follow-up Hardening & Release Path (Draft)

- **Status:** P5.1 `Done` (bukti CI remote tercatat); P5.2–P5.7 Proposed (planning only, 2026-11-27). Dokumen ini bukan izin deploy/produksi, dependency baru, migrasi, perubahan schema, atau perubahan scope MVP.
- **Tanggal:** 2026-11-27
- **Prasyarat:** Phase 4 local PASS with known gaps ([phase-4-exit-review-2026-11-27.md](./phase-4-exit-review-2026-11-27.md)); gate Phase 1–3 diterima ([phase-1-3-acceptance-gate-2026-11-27.md](./phase-1-3-acceptance-gate-2026-11-27.md)).
- **Fokus Phase 5:** Menutup known gaps Phase 4 yang paling penting: bukti CI remote untuk perubahan lokal, hardening test/CI, smoke browser nyata, keputusan learning E2E, export-portable, dan keputusan deploy OD-002.
- **Batasan:** Satu active slice pada satu waktu; verifikasi sebelum lanjut; agent tidak commit/push/deploy; tidak ada dependency/schema/migrasi baru tanpa persetujuan eksplisit; perubahan learning route/API/test hanya dengan instruksi eksplisit pengguna.

## 1. Kesiapan saat ini (carry-over dari Phase 4)

| Area | Kondisi aktual | Sumber |
|---|---|---|
| CI remote | Hijau untuk commit `e1f288d` (run `45970025553`, memuat P4.2–P4.6). Test DB integration masih lokal/untracked dan belum dibuktikan CI remote. | [P5.1](./p5.1-implementation-report-2026-11-27.md), [Phase 4 exit review](./phase-4-exit-review-2026-11-27.md) |
| Test otomatis lokal | 44 pass, 0 fail (23 existing + 17 route-level mock + 1 scoped E2E mock + 3 DB integration handbook+project). DB integration skip jika Postgres tidak tersedia. | `npm test` lokal 2026-11-27 |
| CI workflow | `.github/workflows/ci.yml` belum punya postgres service; DB integration test akan skip di CI saat ini. | `.github/workflows/ci.yml` |
| Browser/a11y/responsive | NOT RUN (CLI). P4.3 deep-link edge case diperbaiki secara command-verified. | [P4.3](./p4.3-implementation-report-2026-11-27.md) |
| E2E learning | P4.4 scoped handbook→project→deep-link; skenario asli learning→handbook→project→deep-link belum tertutup. | [P4.4](./p4.4-implementation-report-2026-11-27.md) |
| Backup/restore | Drill non-produksi P4.5 PASS; export portabel aplikasi belum ada. | [P4.5](./p4.5-implementation-report-2026-11-27.md), [backup-and-recovery.md](./backup-and-recovery.md) |
| Deploy OD-002 | Approved dengan constraint; backend Fastify long-running butuh adaptasi/keputusan deploy; deploy-ready NO. | [od-002-deploy-constraint.md](./od-002-deploy-constraint.md), [adr-status.md](./adr-status.md) |

## 2. Urutan slice yang diusulkan

### P5.1 — Commit/CI remote verification checkpoint

- **Status:** Done (2026-11-27) — [laporan](./p5.1-implementation-report-2026-11-27.md)
- **Priority:** `Must`
- **Goal / Outcome:** Perubahan P4.2–P4.6 dan hardening lokal yang dipilih pengguna terbukti oleh CI remote pada commit baru.
- **Scope / In-scope:** Checklist pre-commit/pre-push, verifikasi `git status/diff`, konfirmasi file yang termasuk/excluded (`opencode.json` tidak termasuk kecuali diminta), catatan bukti CI run baru setelah commit/push manual pengguna.
- **Non-scope:** Commit/push oleh agent; deploy; perubahan kode.
- **Acceptance criteria:** Commit manual pengguna dibuat; CI run baru untuk commit tersebut hijau; bukti run ID/URL/status dicatat di laporan.
- **Verification plan:** `git diff --check`, command checks lokal sebelum commit, GitHub Actions read-only check setelah push manual.
- **Catatan:** Agent hanya menyiapkan bukti/checklist; pengguna yang commit/push.
- **Bukti:** Commit manual `e1f288d` (`HEAD = origin/main`); CI run `45970025553` `completed`/`success`, semua langkah `Verify (Node 20)` sukses — https://github.com/jasasaja/jasasaja-os/actions/runs/45970025553. Check lokal 44 pass/0 fail. Dokumen P5.1 dan DB integration test masih lokal, belum tercakup run tersebut.

### P5.2 — CI workflow DB integration support

- **Status:** Proposed
- **Priority:** `Must`
- **Goal / Outcome:** DB integration test handbook+project berjalan nyata di CI, bukan skip.
- **Scope / In-scope:** Tambah postgres service/env di `.github/workflows/ci.yml`; pastikan integration test tetap aman (scratch DB) dan mock tests tidak terpengaruh; update dokumentasi bila perlu.
- **Non-scope:** Deploy, migrasi baru, dependency baru, perubahan behavior fitur.
- **Acceptance criteria:** CI run menunjukkan DB integration test berjalan dan pass; test mock existing tetap pass; tidak ada secret hardcoded.
- **Verification plan:** `npm test` lokal, `git diff --check`, CI run hijau setelah commit manual.
- **Risiko:** Perbedaan env CI vs lokal; perlu env vars minimal dan service healthcheck.

### P5.3 — Browser/a11y/responsive manual smoke

- **Status:** Proposed
- **Priority:** `Should`
- **Goal / Outcome:** Bukti manual browser/a11y/responsive untuk handbook+project (dan area shared yang terdampak) tercatat jujur.
- **Scope / In-scope:** Checklist manual di browser nyata: keyboard/focus, dialog/menu, responsive breakpoints, loading/empty/error/success, deep-link handbook dari project.
- **Non-scope:** Tooling browser/A11y baru tanpa approval; redesign UI besar; learning flow kecuali diminta eksplisit.
- **Acceptance criteria:** Setiap item checklist PASS/FAIL/NOT RUN dengan bukti/catatan; perbaikan kecil dipisah jadi slice sendiri.
- **Verification plan:** smoke manual + `git diff --check` bila ada perbaikan kode.

### P5.4 — Learning E2E closure (gated)

- **Status:** Proposed (GATED)
- **Priority:** `Should`
- **Goal / Outcome:** Menutup gap P4.4 asli: learning → handbook → project → deep-link handbook dalam satu skenario berurutan.
- **Scope / In-scope:** Skenario E2E terkontrol, mock-backed atau DB integration sesuai keputusan; cleanup data uji.
- **Non-scope:** Perubahan fitur learning besar, deploy, produksi.
- **Gate:** **Butuh instruksi eksplisit pengguna** sebelum menyentuh learning route/API/test karena Phase 3/4 sengaja melewati learning.
- **Acceptance criteria:** Satu eksekusi kontinu lulus dengan cleanup; hasil tercatat; tidak ada regresi test existing.
- **Verification plan:** command checks + test target + `git diff --check`.

### P5.5 — Export-portable decision & minimal slice

- **Status:** Proposed
- **Priority:** `Should`
- **Goal / Outcome:** Keputusan jelas untuk export portabel aplikasi (JSON/Markdown/domain export) dan, bila disetujui, slice implementasi minimal.
- **Scope / In-scope:** Evaluasi format/scope/privasi; dokumen keputusan; implementasi minimal hanya jika disetujui terpisah.
- **Non-scope:** Import otomatis kompleks, sinkronisasi cloud, aktivasi layanan pihak ketiga.
- **Acceptance criteria:** Keputusan terdokumentasi; jika implementasi: endpoint/read path aman, tervalidasi, tanpa secret, dengan test.
- **Verification plan:** review dokumen; bila kode: `typecheck/lint/test/build/git diff --check`.

### P5.6 — OD-002 deploy strategy decision

- **Status:** Proposed
- **Priority:** `Should`
- **Goal / Outcome:** Memilih strategi deploy OD-002 yang konkret sebelum pekerjaan implementasi deploy.
- **Scope / In-scope:** Evaluasi opsi: adaptasi Fastify ke Vercel serverless, alternatif hosting API Node long-running, atau tunda deploy online. Update ADR/note jika keputusan berubah.
- **Non-scope:** Aktivasi akun/hosting/produksi; deploy nyata; pembelian layanan.
- **Acceptance criteria:** Satu strategi dipilih/ditolak secara tertulis dengan risiko, prasyarat, dan next slice implementasi.
- **Verification plan:** review dokumen + `git diff --check`.

### P5.7 — Phase 5 exit review

- **Status:** Proposed
- **Priority:** `Must`
- **Goal / Outcome:** Review bukti Phase 5 dengan known gaps dan rekomendasi jujur.
- **Scope / In-scope:** `docs/phase-5-exit-review-<tanggal>.md`; pembaruan backlog dan `docs/README.md`.
- **Non-scope:** Klaim sign-off/deploy-ready tanpa bukti.
- **Verification plan:** `git diff --check`; konsistensi dokumen.

## 3. Risiko dan open items

- **Working tree belum bersih/ter-commit.** P4.2–P4.6 sudah di-commit/di-push (`e1f288d`) dan dibuktikan CI (`45970025553`). Yang masih lokal: dokumen P5.1 dan DB integration test handbook+project; commit/push manual pengguna diperlukan sebelum CI remote dapat membuktikannya.
- **CI DB integration belum aktif di remote.** Test akan skip di CI sampai workflow diperbarui.
- **Learning E2E gated.** Tidak boleh dikerjakan tanpa instruksi eksplisit pengguna.
- **OD-002 belum deploy-ready.** Jangan klaim production readiness.
- **Export portabel belum ada.** Perlu keputusan scope/format/privasi.

## 4. Definition of Done per slice

- [ ] Acceptance criteria terpenuhi dan bukti dicatat.
- [ ] Input divalidasi server-side dengan Zod bila ada perubahan API.
- [ ] Guard/otorisasi server diperiksa untuk data privat bila ada perubahan API.
- [ ] Test/check relevan lulus (`npm test`, `typecheck`, `lint`, `build` bila kode tersentuh); `git diff --check`.
- [ ] State loading/empty/error/success ditangani bila ada perubahan UI/API.
- [ ] Tidak ada secret atau data sensitif di diff/log.
- [ ] Tidak ada perubahan learning route/API tanpa instruksi eksplisit.
- [ ] Dokumentasi diperbarui; migrasi hanya dengan instruksi eksplisit.
- [ ] Diff ditinjau; risiko dan rollback dipahami.
- [ ] Item tidak relevan ditandai `N/A` dengan alasan tertulis.
