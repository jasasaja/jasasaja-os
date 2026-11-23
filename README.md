# JASASAJA Personal OS

> Learning & Engineering Operating System untuk penggunaan pribadi.

**Status proyek:** Development planning / Phase 0 --- Scope & Project
Foundation\
**Versi dokumen acuan:** 1.1 --- Revised Scope\
**Target pengguna:** Single-user (solo developer)\
**Bahasa utama:** Indonesia

## Tentang Proyek

JASASAJA Personal OS adalah sistem kerja personal untuk membantu solo
developer:

1.  Mempelajari teknologi melalui learning path, roadmap, lesson,
    latihan, dan evaluasi.
2.  Mengubah pengetahuan menjadi standar engineering yang dapat
    digunakan kembali.
3.  Menerapkan standar tersebut dalam proyek software melalui tahapan,
    milestone, dan task.

Visi produk adalah membangun lingkungan kerja terpadu yang mengubah
pembelajaran menjadi standar engineering, lalu menerapkan standar
tersebut menjadi hasil proyek yang terukur.

## Scope MVP

MVP dibangun secara bertahap dengan tiga modul inti.

  -----------------------------------------------------------------------
  Modul                               Cakupan utama
  ----------------------------------- -----------------------------------
  **Learning Center**                 Learning paths, roadmap/topics,
                                      lessons, exercises/assessments,
                                      learning progress, dan learning
                                      notes

  **Engineering Handbook**            Kategori dan tahap engineering,
                                      learning guides, SOP, workflows,
                                      templates, prompts, checklists, dan
                                      deliverables

  **Project Workspace**               Projects, project stages,
                                      milestones, tasks, project
                                      documents, dan referensi handbook
  -----------------------------------------------------------------------

Kemampuan pendukung MVP mencakup dashboard aktivitas inti, hubungan
antar-modul, pencarian minimum jika layak, serta backup/export dan
restore yang terdokumentasi.

### Bukan bagian dari MVP

Fitur berikut ditunda sampai kebutuhan nyata terbukti:

-   Productivity suite umum: goals, habits, routines, calendar, dan
    general to-do.
-   AI Assistant internal, model routing, RAG, dan autonomous agent.
-   Advanced knowledge graph atau semantic search.
-   Custom offline synchronization.
-   Multi-tenant, team collaboration, billing, dan public SaaS
    onboarding.
-   Microservices, advanced analytics, dan generic workflow builder.

Ide baru dicatat dalam backlog **Future Ideas** dan tidak otomatis masuk
ke fase aktif.

## Prinsip Pengembangan

-   **Progressive Complexity:** mulai dari alur terkecil; tambahkan
    kompleksitas hanya jika dibutuhkan.
-   **Learn by Building:** keputusan teknis dan hasil AI harus dapat
    dipahami, diperiksa, dan diuji.
-   **Human as Decision Maker:** AI eksternal dapat membantu, tetapi
    bukan dependensi MVP atau pemegang keputusan.
-   **Modular but Integrated:** setiap domain memiliki tanggung jawab
    yang jelas dan terhubung melalui relasi eksplisit.
-   **Cost-Conscious Engineering:** layanan atau API berbayar tidak
    diaktifkan tanpa persetujuan.
-   **Source Transparency:** sumber asli, penjelasan, materi tambahan
    JASASAJA, dan catatan pribadi harus dibedakan.

## Arah Arsitektur

Arah arsitektur yang ditetapkan dalam Master Blueprint adalah **Modular
Monolith** dalam satu aplikasi dan satu repository. Domain awal:

-   `learning`
-   `handbook`
-   `projects`
-   `shared/core`

Microservices dan package terpisah tidak menjadi pilihan awal tanpa
kebutuhan yang jelas.

