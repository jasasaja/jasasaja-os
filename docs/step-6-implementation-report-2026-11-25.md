# Implementation Report — Step 6 (P0.4-03)

## 1. Task
**STEP 6 — Validation, Auth Guard & Session (P0.4-03)**

## 2. Status
**PASS (foundation, dengan batasan verifikasi E2E Google OAuth)**

## 3. Hasil
Fondasi auth/session/guard/CSRF sesuai OD-003 diimplementasikan pada backend lokal. `GET /api/health` tetap publik. Endpoint `/api/**` selain allowlist publik kini dilindungi guard. Google OAuth start/callback diimplementasikan, tetapi **E2E dengan kredensial Google nyata belum diverifikasi** karena environment ini tidak memiliki kredensial nyata dan tidak boleh membuat/ memakai akun/provider produksi.

**Yang diimplementasikan:**
- **Schema/migrasi session:** tabel `sessions` (`token_hash` unique, `csrf_token`, `owner_subject`, `owner_email`, `expires_at`, `revoked_at`, timestamps C2) via `0001_add_sessions.sql`.
- **Session service:** create/find active/revoke session; token acak opaque, hash SHA-256 di DB, expiry via SQL `now() + interval` (konsisten PGTZ Asia/Jakarta).
- **Cookie helpers:** parse/serialize/expire cookie; session cookie `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` env-aware.
- **Guard terpusat (`preHandler`):** default protect `/api/**`; allowlist publik `GET /api/health`, `GET /api/auth/google/start`, `GET /api/auth/google/callback`; OPTIONS pass-through; request mutasi protected butuh session valid + Origin/Referer allowlist + `Content-Type: application/json` + `X-CSRF-Token` valid.
- **Auth routes:**
  - `GET /api/auth/google/start` — buat OAuth state/nonce cookie signed, redirect ke Google (503 jika config belum lengkap).
  - `GET /api/auth/google/callback` — validasi state/nonce, exchange code, fetch userinfo, verifikasi `email_verified` dan allowlist owner, buat session, set cookie, redirect ke app.
  - `GET /api/auth/me` — butuh session; mengembalikan owner + csrfToken.
  - `POST /api/auth/logout` — butuh session + CSRF; revoke session dan clear cookie.
- **Validation/error handling:** input auth/callback divalidasi; error memakai envelope standar; tidak membocorkan stack/secret.
- **Logging redaction:** tambah `req.headers.x-csrf-token`.
- **.env.example:** tambah placeholder auth/Google/session/origin (tanpa secret nyata).

**Tidak dilakukan:**
- Tidak ada endpoint domain.
- Tidak ada verifikasi E2E Google OAuth dengan kredensial nyata.
- Tidak ada integrasi Neon/produksi/deploy/CI/backup drill.
- Tidak ada dependency baru.
- Tidak ada commit/push.

## 4. File Changed
**Baru (Step 6):**
- `server/src/db/migrations/0001_add_sessions.sql`
- `server/src/db/migrations/meta/0001_snapshot.json` (drizzle-kit)
- `server/src/modules/shared/core/auth/config.ts`
- `server/src/modules/shared/core/auth/crypto.ts`
- `server/src/modules/shared/core/auth/cookies.ts`
- `server/src/modules/shared/core/auth/oauth-state.ts`
- `server/src/modules/shared/core/auth/sessions.ts`
- `server/src/modules/shared/core/auth/guard.ts`
- `server/src/modules/shared/core/auth/routes.ts`
- `docs/step-6-implementation-report-2026-11-25.md`

**Diubah (Step 6):**
- `server/src/db/schema/shared.ts` — tambah tabel `sessions`.
- `server/src/db/migrations/meta/_journal.json` — entry migrasi 0001.
- `server/src/app.ts` — pasang `authGuard` preHandler + register auth routes.
- `server/src/modules/shared/core/logger.ts` — redaksi `x-csrf-token`.
- `.env.example` — placeholder auth/session/origin.
- `README.md` — status Step 6.
- `docs/phase-0-backlog.md` — P0.4-03 Done (dengan batasan verifikasi) + ringkasan.

**Pre-existing (tidak disentuh):** `metadata.json` terhapus; perubahan user sebelumnya pada file frontend/vite/tsconfig/package dll tetap ada.

