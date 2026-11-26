# ADR-004: Authentication and Authorization

- **Status:** **Accepted** — Google Login, single owner, tanpa registrasi publik; detail session/cookie/CSRF/guard scope disetujui via OD-003 (2026-11-25)
- **Tanggal:** 2026-11-24
- **Diperbarui:** 2026-11-25 — OD-003 disetujui eksplisit oleh pengguna (rekomendasi disetujui).
- **Sumber:** Master Blueprint v1.1 §9 (OD-003), PRD MVP v1.1 NFR-01/§4, persetujuan autentikasi pengguna 2026-11-24, persetujuan OD-003 2026-11-25.

## Konteks

Aplikasi ditargetkan untuk satu pemilik dengan deployment hybrid: lokal sekarang dan online kemudian. PRD tidak memerlukan multi-tenant atau role kompleks, tetapi mewajibkan validasi dan ownership check di server. Pengguna menyetujui **Google Login** sebagai mekanisme autentikasi pada 2026-11-24.

Keputusan sebelumnya dalam ADR ini menggunakan password hash (Argon2id/bcrypt). Keputusan itu dicatat sebagai riwayat dan telah digantikan; bukan lagi acuan implementasi. Tidak ada akun Google OAuth, project, domain, atau layanan berbayar yang dibuat dalam task dokumentasi ini.

## Keputusan

Gunakan **Google Login** untuk memverifikasi identitas pemilik. Akses dibatasi untuk **satu akun owner** yang dipetakan secara eksplisit dari identitas Google yang disetujui; **tidak ada endpoint registrasi publik**. Setelah autentikasi Google berhasil, backend membuat sesi aplikasi untuk menandai request berikutnya.

**OD-003 (Approved 2026-11-25) — detail session/cookie/CSRF/guard:**
- **Session:** Server-side session di PostgreSQL dengan opaque session ID di cookie. Browser tidak menyimpan token/data sesi sensitif di localStorage. Session dapat dicabut server-side (logout/revoke/expiry). Token Google tidak diekspos ke frontend; default MVP tidak menyimpan token Google lebih lama dari yang dibutuhkan untuk verifikasi login kecuali kebutuhan minimal terdokumentasi.
- **Cookie:** `HttpOnly=true`, `SameSite=Lax`, `Path=/`. `Secure=true` saat HTTPS/production; non-Secure hanya untuk local HTTP development melalui konfigurasi env (bukan hardcode). Nama cookie/TTL/idle timeout final ditetapkan saat implementasi Step 6 dan didokumentasikan.
- **CSRF:** Defense-in-depth: `SameSite=Lax` + verifikasi `Origin/Referer` terhadap allowlist origin aplikasi untuk request state-changing (`POST/PATCH/DELETE`) + `Content-Type: application/json`. CSRF token synchronizer per session dikirim via `X-CSRF-Token` untuk mutasi state. OAuth `state`/nonce wajib divalidasi.
- **Guard scope:** Default semua endpoint `/api/**` protected kecuali allowlist eksplisit. `GET /api/health` **tetap publik**. Endpoint auth flow tertentu publik hanya untuk flow yang didefinisikan dan tetap tervalidasi. Semua endpoint domain memerlukan session owner valid. `401` untuk sesi tidak valid/tidak ada; `403` untuk bukan owner yang dipetakan (default MVP).

Seluruh endpoint domain tetap dilindungi **guard owner** di server; query dibatasi pada scope owner. Tidak ada tabel tenant, invitation, atau role hierarchy pada MVP.

### Status turunan

| Keputusan | Status | Keterangan |
|---|---|---|
| Google Login untuk owner | **Accepted** | Disetujui pengguna 2026-11-24 |
| Satu akun owner, tanpa registrasi publik | **Accepted** | Dikonfirmasi pengguna |
| Password hash Argon2id/bcrypt | **Rejected** | Digantikan Google Login; tetap dicatat sebagai riwayat |
| Magic link/OTP email | **Rejected** | Menambah provider eksternal untuk satu pengguna |
| Provider identitas selain Google | **Tidak dipilih** | Konsekuensi dari pilihan Google Login |
| Detail session/cookie/CSRF/guard scope (OD-003) | **Accepted** | Disetujui pengguna 2026-11-25; detail implementasi final (nama cookie/TTL/skema session/path) ditetapkan di Step 6 |
| Otorisasi dan ownership check di server | **Accepted sebagai requirement** | Blueprint §9, PRD NFR-01 |
| Tanpa multi-tenant/role kompleks | **Accepted** | Dikonfirmasi pengguna |
| Tanpa autentikasi karena single-user | **Rejected** | Tidak kompatibel dengan target online |