### Kandidat teknologi --- belum final

  -----------------------------------------------------------------------
  Area                    Kandidat dalam Master   Status
                          Blueprint               
  ----------------------- ----------------------- -----------------------
  Frontend                Next.js / React +       Provisional; perlu
                          TypeScript              validasi

  Styling/UI              Tailwind CSS +          Candidate
                          shadcn/ui               

  Database                PostgreSQL              Candidate; provider
                                                  belum diputuskan

  ORM/migrations          Drizzle ORM / Drizzle   Candidate
                          Kit                     

  Validation              Zod atau validator      Candidate
                          sejenis                 

  Testing                 Vitest + Playwright     Candidate

  Version control         Private Git repository; Direction
                          feature branches        

  AI coding               OpenCode dengan human   Existing direction
                          review                  
  -----------------------------------------------------------------------

**Catatan:** daftar di atas bukan konfirmasi bahwa dependency telah
dipilih atau terpasang. Versi, kompatibilitas, provider database,
hosting, dan keputusan final harus dicatat melalui Architecture Decision
Records (ADR).

Hindari menambahkan Zustand, TanStack Query, Dexie, PWA framework, atau
adapter AI sebelum use case MVP membuktikan kebutuhannya.

## Rencana Pengembangan

Pengembangan mengikuti urutan fase dalam Development Execution Roadmap:

  -----------------------------------------------------------------------
  Fase                    Fokus                   Kriteria keluar utama
  ----------------------- ----------------------- -----------------------
  0                       Scope & project         Dokumen baseline
                          foundation              ditinjau/disetujui,
                                                  repository dan app
                                                  shell siap, keputusan
                                                  teknis minimum tercatat

  1                       Learning Center         Satu learning path
                          vertical slice          dapat dipelajari sampai
                                                  evaluasi dan progress
                                                  tersimpan

  2                       Engineering Handbook    Satu tahap engineering
                                                  memiliki paket standar
                                                  lengkap dan dapat
                                                  ditemukan/digunakan

  3                       Project Workspace       Satu proyek dapat
                                                  dijalankan dengan
                                                  stages, milestones,
                                                  tasks, dan referensi
                                                  handbook

  4                       Integration & MVP       Alur utama teruji,
                          hardening               backup/restore diuji,
                                                  dokumentasi dan release
                                                  checklist tersedia

  5                       Post-MVP expansion      Fitur lanjutan
                                                  dipertimbangkan
                                                  berdasarkan kebutuhan
                                                  penggunaan MVP
  -----------------------------------------------------------------------

Selesaikan exit criteria suatu fase sebelum memperluas scope ke fase
berikutnya.

## Development Workflow

Gunakan siklus kerja berikut untuk setiap task:

1.  **Orient** --- baca PRD, issue, README, arsitektur, dan Git status.
2.  **Plan** --- pecah pekerjaan menjadi task kecil; identifikasi risiko
    dan file terdampak.
3.  **Build** --- implementasikan satu vertical slice.
4.  **Verify** --- jalankan test, lint, typecheck, build, dan
    pemeriksaan manual yang relevan.
5.  **Review** --- periksa diff, UX, security, dan maintainability.
6.  **Document** --- perbarui README, ADR, dokumentasi konten, atau
    migration bila diperlukan.
7.  **Commit** --- buat checkpoint untuk perubahan yang telah lolos
    pemeriksaan.

Setiap task perlu memiliki outcome, acceptance criteria, file/domain
terdampak, test plan, dan pertimbangan rollback.

## Content Governance

Materi Learning Center dan Engineering Handbook harus memiliki status
editorial yang jelas. Konten yang belum lengkap atau belum ditinjau
tidak boleh diperlakukan sebagai standar yang disetujui.

Gunakan label yang membedakan:

-   `Source Material`
-   `Indonesian Explanation`
-   `AI-generated Explanation`
-   `JASASAJA Supplement`
-   `Personal Note`

Untuk materi pembelajaran, catat provenance yang relevan, seperti source
URL, source title/publisher, retrieval date, last reviewed date, content
version, dan verification status.

