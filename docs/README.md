# Dokumentasi Perencanaan JASASAJA Personal OS

Direktori ini berisi dokumentasi perencanaan Phase 0.1 sampai 0.3. Dokumen baseline v1.1 telah **Approved pada 2026-11-24**; status dokumen perencanaan di bawah mengikuti tabel masing-masing dan belum mengubah kode, dependency, konfigurasi, atau scope MVP. `README.md` di root memuat panduan setup frontend aktual yang diperbarui pada P0.2-02.

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
| [phase-0-backlog.md](./phase-0-backlog.md) | Backlog P0.1–P0.5 | P0.1-01/02/03, P0.2-01/02/03, dan P0.3-02 Done; backlog keseluruhan Draft |
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
