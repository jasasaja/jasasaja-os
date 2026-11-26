# Kontrak API `/api` — JASASAJA Personal OS

- **Status:** **Proposed — P0.3-02**, siap ditinjau sebelum P0.3-03. Bukan persetujuan implementasi.
- **Tanggal:** 2026-11-25
- **Sumber:** ADR-001–ADR-009, `docs/architecture-proposal.md`, `docs/repository-structure.md`, `docs/adr-status.md`, `docs/phase-0-backlog.md`, README bagian Scope MVP, dan hasil audit P0.3-01 yang dilaporkan pada sesi sebelumnya.
- **Batasan:** Dokumen ini **mendefinisikan kontrak**. Tidak ada endpoint, server, database, dependency, konfigurasi, atau source code yang dibuat/diubah oleh pembaruan dokumen ini. Perubahan status OD/ADR hanya dicatat berdasarkan persetujuan eksplisit pengguna.

## 0. Keterbatasan sumber

Master Blueprint v1.1, PRD MVP v1.1, dan Development Roadmap v1.1 berstatus **Approved — 2026-11-24**, tetapi file `.docx`-nya **tidak hadir di repository**. Isi dokumen ini disusun dari ringkasan dan kutipan di `docs/`, `README.md`, serta ADR yang ada. Karena itu:

1. Konvensi yang sudah berasal dari ADR yang disetujui (prefix `/api`, error envelope, Zod, Google Login, single owner, modular monolith) dicatat sebagai **Accepted pada cakupan ADR**.
2. Daftar field detail dan path endpoint domain ditandai **Proposed** sampai dicocokkan kembali dengan PRD MVP v1.1 asli.
3. Hasil P0.3-01 tersedia sebagai laporan sesi sebelumnya (test 23/23; typecheck, lint, build lulus; warning `__dirname` tercatat), tetapi **belum disimpan sebagai file dokumen** di repository. Tidak ada hasil audit yang dikarang di sini.

---

## 1. API conventions

### 1.1 Prefix dan batas dengan SPA

- Semua endpoint API berada di bawah prefix **`/api`**. Ini mengikuti ADR-002 dan tidak mengubah 5 route SPA existing:
  `/dashboard`, `/learning`, `/handbook`, `/projects`, `/settings`.
- Tidak ada endpoint API yang memakai path tanpa `/api`.
- Saat development, Vite direncanakan memproxy `/api` ke proses API terpisah (port usulan `:3001`) agar tidak memerlukan CORS. Detail port dan environment masih **Proposed**.
- Saat online, frontend dan API direncanakan berada pada satu origin; detail hosting, region, dan domain masih **OD-002**.

### 1.2 Method HTTP

| Method | Penggunaan dalam kontrak ini |
|---|---|
| `GET` | Membaca satu resource atau koleksi. Tidak mengubah data. |
| `POST` | Membuat resource baru atau menjalankan aksi eksplisit yang didefinisikan (misalnya approval). |
| `PATCH` | Memperbarui sebagian field resource. `PUT` tidak dipakai pada MVP. |
| `DELETE` | Tidak menjadi default MVP. Bila diperlukan, harus didefinisikan sebagai soft-delete/arsip dan ditinjau terpisah karena aturan versioning masih terbuka. |

### 1.3 Status code

| Kode | Makna kontrak |
|---|---|
| `200` | Request berhasil dan mengembalikan body JSON. |
| `201` | Resource berhasil dibuat. |
| `204` | Berhasil tanpa body. Hanya bila benar-benar tidak ada data untuk dikembalikan. |
| `400` | Request tidak valid: body/query/params gagal validasi atau Content-Type salah. |
| `401` | Tidak ada sesi owner yang valid. |
| `403` | Request memiliki sesi, tetapi bukan owner yang diizinkan. |
| `404` | Resource tidak ditemukan atau tidak boleh diketahui keberadaannya. |
| `409` | Konflik state, misalnya duplikat atau transisi status yang tidak sah. |
| `500` | Kesalahan internal generik. Detail teknis tidak dikirim ke klien. |
| `503` | Hanya untuk health/readiness saat layanan belum siap. |