## Opsi yang dipertimbangkan

| Opsi | Kompleksitas | Biaya | Single-user | Dev lokal | Deployment | Lock-in | Status |
|---|---|---|---|---|---|---|---|
| Google Login + owner tunggal | Sedang | Rendah–Sedang | Baik | Baik | Baik | Sedang | **Accepted** (utama) |
| Owner + password hash + cookie session | Rendah | Rendah | Baik | Baik | Baik | Rendah | **Rejected** — digantikan Google Login |
| Magic link/OTP email | Sedang | Sedang | Cukup | Cukup | Cukup | Sedang | **Rejected** |
| SSO/identity provider selain Google | Sedang | Rendah–Sedang | Cukup | Cukup | Cukup | Sedang | **Tidak dipilih** |
| Tanpa autentikasi | Rendah | Rendah | Buruk untuk online | Baik | Buruk | Rendah | **Rejected** |

## Konsekuensi

**Positif:** aplikasi tidak menyimpan atau mengelola password owner; satu identitas Google dipetakan ke satu akun; tidak ada registrasi publik.

**Negatif:** bergantung pada konfigurasi Google Login saat aktivasi; detail session masih perlu diputuskan sebelum implementasi endpoint; bila di masa depan diperlukan multi-user, scope owner perlu dimigrasikan.

## Risiko

- Konfigurasi Google Login/redirect belum diverifikasi → mitigasi: verifikasi saat aktivasi; jangan membuat akun atau project pada task dokumentasi.
- Cookie `Secure` berbeda antara local HTTP dan HTTPS production → mitigasi: konfigurasi env-aware; jangan hardcode Secure=false di production.
- CSRF/origin misconfiguration dapat memblokir flow sah atau melemahkan proteksi → mitigasi: uji allowlist Origin/Referer, CSRF token, dan OAuth state/nonce saat Step 6.
- Ketergantungan pada identity provider eksternal → mitigasi: catat sebagai dependency operasional; tidak ada layanan berbayar yang diaktifkan tanpa persetujuan.
- Asumsi single-user berubah → mitigasi: catat sebagai perubahan scope, bukan perubahan diam-diam.

## Verifikasi saat implementasi

- Callback Google Login hanya menerima identitas yang dipetakan ke owner tunggal; `state`/nonce divalidasi.
- Request tanpa session valid ke endpoint protected mendapat `401`; identitas bukan owner mendapat `403` (atau kebijakan non-disclosure yang didokumentasikan).
- `GET /api/health` tetap publik; endpoint domain tidak publik.
- Cookie session: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` env-aware.
- Request mutasi tanpa CSRF valid/Origin valid ditolak.
- Tidak ada password, token, secret, atau session cookie value yang muncul di log, diff, atau response.

## Riwayat perubahan

- 2026-11-24: status awal `Proposed` dengan password hash Argon2id/bcrypt. Pengguna menyetujui Google Login, sehingga password login menjadi `Rejected`/superseded. Alasan: keputusan eksplisit pengguna; alasan lama ("tanpa layanan eksternal") tidak lagi mengikat.
- 2026-11-25: OD-003 disetujui eksplisit oleh pengguna sesuai rekomendasi. Session server-side DB + opaque HttpOnly cookie (`SameSite=Lax`, `Secure` env-aware, `Path=/`), CSRF defense-in-depth (Origin/Referer + JSON + `X-CSRF-Token`), guard default-protected `/api/**` dengan allowlist publik minimum `GET /api/health` dan auth flow yang didefinisikan. Nama cookie/TTL/skema session/path final ditetapkan saat Step 6.

## Rollback

Nonaktifkan callback Google Login dan kembalikan aplikasi ke mode lokal tanpa data produksi. Prosedur pemulihan akses owner harus terdokumentasi tanpa mengekspos secret. Riwayat password hash tetap berada di arsip ADR, bukan di acuan implementasi.
