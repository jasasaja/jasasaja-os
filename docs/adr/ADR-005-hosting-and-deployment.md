# ADR-005: Hosting and Deployment

- **Status:** **Accepted** untuk model hybrid, target Rp0/bulan, dan pilihan hosting OD-002 (dengan constraint implementasi)
- **Tanggal:** 2026-11-24
- **Diperbarui:** 2026-11-26 — OD-002 disetujui pengguna: frontend Vercel Free, API di Vercel, DB Neon Free, domain default, Rp0/bulan.
- **Sumber:** Brief Phase 0.1 & 0.2 (deployment hybrid), persetujuan Neon Free/budget 2026-11-24, Master Blueprint v1.1 §8/§9, PRD MVP v1.1 NFR-08, persetujuan OD-002 2026-11-26.

## Konteks

Pengguna menyetujui model deployment **hybrid**: pengembangan lokal tetap menjadi mode utama, dengan target deployment online tanpa menghilangkan kemampuan lokal. Blueprint menargetkan biaya operasi awal **Rp0/bulan** dan pengguna menetapkan **Neon Free** sebagai database online. Provider hosting, region, dan domain belum dipilih; tidak ada akun, project, atau layanan berbayar yang dibuat dalam task dokumentasi ini.

## Keputusan

Pertahankan pengembangan lokal sebagai jalur utama: frontend Vite `:3000`, API `:3001`, proxy `/api`, dan PostgreSQL lokal. Untuk online, OD-002 disetujui pengguna 2026-11-26: **frontend Vercel Free, API di Vercel, DB Neon Free, domain default, Rp0/bulan**. 

**Constraint penting (harus dicatat):** backend saat ini adalah **Fastify proses Node long-running** (`server/src/server.ts`, listen pada port). Vercel umumnya menjalankan frontend static dan serverless functions; menjalankan Fastify long-running apa adanya tidak langsung cocok. Sebelum aktivasi/deploy, diperlukan slice implementasi terpisah yang memutuskan dan memverifikasi strategi: mis. adapter/serverless entrypoint untuk Vercel Functions, atau penyesuaian arsitektur deploy yang disetujui. Keputusan ini **tidak** berarti deploy sudah dilakukan atau arsitektur sudah diubah. Tidak ada akun/layanan berbayar dibuat.

### Status turunan

| Keputusan | Status | Keterangan |
|---|---|---|
| Deployment hybrid: lokal + target online | **Accepted** | Dikonfirmasi pengguna |
| Lokal tetap dapat dijalankan penuh | **Accepted** | Dikonfirmasi pengguna |
| Provider database online: Neon Free | **Accepted** | Disetujui pengguna 2026-11-24 |
| Target biaya Rp0/bulan | **Accepted** | Dikonfirmasi pengguna |
| Frontend hosting: Vercel Free | **Accepted (OD-002, 2026-11-26)** | Domain default; belum diaktifkan |
| Hosting API: Vercel | **Accepted (OD-002, 2026-11-26, constraint)** | Butuh adaptasi Fastify long-running ke model Vercel (serverless/entrypoint) sebelum deploy; belum diimplementasikan |
| Region/env/secrets deploy final | **Proposed** | Detail operasional saat slice deploy; secrets hanya di dashboard/env provider |
| Tidak mengaktifkan layanan berbayar tanpa persetujuan | **Accepted** | Dikonfirmasi pengguna dan Blueprint |
| Serverless penuh | **Rejected** | Kompleksitas tanpa manfaat untuk beban single-user |
| Hanya lokal, tanpa target online | **Rejected** | Bertentangan dengan model hybrid yang dikonfirmasi |

## Opsi yang dipertimbangkan

| Opsi | Kompleksitas | Biaya | Single-user | Dev lokal | Deployment | Lock-in | Status |
|---|---|---|---|---|---|---|---|
| VPS/container + reverse proxy + Neon Free | Sedang | Rendah–Sedang | Baik | Baik | Cukup | Rendah | **Proposed** (detail hosting terbuka) |
| PaaS + Neon Free | Rendah | Sedang | Baik | Baik | Baik | Sedang | **Proposed** (alternatif) |
| Serverless penuh | Tinggi | Sedang–Tinggi | Cukup | Cukup | Cukup | Tinggi | **Rejected** |
| Lokal saja | Rendah | Rendah | Baik | Baik | Buruk | Rendah | **Rejected** |

## Catatan verifikasi provider (2026-11-24)

Desk research (tanpa aktivasi layanan): Neon Free telah disetujui sebagai database online Rp0/bulan. Static site Render gratis tersedia untuk frontend; web service Render Free 512 MB memiliki spin-down setelah 15 menit idle (±1 menit spin-up) dan batas 750 instance-hours/bulan. Supabase Free memiliki risiko pause. Fly.io (contoh app+DB ≈ $43,67/bulan) dan Hetzner Cloud (mulai €5,49/bulan excl. VAT) memerlukan persetujuan biaya. Rincian dan sumber: [`docs/provider-verification.md`](../provider-verification.md). Status ADR ini tetap **Proposed** untuk topologi/hosting online; tidak ada akun, project, atau layanan yang dibuat.

## Konsekuensi

**Positif:** satu codebase untuk lokal dan online, tidak ada SSR yang dipaksakan, dan biaya dapat dijaga dengan free tier yang diverifikasi.

**Negatif:** perlu dokumentasi deployment dan TLS; host/VPS memerlukan perawatan dasar (update, backup, monitoring minimal).

## Risiko

- Kuota Neon Free berubah/habis → mitigasi: verifikasi ulang sebelum aktivasi, pantau 1 GB/100 CU-hours, dan sediakan dump portabel.
- Port/konfigurasi lokal berbeda dari online → mitigasi: environment variable terpusat dan health check.
- Cookie/CSRF gagal online karena skema berbeda → mitigasi: pengujian dengan `APP_BASE_URL` yang sebenarnya.

## Verifikasi saat implementasi

- Aplikasi dapat dijalankan lokal hanya dari README yang diperbarui.
- `dist/` dan `/api` keduanya terlayani pada satu origin saat online.
- Health check merespons dan TLS aktif sebelum data penting disimpan.

## Rollback

Simpan image/container terakhir yang berhasil dan dump database sebelum deploy. Rollback berupa pengembalian image serta restore dump; jangan menghapus data produksi tanpa konfirmasi.

## Riwayat perubahan

- 2026-11-24: draft awal; hybrid/Neon Free/Rp0 diterima, detail hosting online tetap Proposed.
- 2026-11-26: OD-002 disetujui pengguna — frontend Vercel Free, API di Vercel, DB Neon Free, domain default, Rp0/bulan. Dicatat constraint: backend Fastify long-running saat ini butuh adaptasi deploy ke Vercel; belum diimplementasikan.