## 5. Verification
| Pemeriksaan | Hasil aktual | Status |
|---|---|---|
| `npm run db:generate -- --name=add_sessions` | `0001_add_sessions.sql` dibuat (additive) | PASS |
| `npm run db:migrate` | Migrasi diterapkan sukses | PASS |
| `npm run typecheck` | Pass (setelah perbaikan import path/unused param) | PASS |
| `GET /api/health` (tanpa session) | `200 {"data":{"status":"ok"}}` | PASS |
| `GET /api/auth/me` (tanpa session) | `401 UNAUTHENTICATED` | PASS |
| `GET /api/learning/some-id` (protected arbitrary path, tanpa session) | `401 UNAUTHENTICATED` (guard default-protected) | PASS |
| `POST /api/auth/logout` (tanpa session) | `401 UNAUTHENTICATED` | PASS |
| `GET /api/auth/me` (dengan session DB-inserted + cookie) | `200` dengan owner + `csrfToken` | PASS |
| `POST /api/auth/logout` dengan session, tanpa CSRF | `403 FORBIDDEN` "CSRF token tidak valid." | PASS |
| `POST /api/auth/logout` dengan session, Origin salah | `403 FORBIDDEN` "Origin request tidak diizinkan." | PASS |
| `POST /api/auth/logout` dengan session, tanpa Content-Type json | `400 VALIDATION_ERROR` "Content-Type harus application/json." | PASS |
| `POST /api/auth/logout` dengan session + Origin benar + JSON + CSRF benar | `200 {"data":{"ok":true}}`, cookie cleared | PASS |
| `GET /api/auth/me` setelah logout (cookie lama) | `401 UNAUTHENTICATED` | PASS |
| `GET /api/auth/google/start` (OAuth belum dikonfigurasi) | `503 SERVICE_UNAVAILABLE` "Google Login belum dikonfigurasi." | PASS |
| `GET /api/auth/google/callback` (OAuth belum dikonfigurasi) | `503 SERVICE_UNAVAILABLE` | PASS |
| Leak check response verifikasi | Tidak ada database URL, client secret placeholder, atau stack trace | PASS |
| `npm ci` | Berhasil (warning engine/deprecation/vuln npm diketahui) | PASS (warning) |
| `npm test` | 23/23 pass, 0 fail | PASS |
| `npm run typecheck` | Pass | PASS |
| `npm run lint` | Pass | PASS |
| `npm run build` | Pass (warning Vite `__dirname` diketahui) | PASS (warning) |
| `git diff --check` | Pass | PASS |

## 6. Acceptance Criteria (P0.4-03)
| Kriteria | Status | Catatan |
|---|---|---|
| Semua input divalidasi dengan schema server sesuai ADR-002/ADR-004 | Terpenuhi (fondasi) | Zod/AppError dipakai; callback params/config divalidasi; mutasi butuh JSON+Origin+CSRF. Belum ada endpoint domain untuk validasi payload domain. |
| Endpoint domain menolak request tanpa session owner yang valid | Terpenuhi oleh guard default | `/api/**` protected kecuali allowlist; diuji dengan path protected arbitrary. Belum ada endpoint domain nyata. |
| Error tidak membocorkan secret, stack trace, atau data privat | Terpenuhi pada verifikasi | Error envelope standar; redaksi logger diperluas; leak check PASS. |
| Status HTTP dan pesan error sesuai kontrak API P0.3-02 | Terpenuhi pada skenario terverifikasi | 200/400/401/403/503 sesuai kontrak. |

## 7. Risks & Limitations
- **Google OAuth E2E belum diverifikasi** dengan kredensial nyata; flow start/callback diimplementasikan berdasarkan kontrak OD-003, tetapi perlu verifikasi saat kredensial dev tersedia.
- **OIDC nonce/id_token validation** belum penuh: callback memakai server-side code exchange + userinfo endpoint; nonce dikirim ke Google tetapi belum divalidasi dari id_token. Perlu hardening saat verifikasi OAuth nyata.
- **Session expiry C2:** expiry dihitung di DB dengan `now() + interval` (PGTZ Asia/Jakarta) untuk konsistensi; tetap membawa tradeoff C2 yang sudah dicatat.
- **Unknown `/api/*` path tanpa session mengembalikan 401, bukan 404** karena guard default-protected berjalan dulu. Ini aman (no disclosure) tetapi berbeda dari perilaku "not found" publik; perlu dicatat sebagai perilaku guard.
- **Belum ada rate limiting / brute-force protection** pada auth endpoints.
- **Belum ada test backend otomatis** dalam `npm test`; verifikasi Step 6 dilakukan dengan script ad-hoc sementara terhadap server lokal.
- **No dependency addition**; cookie/crypto/oauth dilakukan manual/fetch. Perlu review keamanan lebih lanjut sebelum produksi.

## 8. Documentation
- `README.md` — status Step 6/auth foundation.
- `docs/phase-0-backlog.md` — P0.4-03 Done (dengan batasan verifikasi).
- `.env.example` — placeholder auth/session/origin.
- `docs/step-6-implementation-report-2026-11-25.md` — laporan ini.

## 9. Git Status
- **Branch:** `main`
- **HEAD:** `76cede7`
- **Working tree:** dirty/uncommitted; pre-existing deletions/modifications user tetap ada. Step 6 menambah schema/migrasi/auth modules dan update app/env/docs.
- **`git diff --check`:** PASS.

## 10. Recommendation
**STOP — menunggu instruksi eksplisit.**

Langkah berikutnya yang logis adalah **STEP 7 — Verification Pipeline & CI (P0.5-01)** (masih butuh keputusan/cakupan CI; `.github/` belum ada) atau menyelesaikan verifikasi/dokumen lain sesuai Phase 0. Namun OD-006 (backup/restore) masih Open dan memblokir P0.5-02; hosting OD-002 masih Open (tidak memblokir lokal).

Saya tidak akan lanjut ke Step 7 tanpa instruksi eksplisit Anda. Jika lanjut, sebutkan cakupan yang diinginkan (mis. hanya dokumentasi command + CI GitHub Actions dasar Rp0, atau audit/verifikasi lain).