# ADR-001: Application Architecture

- **Status:** **Accepted** (arsitektur disetujui pengguna 2026-11-24; rincian struktur folder internal tetap **Proposed**)
- **Tanggal:** 2026-11-24
- **Sumber:** Brief Phase 0.1 & 0.2, persetujuan arsitektur 2026-11-24, Master Blueprint v1.1 §8/§10 (Approved), Development Roadmap v1.1 §3.

## Konteks

JASASAJA Personal OS melayani satu pemilik dengan tiga domain inti (Learning Center, Engineering Handbook, Project Workspace) dan aplikasi shell yang sudah berjalan. Blueprint menetapkan arah Modular Monolith dalam satu aplikasi dan repository, dengan non-goal microservices, package terpisah, multi-tenant, dan workflow builder generik. Pengguna mengonfirmasi kembali arsitektur ini dalam brief Phase 0.1 & 0.2.

## Keputusan

Aplikasi dibangun sebagai **Modular Monolith** di **satu repository**. Domain awal: `learning`, `handbook`, `projects`, dan `shared/core`. Batas modul dijaga melalui struktur folder dan kontrak internal, bukan melalui service terpisah. Relasi antar-modul memakai referensi eksplisit (ID), bukan impor ke lapisan internal modul lain. Satu proses API melayani semua domain; frontend tetap merupakan aplikasi React yang sama dengan backend di repo yang sama.

### Status turunan

| Keputusan | Status | Keterangan |
|---|---|---|
| Modular Monolith, bukan microservices | **Accepted** | Dikonfirmasi pengguna dan Blueprint |
| Satu repository untuk frontend + backend | **Accepted** | Dikonfirmasi pengguna |
| Domain `learning`, `handbook`, `projects`, `shared/core` | **Accepted** | Sesuai Blueprint §8 |
| Tidak ada multi-tenant dan tim pada MVP | **Accepted** | Dikonfirmasi pengguna |
| Tidak ada offline synchronization pada MVP | **Accepted** | Dikonfirmasi pengguna |
| Tidak ada AI Assistant internal pada MVP | **Accepted** | Dikonfirmasi pengguna |
| Susunan folder backend dan kontrak antar-modul | **Proposed** | Perlu persetujuan sebelum dibuat |
| Pemisahan menjadi workspace/package terpisah | **Rejected** | Tidak dibutuhkan MVP; menambah kompleksitas |

## Opsi yang dipertimbangkan

| Opsi | Status | Alasan |
|---|---|---|
| Modular Monolith satu repo | **Accepted** | Sesuai skala single-user, satu database, dan kemampuan onboarding solo developer |
| Microservices | **Rejected** | Overhead operasional dan deployment tanpa manfaat untuk satu pengguna |
| Multi-repo / package terpisah | **Rejected** | Menambah koordinasi versi tanpa kebutuhan yang terbukti |
| Micro-kernel plugin architecture | **Rejected** | Spekulatif; melanggar prinsip Progressive Complexity |

## Konsekuensi

**Positif:** satu codebase, satu proses, transaksi database sederhana, debugging mudah, dan deploy lokal dapat dilakukan tanpa orkestrasi.

**Negatif:** disiplin batas modul harus dijaga manual; pertumbuhan jangka panjang dapat memerlukan refactor batas modul bila domain menjadi besar.

## Risiko

- Modul saling mengimpor detail internal sehingga batas mereka kabur.
- Relasi lintas modul berubah menjadi coupling era langsung.
- Mitigasi: tinjau diff setiap slice; hanya ekspor kontrak publik per modul; uji relasi lintas modul pada Phase 4.

## Verifikasi saat implementasi

- Struktur folder sesuai empat domain yang disepakati.
- Tidak ada impor lintas modul ke file internal; hanya ke kontrak publik atau `shared/core`.
- Test relasi `lesson ↔ handbook ↔ project` lulus tanpa dead link.

## Rollback

Keputusan ini bersifat struktural. Perubahan struktur folder dapat dikembalikan melalui Git sebelum rilis; setelah data diproduksi, rollback hanya berupa reorganisasi kode tanpa mengubah data.
