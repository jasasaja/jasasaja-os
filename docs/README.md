# Dokumentasi Perencanaan JASASAJA Personal OS

Direktori ini berisi dokumentasi perencanaan dan review Phase 0 sampai Phase 5. Dokumen baseline v1.1 telah **Approved pada 2026-11-24**; status dokumen perencanaan di bawah mengikuti tabel masing-masing dan belum mengubah kode, dependency, konfigurasi, atau scope MVP. `README.md` di root memuat panduan setup frontend aktual yang diperbarui pada P0.2-02.

## Daftar dokumen

| Dokumen | Isi | Status |
|---|---|---|
| [architecture-proposal.md](./architecture-proposal.md) | Proposal arsitektur teknis dan perbandingan opsi | Approved untuk keputusan inti; detail Proposed |
| [adr/ADR-001-application-architecture.md](./adr/ADR-001-application-architecture.md) | Arsitektur aplikasi | Accepted |
| [adr/ADR-002-frontend-and-backend-stack.md](./adr/ADR-002-frontend-and-backend-stack.md) | Stack frontend dan backend | Accepted (stack inti; versi OD-001) |
| [adr/ADR-003-database-and-orm.md](./adr/ADR-003-database-and-orm.md) | Database dan ORM | Accepted (PostgreSQL, Drizzle, Neon Free, Rp0) |
| [adr/ADR-004-authentication-and-authorization.md](./adr/ADR-004-authentication-and-authorization.md) | Autentikasi dan otorisasi | Accepted (Google Login; session detail Proposed) |
| [adr/ADR-005-hosting-and-deployment.md](./adr/ADR-005-hosting-and-deployment.md) | Hosting dan deployment | Accepted (hybrid, Rp0, Neon Free; hosting detail Proposed) |
| [adr/ADR-006-content-authoring-and-import.md](./adr/ADR-006-content-authoring-and-import.md) | Authoring dan import konten | Accepted (Rich Text / Block Editor; import OD-004) |
| [adr/ADR-007-content-versioning.md](./adr/ADR-007-content-versioning.md) | Versioning konten | Proposed (OD-005) |
| [adr/ADR-008-backup-and-recovery.md](./adr/ADR-008-backup-and-recovery.md) | Backup dan recovery | Proposed (OD-006) |
| [adr/ADR-009-default-timezone.md](./adr/ADR-009-default-timezone.md) | Timezone default | Proposed (OD-008) |
| [phase-0-backlog.md](./phase-0-backlog.md) | Backlog P0.1–P0.5 | Signed off 2026-11-26 (lihat exit review) |
| [phase-1-backlog.md](./phase-1-backlog.md) | Backlog P1.1–P1.6 Learning Center | P1.1-P1.6 implemented/verified locally; known gaps accepted by user 2026-11-27 |
| [phase-1-exit-review-2026-11-26.md](./phase-1-exit-review-2026-11-26.md) | Exit review Phase 1 | Local PASS with known gaps; accepted by user 2026-11-27 |
| [phase-2-backlog.md](./phase-2-backlog.md) | Backlog P2.1–P2.6 Engineering Handbook | P2.1–P2.6 implemented/verified locally; known gaps accepted by user 2026-11-27 |
| [phase-2-exit-review-2026-11-26.md](./phase-2-exit-review-2026-11-26.md) | Exit review Phase 2 | Local PASS with known gaps; accepted by user 2026-11-27 |
| [phase-3-backlog.md](./phase-3-backlog.md) | Backlog P3.1–P3.6 Project Workspace & Handbook | P3.1–P3.6 implemented/verified locally; P3.6 done; known gaps accepted by user 2026-11-27; learning route skipped |
| [phase-3-exit-review-2026-11-27.md](./phase-3-exit-review-2026-11-27.md) | Exit review Phase 3 | Local PASS with known gaps; accepted by user 2026-11-27 |
| [phase-1-3-acceptance-gate-2026-11-27.md](./phase-1-3-acceptance-gate-2026-11-27.md) | Gate penerimaan known gaps Phase 1–3 | Accepted by user 2026-11-27; commit/push manual oleh pengguna; CI remote terverifikasi via [P4.1](./p4.1-implementation-report-2026-11-27.md) |
| [phase-4-backlog.md](./phase-4-backlog.md) | Backlog P4.1–P4.6 Integration & MVP Hardening | P4.1–P4.6 Done; P4.2–P4.6 dibuktikan CI remote via `e1f288d` / run `45970025553`; P4.4 scoped (learning skipped) |
| [p4.1-implementation-report-2026-11-27.md](./p4.1-implementation-report-2026-11-27.md) | Laporan slice P4.1 Repo hygiene & CI checkpoint | PASS — repo sinkron `7d46927`, CI run #2 `success` |
| [p4.2-implementation-report-2026-11-27.md](./p4.2-implementation-report-2026-11-27.md) | Laporan slice P4.2 Automated test minimum | Local PASS — 40 tests (23 existing + 17 backend baru); ter-commit `e1f288d`, CI remote success |
| [p4.3-implementation-report-2026-11-27.md](./p4.3-implementation-report-2026-11-27.md) | Laporan slice P4.3 Browser/a11y/responsive smoke | Local command-verified; browser/a11y/responsive manual NOT RUN; deep-link edge case fixed |
| [p4.4-implementation-report-2026-11-27.md](./p4.4-implementation-report-2026-11-27.md) | Laporan slice P4.4 Continuous E2E smoke (scoped) | Local PASS — handbook→project→deep-link flow; learning skipped per explicit user instruction |
| [p4.5-implementation-report-2026-11-27.md](./p4.5-implementation-report-2026-11-27.md) | Laporan slice P4.5 Backup/restore & release readiness | Local drill PASS; release checklist/OD-002 note created; export-portable app endpoint not implemented |
| [release-readiness-checklist.md](./release-readiness-checklist.md) | Checklist release readiness MVP | Draft operasional P4.5; deploy-ready NO (OD-002 constraint) |
| [od-002-deploy-constraint.md](./od-002-deploy-constraint.md) | Catatan constraint deploy OD-002 | Fastify long-running vs Vercel; opsi belum diputuskan/diimplementasikan |
| [phase-4-exit-review-2026-11-27.md](./phase-4-exit-review-2026-11-27.md) | Exit review Phase 4 | Local PASS with known gaps; dokumen mencatat baseline CI `7d46927`, lanjutan `e1f288d` di [P5.1](./p5.1-implementation-report-2026-11-27.md); bukan sign-off/deploy-ready |
| [phase-5-backlog.md](./phase-5-backlog.md) | Backlog P5.1–P5.7 Follow-up Hardening & Release Path | P5.1 Done (bukti CI `e1f288d`); P5.2–P5.7 Proposed (planning only 2026-11-27) |
| [p5.1-implementation-report-2026-11-27.md](./p5.1-implementation-report-2026-11-27.md) | Laporan slice P5.1 Commit/CI remote verification checkpoint | PASS — commit manual `e1f288d`, CI run `45970025553` `success`; documentation-only |
| [p3.1-implementation-report-2026-11-27.md](./p3.1-implementation-report-2026-11-27.md) | Laporan slice P3.1 | Local PASS with known gaps |
| [p3.2-implementation-report-2026-11-27.md](./p3.2-implementation-report-2026-11-27.md) | Laporan slice P3.2 | Local PASS with known gaps |
| [p3.3-implementation-report-2026-11-27.md](./p3.3-implementation-report-2026-11-27.md) | Laporan slice P3.3 | Local PASS with known gaps |
| [p3.4-implementation-report-2026-11-27.md](./p3.4-implementation-report-2026-11-27.md) | Laporan slice P3.4 | Local PASS with known gaps |
| [p3.5-implementation-report-2026-11-27.md](./p3.5-implementation-report-2026-11-27.md) | Laporan slice P3.5 | Local PASS; browser manual pending |
| [p2.1-implementation-report-2026-11-26.md](./p2.1-implementation-report-2026-11-26.md) | Laporan slice P2.1 | Local PASS with known gaps |
| [p2.2-implementation-report-2026-11-26.md](./p2.2-implementation-report-2026-11-26.md) | Laporan slice P2.2 | Local PASS with known gaps |
| [p2.3-implementation-report-2026-11-26.md](./p2.3-implementation-report-2026-11-26.md) | Laporan slice P2.3 | Local PASS with known gaps |
| [p2.4-implementation-report-2026-11-26.md](./p2.4-implementation-report-2026-11-26.md) | Laporan slice P2.4 | Local PASS with known gaps |
| [p2.5-implementation-report-2026-11-26.md](./p2.5-implementation-report-2026-11-26.md) | Laporan slice P2.5 | Local PASS with known gaps |
| [adr-status.md](./adr-status.md) | Lembar finalisasi ADR dan decision register | P0.1-02 selesai — register keputusan & OD |
| [provider-verification.md](./provider-verification.md) | Verifikasi provider PostgreSQL/hosting (desk research) | Neon Free Approved; tidak ada aktivasi |
| [task-template.md](./task-template.md) | Template task dan checklist Definition of Done | Final — P0.1-03; diperluas P0.2-03 |
| [report-template.md](./report-template.md) | Template laporan penyelesaian task untuk PM | Final — P0.2-03 |
| [change-control.md](./change-control.md) | Aturan persetujuan perubahan | Final — P0.1-03 |
| [repository-structure.md](./repository-structure.md) | Peta area repo, batas modul, branch strategy, checkpoint | P0.2-01 selesai — inti Accepted; detail/branch Proposed |
| [api-contract.md](./api-contract.md) | Kontrak `/api`: conventions, response, validasi, auth, inventaris endpoint MVP | Proposed — P0.3-02; review sebelum implementasi |

