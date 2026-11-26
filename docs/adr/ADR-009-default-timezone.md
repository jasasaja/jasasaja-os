# ADR-009: Default Timezone

- **Status:** **Accepted** — OD-008 disetujui 2026-11-25 (C2: simpan waktu lokal Asia/Jakarta saja, pilihan pengguna)
- **Tanggal:** 2026-11-24
- **Diperbarui:** 2026-11-25 — persetujuan tertulis pengguna untuk OD-008 (C2).
- **Sumber:** Master Blueprint v1.1 §13 (OD-008, Approved), PRD MVP v1.1 FR-P03/FR-P04 (tanggal opsional), brief Phase 0.1 & 0.2, persetujuan OD-008 2026-11-25.

## Konteks

Proyek menggunakan Bahasa Indonesia dan ditujukan untuk satu pemilik Indonesia, tetapi aplikasi memiliki target deployment online sehingga pengguna/browser dapat berada di zona waktu berbeda. PRD menggunakan target date dan due date opsional pada milestone/task. Belum ada keputusan timezone; OD-008 masih terbuka dan tidak ditutup pada P0.1-02.

## Keputusan

**OD-008 (disetujui 2026-11-25, pilihan pengguna C2):** Simpan waktu **lokal Asia/Jakarta saja** untuk timestamp aplikasi.

**Catatan penting:** Pilihan ini berbeda dari rekomendasi awal ADR (UTC storage + Asia/Jakarta display). Keputusan ini dicatat sesuai persetujuan tertulis pengguna. Implementasi harus tetap konsisten: semua timestamp yang disimpan/ditampilkan mengikuti waktu lokal Asia/Jakarta sesuai keputusan ini.

Tanggal tanpa waktu (milestone target date, task due date) disimpan sebagai **tanggal kalender** (`date`, tanpa jam), kecuali ada keputusan baru yang disetujui.

### Status turunan

| Keputusan | Status | Keterangan |
|---|---|---|
| Penyimpanan waktu lokal Asia/Jakarta saja | **Accepted — OD-008 (C2)** | Pilihan eksplisit pengguna 2026-11-25 |
| `targetDate`/`dueDate` sebagai tanggal kalender (`date`) | **Accepted — OD-008 (C2)** | Tanpa jam, kecuali keputusan baru disetujui |
| Penyimpanan UTC di database | **Superseded oleh C2** | Rekomendasi awal ADR; tidak dipilih pengguna |
| Tampilan UTC-only | **Rejected** | Tidak ramah untuk pengguna Indonesia |
| Mengandalkan timezone browser saja | **Rejected** | Hasil berbeda lokal vs online |

## Opsi yang dipertimbangkan

| Opsi | Kompleksitas | Biaya | Single-user | Dev lokal | Deployment | Lock-in | Status |
|---|---|---|---|---|---|---|---|
| UTC storage + Asia/Jakarta display | Rendah | Rendah | Baik | Baik | Baik | Rendah | **Proposed** (utama) |
| UTC storage + UTC display | Rendah | Rendah | Buruk | Baik | Baik | Rendah | **Rejected** |
| Timezone browser sebagai satu-satunya sumber | Rendah | Rendah | Cukup | Baik | Buruk | Rendah | **Rejected** |
| Offset `+07:00` statis | Rendah | Rendah | Cukup | Baik | Cukup | Rendah | **Rejected** |

## Konsekuensi

**Positif:** sederhana untuk konteks single-owner Indonesia; waktu yang tersimpan langsung sesuai zona Asia/Jakarta.

**Negatif/risiko yang diterima:** portabilitas lebih rendah jika nanti ada deployment multi-region atau pengguna di zona lain; perlu disiplin konsisten saat menyimpan/membandingkan waktu; konversi/ambigu batas hari tetap perlu diuji; integrasi eksternal yang mengharapkan UTC perlu mapping eksplisit.

## Risiko

- **Ambiguitas/portabilitas waktu:** data tersimpan sebagai waktu lokal Asia/Jakarta, sehingga integrasi eksternal atau migrasi lintas zona waktu perlu aturan konversi eksplisit.
- **Batas hari/tanggal:** `targetDate`/`dueDate` adalah date kalender; timestamp kejadian harus konsisten ke Asia/Jakarta. Uji kasus tengah malam dan awal/akhir bulan.
- **Perubahan keputusan di masa depan:** jika nanti beralih ke UTC storage, perlu migrasi data yang hati-hati; jangan dilakukan tanpa backup dan persetujuan.

## Verifikasi saat implementasi

- Timestamp kejadian disimpan konsisten sebagai waktu lokal Asia/Jakarta sesuai C2.
- `targetDate`/`dueDate` disimpan sebagai tanggal kalender (`date`) tanpa jam.
- Tampilan UI konsisten dengan Asia/Jakarta.
- Kasus batas hari dan awal/akhir bulan diuji.
- Tidak ada perubahan format waktu/tanggal tanpa alasan terdokumentasi.

## Rollback

Perubahan tampilan timezone dapat dikembalikan ke default sebelumnya lewat konfigurasi; perubahan format penyimpanan UTC sebaiknya tidak dirollback setelah data produksi ada, karena konversi ulang berisiko menggeser waktu.