Tidak ada status code khusus untuk `Mastered`, approval, atau progress sampai aturannya disetujui.

### 1.4 JSON dan Content-Type

- Request dengan body wajib memakai `Content-Type: application/json; charset=utf-8`.
- Response sukses dan error memakai `Content-Type: application/json; charset=utf-8`, kecuali `204` tanpa body.
- Body harus berupa objek JSON. Array boleh muncul di dalam `data`, bukan sebagai root response.
- Field JSON memakai **camelCase** agar selaras dengan tipe frontend existing. Jika database memakai `snake_case` (misalnya `change_note` di ADR-007), mapping dilakukan di boundary API, bukan di UI.
- Parameter path memakai nama resource plural `kebab-case` bila lebih dari satu kata, dengan identifier sebagai `{resourceId}`.
- Contoh: `/api/handbook/items/{itemId}/versions`.

### 1.5 Tanggal dan waktu — **Open Decision OD-008**

ADR-009 masih **Proposed**, sehingga **format final tanggal/waktu belum diputuskan**. Kontrak ini belum menetapkan:

- format timestamp di response (kandidat: ISO 8601 UTC),
- zona tampilan default (kandidat: `Asia/Jakarta`),
- aturan tanggal tanpa waktu untuk `targetDate`/`dueDate`,
- batas hari dekat tengah malam.

Field bertanggal pada inventaris endpoint ditandai **Proposed — OD-008**. Jangan menganggap UTC, `+07:00`, atau format `YYYY-MM-DD` sebagai keputusan final.

### 1.6 Identifier

Identifier resource direncanakan sebagai string opaque (contoh: `lesson_123`) dan tidak boleh diasumsikan sebagai angka urutan database. Aturan generasi ID dan bentuk finalnya masih **Proposed**; yang mengikat adalah identifier dikirim apa adanya oleh server dan dipakai kembali oleh klien.

---

## 2. Standard response

### 2.1 Respons sukses

Gunakan envelope konsisten:

```json
{
  "data": {
    "id": "lesson_123",
    "title": "Contoh Lesson",
    "status": "Draft"
  }
}
```

Untuk koleksi, sertakan `meta` hanya bila halamannya dipakai:

```json
{
  "data": [
    {"id": "path_1", "title": "Dasar TypeScript"}
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 42
  }
}
```

`data` selalu ada pada response `200`/`201`. `204` tidak memiliki body. `meta` belum termasuk `requestId`; lihat §2.4.

### 2.2 Respons error

Error envelope mengikuti ADR-002:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Periksa kembali data yang Anda kirim.",
    "details": [
      {
        "field": "title",
        "rule": "required",
        "message": "Judul wajib diisi."
      }
    ]
  }
}
```

Field:

| Field | Wajib | Aturan |
|---|---|---|
| `error.code` | Ya | Identifier teknis Bahasa Inggris, `UPPER_SNAKE_CASE`, stabil antar rilis. |
| `error.message` | Ya | Kalimat aman Bahasa Indonesia untuk ditampilkan ke pengguna. |
| `error.details` | Tidak | Hanya untuk validation error. Array `{ field, rule, message }`. |

### 2.3 Daftar error code awal

| Code | Status | Pesan user-facing |
|---|---|---|
| `VALIDATION_ERROR` | `400` | Periksa kembali data yang Anda kirim. |
| `UNAUTHENTICATED` | `401` | Sesi tidak valid. Silakan masuk kembali. |
| `FORBIDDEN` | `403` | Anda tidak memiliki akses ke sumber ini. |
| `NOT_FOUND` | `404` | Data tidak ditemukan. |
| `CONFLICT` | `409` | Data bertentangan dengan kondisi saat ini. |
| `INTERNAL_ERROR` | `500` | Terjadi kesalahan. Silakan coba lagi. |
| `SERVICE_UNAVAILABLE` | `503` | Layanan belum siap. Silakan coba lagi. |

Contoh error internal sengaja tidak membawa detail:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Terjadi kesalahan. Silakan coba lagi."
  }
}
```

