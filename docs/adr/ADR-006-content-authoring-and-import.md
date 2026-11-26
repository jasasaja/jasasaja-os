# ADR-006: Content Authoring and Import

- **Status:** **Accepted** — Rich Text / Block Editor sebagai authoring MVP; OD-004 disetujui 2026-11-25 (A1: JSON block terstruktur, export/import awal JSON)
- **Tanggal:** 2026-11-24
- **Diperbarui:** 2026-11-25 — persetujuan tertulis pengguna untuk OD-004 (A1).
- **Sumber:** Master Blueprint v1.1 §7 (OD-004, Approved), PRD MVP v1.1 §4/§7/§8/§13, persetujuan authoring pengguna 2026-11-24, persetujuan OD-004 2026-11-25.

## Konteks

PRD menyatakan materi dapat dimasukkan secara manual dan pipeline scraping otomatis bukan prasyarat MVP. Lesson perlu mendukung heading, paragraf, list, code block, gambar/link, contoh, dan referensi. Handbook item perlu field Purpose, When to use, Procedure, Checklist, Templates/prompts, Deliverables, relasi, status, dan versi.

Open question PRD menanyakan format konten: Markdown, block editor, atau kombinasi. Pengguna memilih **Rich Text / Block Editor** pada 2026-11-24. Usulan sebelumnya (Markdown sebagai format kanonik dengan textarea + preview) tetap dicatat sebagai riwayat dan telah digantikan. Representasi penyimpanan serta format import/export belum diputuskan.

## Keputusan

Gunakan **Rich Text / Block Editor** sebagai pengalaman authoring lesson dan handbook item pada MVP. Editor harus mampu menghasilkan konten terstruktur (heading, paragraf, list, code block, gambar/link) dengan sanitasi output yang aman. Implementasi editor—library pihak ketiga atau block editor kustom—belum diputuskan dan tetap **Proposed**.

**OD-004 (disetujui 2026-11-25, pilihan A1):** Konten disimpan sebagai **JSON block terstruktur** (bukan HTML mentah, bukan Markdown kanonik). Export/import awal menggunakan **JSON**. Markdown export/import dapat dipertimbangkan kemudian sebagai tambahan, bukan format kanonik MVP saat ini. Server wajib memvalidasi bentuk block yang diizinkan dan melakukan sanitasi/output aman.

Template/prompt/checklist dapat disalin sebagai teks. Pipeline scraping otomatis tidak dibangun pada MVP.

Label editorial (`Source Material`, `Indonesian Explanation`, `AI-generated Explanation`, `JASASAJA Supplement`, `Personal Note`) dan data provenance (source URL/title, retrieval date, last reviewed, version, verification status) tetap menjadi field tersendiri, bukan sekadar teks bebas di dalam konten.

### Status turunan

| Keputusan | Status | Keterangan |
|---|---|---|
| Rich Text / Block Editor sebagai authoring MVP | **Accepted** | Disetujui pengguna 2026-11-24 |
| Markdown sebagai format kanonik body | **Superseded** | Digantikan oleh keputusan editor; alasan: pilihan eksplisit pengguna |
| Authoring form textarea + preview Markdown | **Superseded** | Digantikan oleh pengalaman Rich Text / Block Editor |
| Representasi penyimpanan konten | **Accepted — OD-004 (A1)** | JSON block terstruktur; divalidasi/sanitasi di server |
| Format import/export awal | **Accepted — OD-004 (A1)** | JSON sebagai format portabel awal; Markdown export/import ditunda |
| Library editor vs block editor kustom | **Proposed** | Implementasi belum dipilih |
| Label editorial dan provenance sebagai field | **Accepted sebagai requirement** | Blueprint §7, PRD FR-L08 |
| Template/prompt/checklist dapat disalin | **Accepted sebagai requirement** | PRD FR-H04 |
| Pipeline scraping otomatis | **Rejected** | Dinyatakan bukan prasyarat PRD |
| Konten AI dianggap terjemahan terverifikasi | **Rejected** | Melanggar prinsip Source Transparency |

## Opsi yang dipertimbangkan

| Opsi | Kompleksitas | Biaya | Single-user | Dev lokal | Deployment | Lock-in | Status |
|---|---|---|---|---|---|---|---|
| Rich Text / Block Editor | Sedang | Rendah–Sedang | Baik | Baik | Baik | Sedang | **Accepted** (approach) |
| Markdown + form preview + import JSON/Markdown | Rendah | Rendah | Baik | Baik | Baik | Rendah | **Superseded** (arsip) |
| WYSIWYG/editor pihak ketiga | Sedang | Rendah–Sedang | Cukup | Baik | Baik | Sedang | **Proposed** (implementasi) |
| Block editor kustom | Tinggi | Rendah | Cukup | Sedang | Baik | Sedang | **Proposed** (implementasi, belum dipilih) |
| Scraping otomatis sebagai source utama | Tinggi | Sedang | Buruk | Sedang | Sedang | Sedang | **Rejected** |

## Konsekuensi

**Positif:** pengalaman mengedit lebih kaya, struktur konten dapat dijaga, dan sanitasi output dapat dirancang sejak awal.

**Negatif:** representasi data dan format ekspor belum final; implementasi editor berpotensi menambah dependency, sehingga perlu keputusan terpisah sebelum pemasangan.

## Risiko

- Output editor mengandung HTML/JSON berbahaya → mitigasi: sanitasi saat render; jangan membolehkan script/iframe mentah.
- Format import belum final → mitigasi: tahan implementasi import sampai OD-004 disetujui; jangan mengklaim Markdown/JSON sebagai keputusan.
- Import menggusur konten yang sudah ada → mitigasi: konfirmasi, dry-run, dan backup sebelum import.
- Provenance terlewat saat import → mitigasi: validasi schema wajib/opsional sesuai status konten.

## Verifikasi saat implementasi

- Lesson dengan heading, list, code block, link, dan gambar dapat disunting dan dirender dengan aman.
- Format import/export yang disetujui diuji pada database development dengan metadata lengkap.
- Label editorial dan provenance tampil pada detail item.
- Konten Draft tidak ditampilkan sebagai standar Approved.

## Riwayat perubahan

- 2026-11-24: status awal `Proposed` dengan Markdown sebagai format kanonik dan textarea + preview. Pengguna memilih Rich Text / Block Editor, sehingga pendekatan lama menjadi `Superseded`. Alasan: keputusan eksplisit pengguna; format kanonik lama tidak dihapus dari arsip.

## Rollback

Simpan dump database sebelum import. Import yang salah dibatalkan dengan restore dump atau dengan menandai versi hasil import sebagai Draft (lihat ADR-007), bukan dengan menghapus data yang sudah ditinjau.
