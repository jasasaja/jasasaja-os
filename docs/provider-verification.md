# Verifikasi Provider — PostgreSQL & Hosting

- **Status:** Desk research; **Neon Free disetujui 2026-11-24**, tetapi **bukan aktivasi layanan**
- **Tanggal akses:** 2026-11-24
- **Sumber:** halaman pricing/dokumentasi resmi masing-masing provider (tautan di bawah)
- **Batasan:** Harga, kuota, dan kebijakan dapat berubah. Angka di bawah adalah kondisi yang terbaca pada tanggal akses dan wajib diverifikasi ulang sebelum keputusan final atau aktivasi. Tidak ada akun dibuat, kredensial disimpan, atau layanan berbayar diaktifkan.

## 1. Ringkasan hasil

| Provider | Model | Free tier yang terbaca | Batasan penting | Kecocokan untuk JASASAJA | Lock-in | Aktivasi |
|---|---|---|---|---|---|---|
| **Neon** | Managed Postgres serverless | $0 permanen, tanpa kartu; 100 CU-hours/project/bulan; 1 GB/project, total 20 GB; 5 GB egress/project | Scale-to-zero setelah 5 menit; habis kuota → compute suspend / write diblokir, data tidak dihapus; scheduled snapshot hanya berbayar; history 6 jam | **Paling cocok** sebagai DB online dengan target Rp0/bulan | Rendah — Postgres standar, `pg_dump` portabel | **Tidak dilakukan** |
| **Supabase** | Managed Postgres + ekosistem | $0; 500 MB DB; 2 project aktif; 5 GB egress | Project di-pause setelah 1 minggu tidak aktif; tidak ada automatic backup pada Free | Alternatif; kapasitas kecil dan risiko pause | Sedang — Postgres standar, tetapi ekosistem Supabase | **Tidak dilakukan** |
| **Render** | PaaS: static site, web service, Postgres | Static site gratis; web service Free 512 MB; Postgres Free $0/1 GB | Web service spin-down setelah 15 menit (±1 menit spin-up), 750 instance-hours/bulan; Postgres Free **expired 30 hari**, grace 14 hari lalu dihapus, **tanpa backup**, tanpa connection pooling; logical export hanya untuk instance berbayar | Static site cocok; **Postgres Free tidak layak** sebagai DB utama | Sedang | **Tidak dilakukan** |
| **Fly.io** | Machine + Managed Postgres | Personal org: $1 tanpa kartu, $5/bulan usage dengan kartu | Machine terkecil $2,19/bulan always-on; Managed Postgres Developer $4/bulan; contoh app+DB ≈ $43,67/bulan | Cadangan bila diperlukan multi-region; bukan jalur Rp0 | Rendah–sedang | **Tidak dilakukan** |
| **Hetzner Cloud** | VPS/container host | Tidak ada free tier | Regular Performance mulai €5,49/bulan excl. VAT; Cost-Optimized €5,99/bulan excl. VAT; Postgres, TLS, dan backup dikelola sendiri | Alternatif kontrol penuh; memerlukan persetujuan biaya | Rendah | **Tidak dilakukan** |

## 2. Detail verifikasi per provider

### 2.1 Neon — opsi utama untuk database online

Sumber: `https://neon.com/pricing` (halaman menyatakan "Last updated: 2026-11-04", diakses 2026-11-24).

Temuan yang relevan:

- Free plan bersifat **permanen**, bukan trial, dan **tidak memerlukan kartu kredit**.
- 100 project per akun; 100 CU-hours per project per bulan; autoscaling sampai 2 CU; storage 1 GB per project dan 20 GB total akun.
- Scale-to-zero setelah 5 menit dan tidak bisa dimatikan pada Free; tidak ada pause karena inaktivitas.
- Jika kuota CU-hours/egress habis, compute ditangguhkan sampai siklus berikutnya; jika storage penuh, write diblokir. **Data tidak dihapus**.
- Egress publik 5 GB per project per bulan; riwayat 6 jam (batas 1 GB); **scheduled snapshot tidak tersedia** pada Free.
- Paid Launch mulai usage-based; contoh beban intermittent ≈ $15/bulan.

Implikasi: cocok untuk target Rp0/bulan. Karena scheduled snapshot tidak tersedia, strategi `pg_dump` + export JSON pada ADR-008 tetap diperlukan. Perlu dicatat pula bahwa kuota 1 GB cukup untuk MVP berbasis teks, tetapi harus dipantau bila later ada lampiran/gambar.

### 2.2 Supabase — alternatif database

Sumber: `https://supabase.com/pricing` (diakses 2026-11-24).

Temuan: Free $0, 500 MB database per project, 2 project aktif, 5 GB egress, 1 GB file storage, **project di-pause setelah 1 minggu tidak aktif**, dan **automatic backups tidak termasuk** pada Free. Pro mulai $25/bulan + compute (Micro $10/bulan, tertutup $10 kredit); PITR $100/bulan per 7 hari retensi.

