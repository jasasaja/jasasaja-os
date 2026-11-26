# Template Task & Checklist Definition of Done

- **Status:** Final — P0.1-03; diperluas pada P0.2-03
- **Tanggal:** 2026-11-24; diperbarui 2026-11-25
- **Sumber:** Development Execution Roadmap v1.1 §9/§11, PRD MVP v1.1 §14, Master Blueprint v1.1 §12, backlog P0.1-03 dan P0.2-03.
- **Batasan:** Dokumen ini menyeragamkan cara menulis task. Tidak menambah scope MVP, tidak mengubah status ADR, dan tidak memberi izin implementasi.

## 1. Field wajib setiap task

Gunakan field ini untuk setiap slice kecil. Status task dicatat di backlog; format laporan penyelesaian ada di [`report-template.md`](./report-template.md). Jangan duplikasi isi laporan di dalam template task.

| Field | Isi yang harus diisi | Wajib |
|---|---|---|
| Phase / Slice | Fase dan nama slice aktif, misalnya `P0.1-03` | Ya |
| Goal / Outcome | Hasil konkret yang ingin dicapai, bukan aktivitas umum | Ya |
| Alasan / Why now | Mengapa slice ini diperlukan sekarang | Ya |
| Priority label | `Must`, `Should`, `Could`, atau `Won't now` | Ya |
| Scope / In-scope | Batas pekerjaan yang dikerjakan pada slice ini | Ya |
| Non-scope | Hal yang sengaja tidak dikerjakan untuk mencegah scope creep | Ya |
| Acceptance criteria | Dapat diperiksa/diuji; hindari kata "baik" tanpa ukuran | Ya |
| Files / areas affected | File atau domain yang akan disentuh | Ya |
| Dependencies | Task/keputusan yang harus selesai lebih dulu | Ya |
| Verification plan | Perintah, pemeriksaan manual, dan bukti hasil | Ya |
| Risks / assumptions | Risiko, asumsi, dan keputusan yang belum final | Ya |
| Rollback consideration | Cara membatalkan perubahan tanpa merusak data | Ya |
| Definition of Done | Checklist di bawah, lengkap dengan tanda `N/A` bila relevan | Ya |

Aturan tambahan dari roadmap §9: satu active phase dan satu active vertical slice pada satu waktu. Ide baru masuk **Future Ideas** terlebih dahulu, bukan langsung ke sprint aktif.

## 2. Checklist Definition of Done — per task

Checklist ini berasal dari roadmap §11 dan PRD §14. Terapkan **semua item yang relevan**. Untuk task dokumentasi/perencanaan, item teknis boleh ditandai `N/A` **dengan alasan tertulis**; jangan menghapus item dari checklist.

- [ ] Acceptance criteria task terpenuhi.
- [ ] Input divalidasi dan error handling jelas.
- [ ] Authorization server-side diperiksa untuk data privat.
- [ ] Test relevan ditambahkan/diubah dan lulus.
- [ ] Loading, empty, error, dan success states ditangani bila ada perubahan UI/API.
- [ ] `lint`, `typecheck`, dan `build` lulus bila dikonfigurasi dan tersentuh.
- [ ] Tidak ada secret atau data sensitif di diff/log.
- [ ] Dokumentasi dan migration diperbarui bila diperlukan.
- [ ] Diff ditinjau; risiko dan cara rollback diketahui.
- [ ] Backup tersedia untuk perubahan berisiko (lihat ADR-008 yang masih `Proposed`).

Commit/checkpoint dibuat hanya setelah checklist lengkap. Untuk task dokumentasi seperti P0.1-01 sampai P0.2-03, pemeriksaan yang dipakai adalah `git diff --check`, tinjauan diff, dan konsistensi antar-dokumen; test/build dapat ditandai `N/A`.

## 3. Contoh task terisi — P0.1-03

| Field | Isi |
|---|---|
| Phase / Slice | `P0.1-03` — Finalisasi Definition of Done dan change control |
| Goal / Outcome | Checklist DoD dan aturan persetujuan perubahan tersedia dan dipakai sebagai acuan task berikutnya. |
| Alasan / Why now | P0.1-01 dan P0.1-02 selesai; task berikutnya memerlukan kriteria selesai dan gate perubahan yang seragam. |
| Priority label | `Must` |
| Scope / In-scope | Menyamakan field task, checklist DoD, label prioritas, dan aturan change control. |
| Non-scope | Implementasi kode, dependency, database, perubahan status ADR, dan task di luar P0.1-03. |
| Acceptance criteria | Template task memuat seluruh field wajib termasuk scope/non-scope; label Must/Should/Could/Won't now dan Future Ideas konsisten; aturan scope/biaya/deployment produksi/penghapusan data tertulis. |
| Files / areas affected | `docs/task-template.md`, `docs/change-control.md`, `docs/README.md`, `docs/adr-status.md`, `docs/phase-0-backlog.md`, `README.md`. |
| Dependencies | P0.1-01. P0.1-02 selesai sebagai konteks keputusan, bukan dependency teknis. |
| Verification plan | Tinjau contoh task di atas; cocokkan checklist dengan roadmap §11/PRD §14; jalankan `git diff --check`; pastikan tidak ada perubahan kode/dependency/konfigurasi/database. |
| Risks / assumptions | DoD terlalu berat untuk slice kecil; aturan tidak dipraktikkan. Mitigasi: `N/A` beralasan dan referensi langsung dari README. |
| Rollback consideration | Revisi dokumen untuk menyederhanakan checklist; tidak ada perubahan data atau scope yang perlu dibatalkan. |
| Definition of Done | Acceptance criteria terpenuhi; validasi/auth/test/UI `N/A` (dokumentasi, tanpa kode); tidak ada secret di diff; dokumentasi diperbarui; diff ditinjau; rollback diketahui. |

## 4. Label prioritas dan Future Ideas

- `Must` --- wajib untuk slice aktif atau exit criteria fase saat ini.
- `Should` --- penting, tetapi boleh menyusul dalam fase yang sama bila `Must` selesai.
- `Could` --- opsional; hanya dikerjakan bila tidak mengorbankan `Must`/`Should`.
- `Won't now` --- sengaja ditunda pada kondisi saat ini; bukan penolakan permanen.
- **Future Ideas** --- tempat ide baru dicatat sebelum dinilai ulang; tidak otomatis masuk sprint aktif.

Detail gate persetujuan ada di [`change-control.md`](./change-control.md). Format laporan hasil ada di [`report-template.md`](./report-template.md).