### 2.4 Batas informasi publik

Response publik **dilarang** memuat: stack trace, query SQL, path filesystem, `DATABASE_URL`, kredensial Google, cookie/token, email owner, detail provider, atau pesan library mentah. `details` hanya berisi field yang dikirim klien dan aturan validasinya.

Request/correlation ID **belum dimasukkan** ke kontrak karena belum ada keputusan yang menyetujuinya. Bila diperlukan di kemudian hari, bentuknya harus ditetapkan terpisah (misalnya header atau `meta.requestId`), bukan ditambahkan diam-diam.

---

## 3. Validation

1. **Server adalah sumber kebenaran.** Seluruh request divalidasi dengan **Zod** sesuai ADR-002 sebelum masuk ke layer domain.
2. Validasi mencakup:
   - **params** path, misalnya `{lessonId}` harus tidak kosong;
   - **query**, misalnya `page`, `pageSize`, `status`, filter, dan `sort`;
   - **body**, misalnya field wajib, panjang teks, enum status, serta struktur konten.
3. Gunakan `safeParse`; bila gagal, kembalikan `400` dengan `VALIDATION_ERROR` dan `details` yang menunjukkan field bermasalah.
4. Koersi numeric/boolean tidak boleh implisit. `page=abc` ditolak, bukan diam-diam diubah menjadi `1`.
5. Field yang tidak dikenal ditolak pada request body agar typo tidak tersimpan sebagai data.
6. Batas panjang dan allowlist enum didefinisikan dekat schema Zod masing-masing modul, bukan duplikat di handler.
7. Konten Rich Text / Block Editor wajib disanitasi di server sebelum disimpan/dikembalikan. Representasi konten akhir masih **Proposed** (ADR-006/OD-004), jadi kontrak ini belum menetapkan format node editor.
8. Frontend boleh memakai schema murni yang sama hanya bila tidak menambah coupling paket. Validasi UI bersifat pengalaman pengguna; **tidak menggantikan** validasi server.
9. Zod belum terpasang karena OD-001 masih terbuka. Tidak ada dependency yang dipasang pada task ini.

---

## 4. Authentication and authorization

### 4.1 Keputusan yang mengikat

| Hal | Status | Sumber |
|---|---|---|
| Google Login sebagai metode autentikasi | **Accepted** | ADR-004 |
| Satu akun owner, tanpa registrasi publik | **Accepted** | ADR-004 |
| Guard owner di server untuk semua endpoint domain | **Accepted sebagai requirement** | ADR-004, architecture proposal |
| Tidak ada multi-tenant, role hierarchy, atau invitation | **Accepted** | ADR-001/ADR-004 |
| Detail session/cookie/CSRF/guard scope | **Accepted — OD-003 (2026-11-25)** | ADR-004, adr-status.md |

Tidak akan ada endpoint `POST /api/auth/register` atau endpoint publik lain untuk membuat owner baru.

### 4.2 Session, Cookie, CSRF (OD-003 — Approved)

- **Session:** Server-side session di PostgreSQL (opaque session ID). Browser hanya menyimpan opaque session cookie; token/data sesi sensitif tidak disimpan di localStorage. Session dapat dicabut server-side (logout/revoke/expiry). Token Google tidak diekspos ke frontend; default MVP tidak menyimpan token Google lebih lama dari yang dibutuhkan untuk verifikasi login, kecuali kebutuhan minimal yang jelas dan terdokumentasi.
- **Cookie:** `HttpOnly=true`, `SameSite=Lax`, `Path=/`. `Secure=true` saat HTTPS/production; non-Secure hanya untuk local HTTP development via konfigurasi env (bukan hardcode). Nama cookie final ditetapkan saat implementasi Step 6; TTL/idle timeout final ditetapkan saat implementasi dan harus terdokumentasi.
- **CSRF:** Defense-in-depth: `SameSite=Lax` + verifikasi `Origin/Referer` terhadap allowlist origin aplikasi untuk request state-changing (`POST`, `PATCH`, `DELETE`) + `Content-Type: application/json`. Tambahkan CSRF token synchronizer per session (`X-CSRF-Token`) untuk mutasi state. OAuth callback/login flow wajib memvalidasi `state`/nonce.
- **Logout/expiry:** Session expired/invalid mendapat `401 UNAUTHENTICATED`; logout mencabut session server-side.

