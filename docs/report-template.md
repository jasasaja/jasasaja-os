# Template Laporan Penyelesaian Task

- **Status:** Final — P0.2-03
- **Tanggal:** 2026-11-25
- **Sumber:** Backlog P0.2-03, [`task-template.md`](./task-template.md), [`change-control.md`](./change-control.md), Development Roadmap v1.1 §12.
- **Batasan:** Template ini hanya menyeragamkan laporan. Tidak menambah scope MVP, tidak mengubah status ADR, dan tidak memberi izin implementasi, commit, atau push.

## Cara pakai

Salin bagian berjudul **Laporan Task** untuk setiap task yang selesai, parsial, atau blocked. Isi semua field. Kedua belas topik wajib tersebar pada header (**Task ID**, **Status**) dan bagian 1–10. Tulis `N/A` dengan alasan bila field benar-benar tidak relevan. Jangan menyatakan test/build lulus bila tidak dijalankan.

---

## Laporan Task — `<TASK-ID>`: `<Nama Task>`

- **Phase / Slice:** `<P0.x-y>`
- **Task ID / nama:** `<TASK-ID> — <nama task>`
- **Goal:** <hasil konkret yang menjadi sasaran task>
- **Tanggal laporan:** `<YYYY-MM-DD>`
- **Status laporan:** `Done` / `Partial` / `Blocked`
- **Status task di backlog:** `Not Started` / `In Progress` / `Blocked` / `Done`

### 1. Ringkasan hasil

<Tulis 2–4 kalimat: apa yang berubah, apa yang tidak berubah, dan untuk siapa hasilnya berguna.>

### 2. File yang dibuat, diubah, atau dihapus

| Aksi | Path | Alasan singkat |
|---|---|---|
| Buat / Ubah / Hapus | `<path/file>` | <alasan> |
| Tidak ada | — | <alasan bila tidak ada perubahan file> |

### 3. Perubahan utama

- <Perubahan 1>
- <Perubahan 2>
- <Perubahan 3, bila ada>

### 4. Acceptance criteria dan hasilnya

| # | Acceptance criteria | Hasil | Bukti / catatan |
|---|---|---|---|
| 1 | <criteria yang dapat diperiksa> | `Lulus` / `Tidak lulus` / `N/A` | <path, perintah, atau observasi> |
| 2 | <criteria berikutnya> | <hasil> | <bukti> |

### 5. Verifikasi yang dijalankan beserta hasil

| Pemeriksaan | Perintah / cara | Hasil |
|---|---|---|
| Pemeriksaan diff | `git diff --check` | <Lulus / Gagal> |
| <nama pemeriksaan> | `<perintah>` | <hasil> |
| Tinjauan struktur folder / tautan internal | <cara manual> | <hasil> |

### 6. Verifikasi yang tidak dijalankan dan alasannya

| Pemeriksaan yang tidak dijalankan | Alasan |
|---|---|
| `npm test`, `npm run build`, `npm run lint`, `npm run typecheck` | <misalnya: perubahan hanya dokumentasi, tidak ada kode yang tersentuh> |
| <pemeriksaan lain> | <alasan> |

Tulis `Tidak ada` bila semua pemeriksaan yang relevan dijalankan.

### 7. Risiko atau masalah yang ditemukan

- <Risiko 1 dan mitigasinya>
- <Risiko 2 dan mitigasinya>
- Tulis `Tidak ada` bila tidak ditemukan masalah.

### 8. Pekerjaan lanjutan / Next smallest action

- <Satu tindakan kecil berikutnya yang paling logis>
- <Task yang sengaja tidak dikerjakan pada laporan ini>

### 9. Konfirmasi batas scope

| Area | Status | Catatan |
|---|---|---|
| Source code | `Tidak diubah` / `Diubah` | <sebutkan file bila diubah> |
| Dependency | `Tidak diubah` / `Diubah` | <package.json / lockfile bila diubah> |
| Konfigurasi aplikasi | `Tidak diubah` / `Diubah` | <Vite / TypeScript / Tailwind / env bila diubah> |
| Database | `Tidak diubah` / `Diubah` | <migrasi / data bila diubah> |
| Commit / push | `Tidak ada` / `Ada` | <hash commit atau alasan tidak ada> |
| Branch | `Tidak dibuat / tidak diubah` / `Diubah` | <nama branch bila ada> |

### 10. Ringkasan untuk Project Manager

- **Outcome:** <hasil utama dalam satu kalimat>
- **Status:** <Done / Partial / Blocked>
- **Keputusan yang diminta:** <persetujuan yang masih diperlukan, atau `Tidak ada`>
- **Halangan:** <blocker, atau `Tidak ada`>
- **Next action:** <satu langkah kecil berikutnya>

---

## Contoh isian ringkas — P0.2-03

- **Phase / Slice:** `P0.2-03`
- **Task ID / nama:** `P0.2-03 — Task & Report Templates`
- **Goal:** Template task dan laporan yang konsisten tersedia untuk solo developer.
- **Tanggal laporan:** `2026-11-25`
- **Status laporan:** `Done`
- **Status task di backlog:** `Done`

**Ringkasan hasil:** `docs/task-template.md` diperluas dengan field scope/non-scope; `docs/report-template.md` dibuat; indeks docs dan backlog diperbarui. Tidak ada perubahan kode atau konfigurasi.

**Perubahan utama:** scope/non-scope pada task template, template laporan 10 bagian, tautan workflow, penandaan backlog.

**Acceptance criteria:** seluruh field task hadir; seluruh 12 topik laporan hadir; tautan internal valid; `git diff --check` lulus.

**Verifikasi dijalankan:** `git diff --check`, pemeriksaan field, pemeriksaan tautan, perbandingan status working tree.

**Verifikasi tidak dijalankan:** `npm test`/`build`/`lint`/`typecheck` karena hanya dokumentasi.

**Risiko:** duplikasi dokumentasi bila template tidak dipakai; mitigasi lewat tautan silang dari indeks docs dan template task.

**Pekerjaan lanjutan:** gunakan template pada task berikutnya; P0.3 tidak dimulai pada laporan ini.

**Batas scope:** source code, dependency, konfigurasi, database, branch, commit, dan push tidak diubah.

**Ringkasan PM:** Template kerja sudah siap dipakai; tidak ada keputusan baru yang memerlukan persetujuan.