Untuk handbook, gunakan status seperti `Draft`, `Approved`, dan
`Deprecated` sesuai kebijakan versioning yang ditetapkan. Jangan
mengklaim konten AI sebagai terjemahan sumber apabila sumber aslinya
belum diperiksa. Hormati lisensi, hak cipta, atribusi, dan batas
penggunaan ulang sumber.

## Keamanan, Data, dan Keandalan

Prinsip minimum yang harus diterapkan:

-   Validasi input dan pemeriksaan authorization/ownership dilakukan di
    server.
-   Gunakan versioned migrations, foreign keys, constraints, dan
    transaksi untuk perubahan atomik.
-   Simpan secrets melalui environment atau secret management; jangan
    commit secrets atau memasukkannya ke log.
-   Tinjau kebijakan penghapusan agar relasi data tidak rusak tanpa
    sengaja.
-   Sediakan loading, empty, error, dan success states pada alur utama.
-   Dokumentasikan backup dan export data penting, lalu uji proses
    restore pada lingkungan non-production.
-   Jangan mengaktifkan layanan berbayar/API berbayar tanpa persetujuan.

## Definition of Done

Task belum dianggap selesai hanya karena kode telah ditulis. Minimal:

-   Acceptance criteria terpenuhi.
-   Input tervalidasi dan error handling jelas.
-   Authorization server-side diperiksa untuk data privat.
-   Test relevan ditambahkan/diubah dan lulus.
-   Loading, empty, error, dan success states ditangani bila relevan.
-   Tidak ada secret atau data sensitif di diff/log.
-   Dokumentasi dan migration diperbarui bila diperlukan.
-   Diff ditinjau serta risiko dan cara rollback dipahami.

## Open Decisions

Keputusan berikut masih tercatat terbuka dalam Master Blueprint v1.1 dan
perlu diselesaikan pada fase yang sesuai:

1.  Finalisasi stack dan versi dependency.
2.  Provider PostgreSQL dan hosting, termasuk biaya serta batas free
    tier.
3.  Authentication model untuk single-user deployment.
4.  Model authoring/publishing konten dan format import.
5.  Skema versioning handbook dan lesson.
6.  Strategi backup/export dan restore.
7.  Deployment MVP: lokal saja atau online.
8.  Default timezone.

Jangan mengasumsikan keputusan tersebut sudah final sebelum dicatat dan
disetujui.

## Dokumentasi Acuan

Dokumen baseline proyek:

-   **Master Blueprint v1.1** --- visi, prinsip, scope, arah arsitektur,
    governance, dan open decisions.
-   **PRD MVP v1.1** --- user journeys, functional requirements,
    non-functional requirements, acceptance criteria, dan Definition of
    Done.
-   **Development Execution Roadmap v1.1** --- urutan fase, work
    packages, exit criteria, dan development loop.

Pastikan ketiga dokumen tetap konsisten. Master Blueprint menjadi
dokumen induk; PRD dan roadmap merupakan dokumen turunannya.

## Setup dan Perintah Proyek

Instruksi instalasi, konfigurasi environment, migration, seed, serta
perintah development/test/build akan ditambahkan setelah stack dan
repository dikonfirmasi.

> **Belum tersedia:** jangan menyalin atau menjalankan perintah
> setup/build dari README ini sebelum bagian ini diperbarui berdasarkan
> konfigurasi repository yang sebenarnya.

## Kontribusi dan Perubahan

Untuk saat ini proyek ditujukan bagi penggunaan personal oleh satu solo
developer. Perubahan scope MVP harus disertai alasan, dampak, dan
persetujuan eksplisit. Keputusan arsitektur penting dicatat sebagai ADR
atau decision register. Perubahan destruktif, deployment production,
penghapusan data, dan pengeluaran biaya memerlukan persetujuan
eksplisit.

------------------------------------------------------------------------

*Dokumen ini merupakan README awal berbasis Master Blueprint v1.1, PRD
MVP v1.1, dan Development Execution Roadmap v1.1. Perbarui bagian setup
dan status proyek setelah kondisi repository aktual diverifikasi.*