### 4.3 Endpoint yang memerlukan autentikasi (Guard scope)

Default: semua endpoint `/api/**` **protected** kecuali allowlist eksplisit.

| Grup | Kebutuhan sesi owner | Catatan |
|---|---|---|
| `GET /api/health` | **Tidak** — public liveness | **Tetap publik** (konfirmasi OD-003). Tidak mengekspos data privat/internal sensitif. |
| Endpoint auth flow (`/api/auth/*` yang didefinisikan) | **Tidak untuk sesi existing** pada entry/callback tertentu | Tetap wajib validasi `state`/nonce/Origin sesuai flow; hanya path auth yang didefinisikan yang publik. |
| `GET /api/auth/me`, `POST /api/auth/logout` | **Ya** | Butuh session owner valid; logout mencabut session. |
| Semua endpoint `/api/learning/**` | **Ya** | Owner guard wajib. |
| Semua endpoint `/api/handbook/**` | **Ya** | Owner guard wajib. |
| Semua endpoint `/api/projects/**` | **Ya** | Owner guard wajib. |
| Endpoint backup/export bila dibuat | **Ya** | Owner guard wajib. |

Request tanpa sesi valid mendapat `401 UNAUTHENTICATED`. Request dengan identitas bukan owner yang dipetakan mendapat `403 FORBIDDEN` (atau `404` jika kebijakan non-disclosure dipilih dan didokumentasikan saat implementasi; default MVP: `403`).

### 4.4 Prasyarat implementasi Step 6

OD-003 sudah disetujui. Sebelum endpoint domain dibuat, Step 6 tetap harus mengimplementasikan secara hati-hati: tabel/session store, cookie config env-aware, CSRF middleware/token, guard terpusat, pemetaan identitas Google ke satu owner, dan pengujian 401/403/CSRF. Path auth di §6.5 adalah **baseline Proposed** yang selaras dengan OD-003, tetapi detail final (nama path/cookie/TTL/skema tabel) ditetapkan saat implementasi dan didokumentasikan.

---

## 5. Module boundaries

Batas modul mengikuti ADR-001 dan `repository-structure.md`. Satu proses API melayani semua modul dalam satu repository.

| Modul | Prefix kontrak | Tanggung jawab | Batas |
|---|---|---|---|
| `learning` | `/api/learning/**` | Learning path, lesson, exercise/assessment, catatan, provenance, progres dasar | Tidak mengimpor file internal `handbook`/`projects` |
| `handbook` | `/api/handbook/**` | Kategori/tahap, item standar, Purpose, When to use, Procedure, Checklist, Templates/prompts, Deliverables, versi/status | Tidak mengimpor file internal modul lain |
| `projects` | `/api/projects/**` | Project, stage, milestone, task, dokumen proyek, referensi materi | Referensi ke modul lain memakai ID eksplisit |
| `shared/core` | Non-domain | Konfigurasi, error envelope, logging tanpa secret, guard owner, primitive Zod, helper pagination, health | Boleh dipakai semua modul; bukan tempat logika domain |

Aturan:

1. Modul hanya saling memakai **kontrak publik** (misalnya `index.ts` pada usulan struktur) atau primitive `shared/core`.
2. Dilarang mengimpor `service.ts`, `repository.ts`, atau `schema.ts` internal modul lain.
3. Relasi lintas modul memakai ID eksplisit, misalnya task menyimpan `handbookItemId` atau `lessonId`, bukan objek utuh dari modul lain.
4. Perubahan batas modul yang bersifat arsitektural wajib melalui ADR dan `change-control.md`.