Template task, checklist DoD, dan template laporan tersedia di sini; gunakan keduanya untuk setiap slice agar verifikasi dan pelaporan konsisten.

## Sumber acuan

1. `JASASAJA_Personal_OS_Master_Blueprint_v1.1.docx` — dokumen induk: visi, prinsip, scope, arah arsitektur, governance, dan open decisions OD-001–OD-008.
2. `JASASAJA_Personal_OS_PRD_MVP_v1.1.docx` — requirement fungsional dan non-fungsional, user journey, acceptance criteria, dan Definition of Done.
3. `JASASAJA_Personal_OS_Development_Roadmap_v1.1.docx` — urutan fase, work packages Phase 0, exit criteria, dan development loop.

Status ketiga dokumen baseline tersebut: **Approved — 2026-11-24**. Status ADR telah diaudit dan diperbarui pada P0.1-02; rinciannya ada di [adr-status.md](./adr-status.md).

Persetujuan keputusan inti tidak otomatis memberi izin implementasi. Item yang masih memerlukan konfirmasi pengguna tercantum di bagian 3 `adr-status.md`.

## Konvensi status

- **Accepted** — keputusan memang sudah dikonfirmasi pengguna atau sudah menjadi acuan tertulis dalam dokumen v1.1 dan tidak diubah dalam perencanaan ini.
- **Proposed** — rekomendasi perencanaan; **belum** menjadi keputusan pengguna sampai disetujui.
- **Rejected** — opsi yang sengaja tidak dipilih untuk MVP pada kondisi saat ini; dapat ditinjau ulang bila kebutuhan berubah.
- **Superseded** — keputusan lama yang digantikan oleh keputusan baru; tetap disimpan sebagai riwayat dan bukan acuan implementasi.

Status pada baris pertama setiap ADR merujuk kepada **keputusan utama** ADR tersebut. Rincian yang belum disetujui tetap ditandai `Proposed` di dalam tabel status turunan.
