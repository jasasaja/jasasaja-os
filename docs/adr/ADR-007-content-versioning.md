# ADR-007: Content Versioning

- **Status:** **Accepted** — OD-005 disetujui 2026-11-25 (B1: append-only version rows, approve eksplisit owner)
- **Tanggal:** 2026-11-24
- **Diperbarui:** 2026-11-25 — persetujuan tertulis pengguna untuk OD-005 (B1).
- **Sumber:** Master Blueprint v1.1 §7/§8 (OD-005, Approved), PRD MVP v1.1 FR-H05/§8/§13, Development Roadmap v1.1 §5, persetujuan OD-005 2026-11-25.

## Konteks

Handbook harus mencatat perubahan standar dengan version, change note, status `Draft`/`Approved`/`Deprecated`, dan tanggal; ini masuk prioritas Should pada PRD. Lesson juga memiliki `version` dan `verification status` dalam provenance. Open question PRD menanyakan siapa/apa yang boleh mengubah item dari Draft menjadi Approved. Karena hanya ada satu pemilik, approval dapat menjadi keputusan eksplisit pemilik, bukan otomatis dari AI atau import. P0.1-02 tidak menetapkan aturan akhir untuk OD-005; status ADR ini tetap `Proposed`.

## Keputusan

Gunakan model **baris versi append-only** untuk handbook item dan lesson: setiap perubahan dibuat sebagai baris/record baru dengan `version`, `status` (`Draft`/`Approved`/`Deprecated`), `change_note`, `created_at`/`updated_at`, dan owner editorial. Versi `Approved` terbaru yang ditampilkan sebagai standar aktif; `Draft` diberi label jelas dan tidak diperlakukan sebagai standar. Status `Deprecated` tetap dapat dibaca sebagai riwayat. **Hanya pemilik yang dapat melakukan transisi `Draft → Approved` melalui aksi eksplisit** (bukan otomatis oleh import/AI). Lesson mentautkan versi konten ke data provenance sesuai ADR-006.

**OD-005 (disetujui 2026-11-25, pilihan B1):** append-only version rows disetujui; approve eksplisit owner disetujui. Implementasi schema/migrasi/endpoint belum dibuat.

### Status turunan

| Keputusan | Status | Keterangan |
|---|---|---|
| Field `version`, `status`, `change_note`, tanggal | **Accepted sebagai requirement** | PRD FR-H05 dan Blueprint §7 |
| Riwayat append-only, bukan overwrite | **Accepted — OD-005 (B1)** | Disetujui pengguna 2026-11-25 |
| Draft/Approved/Deprecated sebagai status standar | **Accepted sebagai requirement** | Blueprint §6/§7, PRD §8 |
| Approval eksplisit oleh pemilik | **Accepted — OD-005 (B1)** | Disetujui pengguna 2026-11-25; bukan otomatis import/AI |
| UI riwayat versi lengkap | **Proposed (Should)** | Dapat menyusul; MVP cukup lihat versi aktif |
| Auto-approve oleh import atau AI | **Rejected** | Melanggar Human as Decision Maker |
| Git-style branching/merge untuk konten | **Rejected** | Berlebihan untuk single-user MVP |
| Overwrite tanpa riwayat | **Rejected** | Menghilangkan jejak perubahan standar |

## Opsi yang dipertimbangkan

| Opsi | Kompleksitas | Biaya | Single-user | Dev lokal | Deployment | Lock-in | Status |
|---|---|---|---|---|---|---|---|
| Append-only versi + status eksplisit | Sedang | Rendah | Baik | Baik | Baik | Rendah | **Proposed** (utama) |
| Overwrite in-place + kolom `version` | Rendah | Rendah | Cukup | Baik | Baik | Rendah | **Rejected** — kehilangan riwayat |
| Event sourcing penuh | Tinggi | Rendah | Buruk | Sedang | Sedang | Sedang | **Rejected** |
| Git sebagai penyimpanan versi konten | Sedang | Rendah | Cukup | Sedang | Sedang | Rendah | **Rejected** — integrasi rumit |

## Konsekuensi

**Positif:** jejak perubahan dapat ditinjau, standar yang belum disetujui tidak disalahartikan, dan restore dapat memilih versi tertentu.

**Negatif:** skema dan query sedikit lebih kompleks; perlu aturan jelas tentang versi aktif dan tampilan default.

## Risiko

- Duplikat versi aktif karena dua baris berstatus Approved → mitigasi: constraint unik per item untuk status Approved aktif.
- Draft tidak sengaja dipakai project template → mitigasi: filter status pada endpoint dan UI.
- Riwayat membengkak → mitigasi: pagination/filter sesuai NFR-03.

## Verifikasi saat implementasi

- Perubahan standar menghasilkan versi baru dengan change note.
- Hanya satu versi Approved aktif per item.
- Draft dan Deprecated diberi label dan tidak dipakai sebagai standar aktif.
- Transisi status hanya dapat dilakukan oleh owner yang terautentikasi.

## Rollback

Sebelum perubahan status/versi, simpan versi sebelumnya. Rollback berupa penandaan versi baru sebagai `Deprecated` atau `Draft` dan mengembalikan status `Approved` ke versi sebelumnya; jangan menghapus baris riwayat.