---

## 6. MVP endpoint inventory

Legenda status:

- **Accepted** — konvensi sudah bersumber dari ADR yang disetujui.
- **Proposed** — kebutuhan berada dalam Scope MVP, tetapi detail field/path perlu dicocokkan dengan PRD v1.1 dan/atau menunggu OD.
- **Deferred** — disebut dalam PRD/ADR, tetapi tidak boleh diimplementasikan sebelum OD terkait ditutup.

Kode status pada tabel: `R` = `200/400/401/404/500`; `C` = `201/400/401/409/500`; `U` = `200/400/401/403/404/409/500`; `H` = `200/503`. Kode ini sudah diperluas di §1.3.

### 6.1 System / health

| Method | Path | Tujuan | Auth | Request utama | Response utama | Status | Status code |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/health` | Liveness untuk lokal dan deployment | Tidak | Tidak ada | `{ data: { status: "ok" } }` | **Accepted** | `H` |

`GET /api/health` tidak boleh membocorkan versi dependency, URL database, atau status koneksi internal. Varian readiness yang memeriksa database dapat ditambahkan sebagai `GET /api/health/ready` (**Proposed**) setelah detail environment disetujui; tidak menjadi bagian dari P0.3-03.

### 6.2 Learning

| Method | Path | Tujuan | Auth | Request utama | Response utama | Status | Status code |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/learning/paths` | Daftar learning path | Ya | query `page`, `pageSize`, `q` | `data: [{ id, title, description, status, lessonCount }]`, `meta` | Proposed | `R` |
| `GET` | `/api/learning/paths/{pathId}` | Detail path + ringkasan lesson | Ya | param `pathId` | `data: { id, title, description, lessons: [{ id, title, order }] }` | Proposed | `R` |
| `POST` | `/api/learning/paths` | Buat learning path | Ya | `{ title, description?, status }` | `data: { id, title, description, status }` | Proposed | `C` |
| `PATCH` | `/api/learning/paths/{pathId}` | Ubah path | Ya | param `pathId`; partial field | `data: { ... }` | Proposed | `U` |
| `GET` | `/api/learning/lessons/{lessonId}` | Detail lesson beserta label editorial dan provenance | Ya | param `lessonId` | `data: { id, title, content, labels, provenance, version, status }` | Proposed | `R` |
| `POST` | `/api/learning/lessons` | Buat lesson | Ya | `{ title, pathId?, content, labels?, provenance?, status }` | `data: { id, ... }` | Proposed | `C` |
| `PATCH` | `/api/learning/lessons/{lessonId}` | Ubah lesson draft | Ya | param `lessonId`; partial + `changeNote` | `data: { ... }` | Proposed | `U` |
| `GET` | `/api/learning/lessons/{lessonId}/versions` | Riwayat versi lesson | Ya | param `lessonId`; query `page`, `pageSize` | `data: [{ version, status, changeNote, createdAt }]`, `meta` | Deferred — OD-005 | `R` |
| `POST` | `/api/learning/lessons/{lessonId}/approve` | Transisi eksplisit draft → approved | Ya | param `lessonId`; `{ version }` | `data: { version, status: "Approved" }` | Deferred — OD-005 | `U` |
| `PATCH` | `/api/learning/lessons/{lessonId}/progress` | Catat progres/-status lesson | Ya | param `lessonId`; `{ status }` | `data: { lessonId, status }` | Deferred — PRD-Q-Mastered | `U` |

`content`, `labels`, dan `provenance` mengikuti ADR-006, tetapi format kanonik konten dan import/export masih OD-004. Field `createdAt` mengikuti OD-008. Status `Mastered` belum didefinisikan.

### 6.3 Handbook

