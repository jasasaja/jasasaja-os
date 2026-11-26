# Implementation Report — Step 8 (P0.5-02 Backup/Restore)

## 1. Task
**P0.5-02 — Dokumentasi prosedur backup/export/restore** (sesuai OD-006 Approved 2026-11-25).

## 2. Status
**PASS (local drill non-produksi selesai; export portabel aplikasi endpoint belum diimplementasikan)**

## 3. Hasil
- OD-006 dikonfirmasi Approved (keputusan pengguna). Prosedur backup/restore didokumentasikan.
- `.gitignore` diperbarui untuk mengabaikan `/backups/`.
- `docs/backup-and-recovery.md` dibuat: frekuensi, retensi 7, lokasi `./backups/`, format `pg_dump -Fc` + SHA256, prosedur backup, prosedur restore drill ke scratch DB non-produksi, penanganan secret, bukti drill.
- Restore drill dieksekusi pada **DB scratch non-produksi** di container postgres lokal compose. DB dev existing tidak dimodifikasi/dihapus.

**Batasan:**
- Host tidak memiliki `pg_dump`/`psql`/`pg_restore`; drill memakai tool di dalam container `jasasaja-os-dev-postgres` (postgres:16-alpine).
- Export portabel aplikasi (JSON/Markdown endpoint/domain export) belum diimplementasikan; ini di luar P0.5-02 drill DB dan mengikuti ADR-006/OD-004 untuk fase berikutnya.
- Tidak ada backup/restore Neon/produksi.

## 4. File Changed
**Baru:**
- `docs/backup-and-recovery.md`
- `docs/step-8-p0.5-02-backup-restore-report-2026-11-26.md`
- `backups/jasasaja_os_dev_20261126T082603Z.dump` (gitignored, artefak lokal)
- `backups/jasasaja_os_dev_20261126T082603Z.dump.sha256` (gitignored, artefak lokal)

**Diubah:**
- `.gitignore` — tambah `/backups/`
- `docs/phase-0-backlog.md` — P0.5-02 Done (local drill), ringkasan/P0.5-03 diperbarui
- `docs/adr-status.md` — OD-002 dicatat Approved 2026-11-26 dengan constraint; ringkasan/checklist diperbarui
- `docs/adr/ADR-005-hosting-and-deployment.md` — OD-002 Approved dengan constraint Fastify-on-Vercel

**Pre-existing (tidak disentuh):** working tree dirty lain tetap ada.

## 5. Verification / Evidence
| Pemeriksaan | Hasil aktual | Status |
|---|---|---|
| Host `pg_dump`/`psql`/`pg_restore` | Tidak tersedia di host | NOTED |
| Container tool check | `pg_dump`, `psql`, `pg_restore`, `sha256sum` tersedia di `jasasaja-os-dev-postgres` | PASS |
| Baseline count DB dev | handbook_categories=1, handbook_item_versions=1, handbook_items=1, learning_paths=1, lesson_progress=0, lesson_versions=1, lessons=1, project_milestones=1, project_tasks=1, projects=1, sessions=0 | PASS |
| `pg_dump -Fc` | Dump dibuat: `backups/jasasaja_os_dev_20261126T082603Z.dump` (~25K) | PASS |
| SHA256 checksum | `sha256sum -c ...dump.sha256` => OK | PASS |
| Restore ke scratch DB | `createdb jasasaja_os_restore_drill`; `pg_restore --no-owner --no-privileges` exit 0 | PASS |
| Count match scratch vs baseline | Identik untuk 11 tabel | PASS |
| FK check (public) | 8 foreign keys hadir | PASS |
| PK check (public+drizzle) | 12 primary keys hadir (termasuk drizzle migrations table) | PASS |
| Approved partial unique indexes | `handbook_item_versions_one_approved_uidx`, `lesson_versions_one_approved_uidx` hadir | PASS |
| Cleanup scratch DB | `dropdb jasasaja_os_restore_drill`; verifikasi tidak ada DB bernama itu | PASS |
| `git check-ignore` backup | `/backups/` diabaikan oleh `.gitignore` | PASS |
| `git diff --check` | Pass | PASS |

## 6. Acceptance Criteria (P0.5-02)
| Kriteria | Status | Catatan |
|---|---|---|
| Langkah backup `pg_dump`, export JSON/Markdown, dan restore ke database scratch tertulis | Terpenuhi sebagian | `pg_dump` + restore scratch terdokumentasi; export JSON/Markdown aplikasi belum ada endpoint (rencana ADR-006/OD-004). |
| Frekuensi, retensi, lokasi penyimpanan, dan penanganan secret backup ditetapkan | Terpenuhi | Sesuai OD-006. |
| Restore drill minimal dilakukan sekali pada lingkungan non-production dengan hasil tercatat | Terpenuhi | Scratch DB lokal, hasil tercatat di laporan ini. |

## 7. Risks & Limitations
- Artefak dump lokal ada di `./backups/` (gitignored) dan berisi data dev; perlakukan sebagai sensitif.
- Drill hanya membuktikan restore untuk snapshot dev saat ini; belum mencakup skenario kegagalan parsial/korupsi/Neon.
- Export portabel domain (JSON/Markdown) belum diimplementasikan.
- Host tanpa pg client; prosedur bergantung pada docker compose/container tools.

## 8. Documentation
- `docs/backup-and-recovery.md`
- `docs/phase-0-backlog.md` (P0.5-02)
- `docs/adr-status.md`, `docs/adr/ADR-005-hosting-and-deployment.md` (OD-002 decision record)
- Laporan ini

## 9. Git Status
- **Branch:** `main`
- **HEAD:** `76cede7`
- **Working tree:** dirty/uncommitted; pre-existing changes tetap ada. Step ini menambah docs backup, update .gitignore, update ADR/backlog.
- **`git diff --check`:** PASS

## 10. Recommendation
**STOP — menunggu instruksi eksplisit.** P0.5-03 (exit review/sign-off) masih BLOCKED: perlu evidence refresh laporan exit, CI remote masih NOT VERIFIED (belum push), pemeriksaan browser/a11y/responsive manual belum diberi status final, dan **persetujuan tertulis eksplisit pengguna** untuk masuk Phase 1 belum diberikan. OD-002 sudah Approved tapi memiliki constraint implementasi Fastify-on-Vercel yang harus ditangani pada slice deploy terpisah.