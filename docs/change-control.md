# Aturan Change Control

- **Status:** Final — P0.1-03
- **Tanggal:** 2026-11-24
- **Sumber:** Master Blueprint v1.1 §12, Development Roadmap v1.1 §9/§11, PRD MVP v1.1 NFR-08/§14, backlog P0.1-03.
- **Batasan:** Aturan ini mengatur cara mengusulkan dan menyetujui perubahan. Tidak menambah scope MVP, tidak menciptakan layanan/akun, dan tidak memberi izin implementasi Phase 0.

## 1. Prinsip

1. Blueprint v1.1 adalah dokumen induk; PRD, roadmap, ADR, dan backlog harus tetap konsisten dengannya.
2. Satu active phase dan satu active vertical slice pada satu waktu.
3. Ide baru masuk **Future Ideas** terlebih dahulu, diberi label `Must`, `Should`, `Could`, atau `Won't now`, lalu dinilai ulang. Tidak ada perubahan scope secara diam-diam.
4. Setiap perubahan harus memiliki alasan, dampak, bukti verifikasi, dan cara rollback.
5. Persetujuan arsitektur/stack bukan izin implementasi, bukan izin biaya, dan bukan izin deployment produksi.
6. Keputusan penting dicatat di ADR atau decision register; riwayat dan alasan tidak dihapus.

## 2. Gate persetujuan

| Jenis perubahan | Contoh | Gate wajib | Catatan |
|---|---|---|---|
| Scope MVP | Modul/fitur baru, mengubah non-goal, menaikkan prioritas `Could` menjadi `Must` | Persetujuan eksplisit pengguna + update dokumen acuan bila perlu | Evaluasi dampak ke Blueprint/PRD/roadmap sebelum dikerjakan |
| Prioritas & backlog | Label `Must/Should/Could/Won't now`, perpindahan ke sprint aktif | Pencatatan alasan + persetujuan pengguna bila mengubah scope | `Won't now` masuk Future Ideas, bukan implementasi diam-diam |
| Biaya & layanan | Upgrade paid tier, API berbayar, hosting berbayar, kartu kredit provider | Persetujuan eksplisit tertulis | Target awal Rp0/bulan; Neon Free sudah disetujui, tetapi tidak ada akun yang dibuat |
| Deployment produksi/online | Aktivasi domain/hosting, deploy ke online, TLS, konfigurasi produksi | Persetujuan eksplisit + deployment checklist + rollback plan | Model hybrid sudah disetujui; detail hosting masih OD-002 |
| Penghapusan data / destructive | `DROP`, `DELETE` massal, cascade delete, reset database, overwrite konten | Persetujuan eksplisit + backup terverifikasi + dump sebelum perubahan | Jangan menimpa backup terakhir yang valid |
| Arsitektur & dependency | ADR baru, supersede ADR, dependency/domain baru | ADR/decision register + persetujuan bila berdampak arsitektur | Tidak ada dependency baru tanpa kebutuhan yang terbukti |
| Status konten editorial | Draft → Approved, versi handbook/lesson baru | Tunduk pada ADR-007 yang masih `Proposed` | Jangan auto-approve oleh import atau AI |
| Konfigurasi aplikasi | Environment, migration, script, CI | Tinjau diff + verifikasi terkait | Tidak ada secret di file atau log |

Gate "persetujuan eksplisit" berarti pengguna menyatakan setuju secara tertulis dalam sesi/instruksi, bukan sekadar rekomendasi asisten atau asumsi dari dokumen perencanaan.

## 3. Alur perubahan

1. **Catat permintaan** --- tulis sumber ide, alasan, dan label prioritas di backlog atau Future Ideas.
2. **Analisis dampak** --- sebutkan file/domain terdampak, risiko, biaya, kebutuhan ADR, dan apakah scope MVP berubah.
3. **Tentukan gate** --- cocokkan dengan tabel di atas. Bila ragu, anggap memerlukan persetujuan eksplisit.
4. **Minta persetujuan** --- untuk gate bertanda eksplisit, tunggu konfirmasi pengguna sebelum mengubah kode, konfigurasi, data, atau layanan.
5. **Implementasi satu slice kecil** --- gunakan [`task-template.md`](./task-template.md) dan checklist Definition of Done.
6. **Verifikasi & laporan** --- jalankan pemeriksaan relevan, periksa diff, gunakan [`report-template.md`](./report-template.md) untuk melaporkan hasil dan risiko sebelum melanjutkan.
7. **Rekam keputusan** --- perbarui README, ADR/decision register, backlog, atau dokumentasi terkait bila status berubah.

## 4. Hubungan dengan dokumen lain

- `docs/task-template.md` --- field wajib dan checklist DoD untuk setiap slice.
- `docs/report-template.md` --- format laporan hasil, verifikasi, risiko, dan langkah lanjutan.
- `docs/adr-status.md` --- status keputusan dan Open Decisions yang belum disetujui.
- `docs/phase-0-backlog.md` --- urutan task dan status pengerjaan.
- `README.md` bagian Kontribusi dan Perubahan --- ringkasan aturan untuk pembaca cepat.

Dokumen ini tidak menggantikan ADR. Bila perubahan menyangkut keputusan arsitektur, ADR baru atau revisi ADR tetap dibuat dengan alasan dan riwayat yang terjaga.