Implikasi: lebih sempit dan lebih berisiko untuk konten yang jarang diakses dibanding Neon. Dapat dipakai sebagai cadangan bila kebijakan pause dapat diterima dan volume tetap kecil.

### 2.3 Render — static/web hosting; Postgres Free hanya untuk uji

Sumber: `https://render.com/pricing` dan `https://render.com/docs/free#free-postgres` (diakses 2026-11-24).

Temuan:

- Static site gratis; web service Free 512 MB RAM dengan 750 instance-hours/bulan, 5 GB bandwidth, dan spin-down setelah 15 menit idle dengan spin-up ±1 menit.
- Postgres Free: 1 GB, **expired 30 hari setelah dibuat**, grace 14 hari, lalu **database dan seluruh data dihapus**; tidak mendukung backup maupun managed connection pooling; logical exports hanya untuk instance berbayar.
- Postgres berbayar mulai $6/bulan (0,1 CPU / 256 MB); web service berbayar mulai $7/bulan (0,5 CPU / 512 MB) atau $25/bulan (1 CPU / 2 GB).

Implikasi: Render cocok untuk static `dist/` dan mungkin untuk API development/preview, tetapi **Postgres Free-nya tidak boleh dijadikan penyimpanan utama** karena masa kedaluwarsa dan ketiadaan backup. bila API memakai Render Free, cold start ±1 menit perlu diterima atau di-upgrade ke paid.

### 2.4 Fly.io — cadangan, bukan jalur Rp0

Sumber: `https://fly.io/docs/about/pricing/` (diakses 2026-11-24).

Temuan: personal organization mendapat $1 kredit tanpa kartu, atau $5/bulan usage dengan kartu; Machine terkecil $2,19/bulan always-on; volume $0,15/GB/bulan; Managed Postgres Developer $4/bulan; contoh small web app + Managed Postgres ≈ $43,67/bulan.

Implikasi: fleksibel secara regional, tetapi biaya aktual melebihi target Rp0/bulan kecuali kredit free mencukupi. Tidak dipilih sebagai opsi utama saat ini.

### 2.5 Hetzner Cloud — VPS murah, bukan gratis

Sumber: `https://www.hetzner.com/cloud/` (diakses 2026-11-24).

Temuan: Regular Performance mulai €5,49/bulan excl. VAT dan Cost-Optimized mulai €5,99/bulan excl. VAT; tidak ada free tier; tersedia firewall, private network, image, dan one-click Docker/Coolify. Lokasi termasuk Jerman, Finlandia, Singapura, dan AS.

Implikasi: kontrol penuh dan biaya rendah, tetapi memerlukan persetujuan biaya serta operasi sendiri untuk PostgreSQL, TLS, dan backup. Bukan pilihan saat ini karena target biaya awal Rp0/bulan.

## 3. Rekomendasi hasil verifikasi

1. **Development:** PostgreSQL lokal via Docker Compose — Rp0, data tidak bergantung pada provider.
2. **Online database:** **Neon Free** telah disetujui pengguna pada 2026-11-24; kuota dipantau dan `pg_dump`/export tetap diperlukan (ADR-008). Tidak ada akun/project yang dibuat.
3. **Online frontend:** static site gratis (misalnya Render static site) dapat langsung menyajikan `dist/`, tetapi provider/hosting final masih OD-002.
4. **Online API:** untuk menjaga biaya Rp0, web service Free (misalnya Render) memiliki cold start ±1 menit dan batas 750 jam/bulan; bila tidak dapat diterima, diperlukan persetujuan biaya. **Belum ada keputusan hosting yang diambil.**
5. **Tidak dipilih sekarang:** Render Free Postgres sebagai DB utama, Supabase karena pause/500 MB, Fly.io/Hetzner karena biaya aktual.

## 4. Open items yang belum terverifikasi

- Metode pembayaran lokal, mata uang, pajak/VAT, dan kemampuan tagihan dari Indonesia — belum diverifikasi untuk semua provider.
- Lokasi/data residency region dan implikasi privasi untuk data pribadi pemilik — belum diputuskan.
- Stabilitas jangka panjang free tier (kuota dapat berubah kapan saja) — perlu dicek ulang sebelum aktivasi.
- Kompatibilitas `pg_dump` dari Neon/Supabase ke PostgreSQL lokal untuk restore drill — belum diuji karena database belum dibuat.

## 5. Pernyataan aktivasi

Dokumen ini hanya mencatat hasil verifikasi publik. Tidak ada akun, project database, domain, kartu, atau layanan berbayar yang dibuat atau diaktifkan. Keputusan ADR-003/ADR-005 untuk Neon Free dan Rp0/bulan sudah diambil, tetapi aktivasi tetap memerlukan instruksi eksplisit dari pengguna.