| Method | Path | Tujuan | Auth | Request utama | Response utama | Status | Status code |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/handbook/categories` | Daftar kategori/tahap engineering | Ya | query `page`, `pageSize` | `data: [{ id, name, order }]`, `meta` | Proposed | `R` |
| `GET` | `/api/handbook/items` | Daftar item handbook | Ya | query `categoryId`, `status`, `q`, pagination | `data: [{ id, title, status, version }]`, `meta` | Proposed | `R` |
| `GET` | `/api/handbook/items/{itemId}` | Detail standar | Ya | param `itemId` | `data: { id, title, purpose, whenToUse, procedure, checklist, templates, deliverables, status, version, relations }` | Proposed | `R` |
| `POST` | `/api/handbook/items` | Buat item handbook | Ya | field standar di atas, `status` awal | `data: { id, ... }` | Proposed | `C` |
| `PATCH` | `/api/handbook/items/{itemId}` | Ubah item handbook | Ya | param `itemId`; partial + `changeNote` | `data: { ... }` | Proposed | `U` |
| `GET` | `/api/handbook/items/{itemId}/versions` | Riwayat versi standar | Ya | param `itemId`; pagination | `data: [{ version, status, changeNote, createdAt }]`, `meta` | Deferred — OD-005 | `R` |
| `POST` | `/api/handbook/items/{itemId}/approve` | Transisi eksplisit draft → approved | Ya | param `itemId`; `{ version }` | `data: { version, status: "Approved" }` | Deferred — OD-005 | `U` |

Versi `Approved` terbaru harus menjadi standar aktif; `Draft` dan `Deprecated` tidak boleh ditampilkan sebagai standar. Aturan append-only dan transisi status menunggu OD-005.

### 6.4 Projects

| Method | Path | Tujuan | Auth | Request utama | Response utama | Status | Status code |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/projects` | Daftar project | Ya | query `status`, `q`, pagination | `data: [{ id, name, stage, status }]`, `meta` | Proposed | `R` |
| `GET` | `/api/projects/{projectId}` | Detail project + ringkasan milestone/task | Ya | param `projectId` | `data: { id, name, stage, description, references, milestones, tasks }` | Proposed | `R` |
| `POST` | `/api/projects` | Buat project | Ya | `{ name, description?, stage?, references? }` | `data: { id, ... }` | Proposed | `C` |
| `PATCH` | `/api/projects/{projectId}` | Ubah project | Ya | param `projectId`; partial field | `data: { ... }` | Proposed | `U` |
| `GET` | `/api/projects/{projectId}/milestones` | Daftar milestone | Ya | param `projectId`; pagination | `data: [{ id, title, targetDate, status }]`, `meta` | Proposed | `R` |
| `POST` | `/api/projects/{projectId}/milestones` | Buat milestone | Ya | `{ title, targetDate?, status? }` | `data: { id, ... }` | Proposed — OD-008 | `C` |
| `PATCH` | `/api/projects/{projectId}/milestones/{milestoneId}` | Ubah milestone | Ya | param; partial field | `data: { ... }` | Proposed — OD-008 | `U` |
| `GET` | `/api/projects/{projectId}/tasks` | Daftar task | Ya | param `projectId`; filter `milestoneId`, `status` | `data: [{ id, title, status, dueDate }]`, `meta` | Proposed | `R` |
| `POST` | `/api/projects/{projectId}/tasks` | Buat task | Ya | `{ title, milestoneId?, handbookItemId?, lessonId?, dueDate? }` | `data: { id, ... }` | Proposed — OD-008 | `C` |
| `PATCH` | `/api/projects/{projectId}/tasks/{taskId}` | Ubah task | Ya | param; partial field | `data: { ... }` | Proposed — OD-008 | `U` |

`targetDate` dan `dueDate` adalah tanggal opsional sesuai PRD; format finalnya menunggu OD-008. Referensi ke handbook/lesson memakai ID eksplisit dan tidak mengimpor modul lain.

### 6.5 Authentication — **Proposed, selaras OD-003 (detail final Step 6)**

Path di bawah adalah baseline yang selaras dengan OD-003. Nama path/cookie/TTL/skema session tetap ditetapkan saat implementasi Step 6 dan harus didokumentasikan.

| Method | Path contoh | Tujuan | Auth | Request utama | Response utama | Status | Status code |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/auth/google/start` | Memulai Google Login | Tidak (public auth flow) | query/redirect context sesuai implementasi | redirect ke Google | Proposed | `302/400/500` |
| `GET` | `/api/auth/google/callback` | Menerima hasil Google Login, validasi `state`/nonce, buat session owner | Tidak (public auth flow) | param OAuth dari Google | redirect ke app + set session cookie | Proposed | `302/400/401/500` |
| `GET` | `/api/auth/me` | Informasi sesi owner saat ini | Ya | Tidak ada | `data: { owner: { id, displayName } }` | Proposed | `R` |
| `POST` | `/api/auth/logout` | Mengakhiri sesi | Ya | CSRF header sesuai OD-003 | `204` atau `data: { ok: true }` | Proposed | `204/401/403/500` |

Tidak ada endpoint registrasi publik. Hanya identitas Google yang dipetakan ke owner tunggal yang boleh mendapat session.

### 6.6 Yang sengaja tidak dibuat

Endpoint untuk hal berikut **tidak** masuk inventaris MVP: public registration, multi-tenant/team, billing, invitation/role hierarchy, AI Assistant/RAG, scraping otomatis, offline synchronization, calendar/habit/routine/general to-do, advanced analytics, semantic search, dan generic workflow builder. Backup/export aplikasi baru dicatat sebagai kebutuhan (ADR-008/OD-004/OD-006), tetapi format dan endpointnya ditunda.

---

## 7. Pagination, filtering, dan sorting — **Proposed**

PRD/ADR menunjukkan kebutuhan daftar dan pencarian minimum (NFR-03 disebut dalam ADR-007), tetapi detailnya belum final. Pola usulan:

| Parameter | Default | Aturan |
|---|---|---|
| `page` | `1` | Integer ≥ 1 |
| `pageSize` | `20` | Integer 1–100; nilai di luar rentang ditolak `400` |
| `q` | tidak ada | Pencarian substring case-insensitive pada field nama/judul yang diizinkan |
| `sort` | field default per resource | Hanya allowlist field; dilarang sort pada konten mentah/JSON |
| `dir` | `asc` | `asc` atau `desc`; harga mati `id` sebagai tie-breaker |

Filter tambahan bersifat per resource, misalnya `status`, `categoryId`, `milestoneId`. Response koleksi menyertakan `meta.page`, `meta.pageSize`, dan `meta.total`. Belum dipakai cursor pagination.

Keputusan yang masih diperlukan sebelum pola ini final:

1. konfirmasi default dan batas `pageSize` terhadap PRD v1.1;
2. daftar field yang boleh di-`sort` per resource;
3. perlakuan filter tanggal setelah OD-008;
4. apakah `q` benar-benar diperlukan pada MVP atau cukup filter eksak.

---

## 8. API versioning

Rekomendasi paling sederhana untuk MVP: **belum memakai prefix versi**. Gunakan hanya `/api` dan kelola kompatibilitas lewat dokumen kontrak ini serta perubahan backward-compatible (menambah field opsional, bukan mengubah makna field lama).

Backlog P0.3-02 menyebut kemungkinan penandaan `v1` sebagai **cadangan rollback**, bukan keputusan. Jangan membuat `/api/v1/...` tanpa ADR atau persetujuan eksplisit. Bila kemudian ada perubahan yang tidak kompatibel, opsi yang dibahas terpisah adalah menambahkan prefix versi baru sambil mempertahankan kontrak lama untuk sementara.

---

## 9. Implementation notes

### 9.1 Open Decisions yang memengaruhi API

| OD | Dampak pada kontrak |
|---|---|---|
| OD-001 | **Approved (2026-11-25).** Pinning Fastify/Zod/Drizzle/pg disetujui; dependency sudah dipasang pada Step 3. Dependency tambahan tetap butuh persetujuan. |
| OD-002 | Origin, CORS, TLS, region, dan domain online belum diputuskan; proxy lokal masih usulan. |
| OD-003 | **Approved (2026-11-25).** Session server-side DB + opaque HttpOnly cookie (`SameSite=Lax`, `Secure` env-aware, `Path=/`), CSRF defense-in-depth (Origin/Referer + JSON + `X-CSRF-Token` untuk mutasi), guard default-protected `/api/**` dengan allowlist publik minimum `GET /api/health` dan auth flow yang didefinisikan. Detail implementasi final (nama cookie/TTL/skema session/path) ditetapkan di Step 6. |
| OD-004 | **Approved (2026-11-25, A1).** Konten JSON block terstruktur; export/import awal JSON. Field `content`/endpoint export tetap Proposed sampai implementasi. |
| OD-005 | **Approved (2026-11-25, B1).** Append-only version rows; `Draft → Approved` oleh owner lewat aksi eksplisit. Detail schema/endpoint versi tetap Proposed sampai implementasi. |
| OD-006 | Frekuensi/retensi backup dan endpoint export belum ditetapkan. |
| OD-008 | **Approved (2026-11-25, C2).** Simpan waktu lokal Asia/Jakarta saja. Format timestamp/tanggal di API tetap harus konsisten dengan keputusan ini. |
| PRD-Q-Mastered | **Approved (2026-11-25, D1).** `Mastered` manual oleh owner; tanpa perhitungan otomatis. |

### 9.2 Cukup stabil untuk P0.3-03

Bagian berikut dapat dipakai sebagai acuan skeleton backend dan health endpoint:

1. prefix `/api` dan tidak ada overlap dengan 5 route SPA;
2. `GET /api/health` tanpa auth, response `{ data: { status: "ok" } }`;
3. error envelope `{ error: { code, message, details? } }`;
4. `Content-Type: application/json; charset=utf-8`;
5. prinsip validasi Zod di server sebelum handler domain;
6. batas modul `learning`, `handbook`, `projects`, `shared/core`;
7. semua endpoint domain memerlukan sesi owner; health tidak;
8. tidak ada `/v1`, tidak ada registrasi publik.

P0.3-03 juga tetap tunduk pada izin dependency/OD-001; kontrak ini tidak memberi izin pemasangan Fastify atau Zod.

### 9.3 Harus tetap ditunda

- Implementasi Google Login callback, session, cookie, dan CSRF (OD-003 sudah disetujui; implementasi tetap menunggu Step 6/P0.4-03).
- Endpoint domain CRUD final beserta daftar field lengkap.
- Format konten Rich Text/Block Editor, import, dan export.
- Transisi versi Draft/Approved/Deprecated serta endpoint approval.
- Aturan `Mastered` dan progres.
- Format tanggal/waktu dan filter tanggal.
- Correlation ID publik, pagination final, dan versi API.

---

## 10. Hubungan dengan frontend existing

Audit P0.3-01 menunjukkan frontend belum memiliki API client, proxy `/api`, variabel environment, atau pemanggilan `fetch`. Karena itu:

1. Route SPA tidak diubah.
2. Settings tetap di `localStorage` dengan kunci `jasasaja.personal-os.settings.v1` sampai ada keputusan terpisah.
3. Integrasi berikutnya cukup menambahkan wrapper `fetch` bertipe minimal yang memakai path relatif `/api`; tidak ada dependency UI/state/data baru yang disetujui saat ini.
4. Data contoh pada dashboard tidak boleh dianggap sebagai respons API.

Dokumen ini selesai sebagai **Proposed**. Review terhadap PRD MVP v1.1 asli dan penutupan OD terkait diperlukan sebelum kontrak dianggap final atau diimplementasikan.
