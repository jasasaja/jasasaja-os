# Laporan Slice 0 — Fondasi Next.js 16.4 + Node 24 + shell SPA + GET /api/health

- **Tanggal:** 2026-11-28
- **Branch:** `feat/nextjs-migration` (tidak ada push/merge/rebase/reset)
- **Status:** Done — Commit 0 + tiga commit Slice 0 selesai dan diverifikasi
- **Dasar:** ADR-010 (Accepted) + amandemen 2026-11-27/2026-11-28; gerbang Slice 0 (a)–(d)

## 1. Ringkasan

Jalur Next.js 16.4.6 ditambahkan **di samping** Vite + Fastify yang tetap utuh. Shell SPA App Router memuat `src/App.tsx` lewat `dynamic(..., { ssr: false })` tanpa mengubah UI, dan `GET /api/health` publik setara dengan handler Fastify. Node 24 di-pin lewat `engines`, `.nvmrc`, dan CI. Sebelum Commit 0, lockfile ditemukan out-of-sync pada npm 11; sinkronisasi dilakukan sebagai Commit 0 terpisah sesuai persetujuan.

## 2. Preflight P1–P3 dan temuan lockfile

| Item | Hasil |
|---|---|
| P1 `node -v` | `v24.22.3` ✅ (`npm -v` = 11.19.1; `which node` = `/home/memorygroups/.nvm/versions/node/v24.22.3/bin/node`) |
| P2 `git status` / branch | bersih, `feat/nextjs-migration` ✅ |
| P3 `npm ci` (sebelum perbaikan) | ❌ EUSAGE: lockfile kehilangan 60 entri optional/platform (`@tailwindcss/oxide-*`, `lightningcss-*`, `@rolldown/binding-*`, `@typescript/typescript-*`, `@emnapi/*`, `@tybys/*`, `tslib`). Gagal juga dengan `--omit=optional` / `--dry-run`. |
| P3 `npm test` (node_modules existing) | 44 pass, 0 fail, 0 skipped, 0 todo, 2 suites |
| P3 `npm run typecheck` / `lint` / `build` | ✅ lulus (Vite: 1697 modul) |
| P3 setelah Commit 0 (`npm ci` + test/typecheck/lint/build) | ✅ `npm ci` sukses; test identik 44/0/0; typecheck/lint/build lulus |
| Verifikasi Commit 1 (ulang P3 di Node 24) | ✅ identik: 44/0/0; typecheck/lint/build lulus |

Catatan penting: karena `ci.yml` menjalankan `npm ci`, remote CI hampir pasti gagal pada kondisi lockfile sebelum Commit 0 (npm 11 mensyaratkan lockfile sinkron). Commit 0 memperbaiki kondisi tersebut.

### Bukti 3 syarat regenerasi lockfile (skrip node sementara di `/tmp`, tidak dikomit)

Perbandingan `git show HEAD:package-lock.json` vs hasil `npm install --package-lock-only` (tanpa `npm update`, tanpa `npm audit fix`, tanpa menghapus lockfile, tanpa menyentuh `node_modules`, `package.json` tidak berubah sesuai `git diff --stat`):

- Entri sebelum: **202**; sesudah: **262**; ditambah **60**, hilang **0**, berubah versi **0**.
- (a) tidak ada paket existing yang berubah versi: **PASS**
- (b) tidak ada paket existing yang hilang: **PASS**
- (c) semua 60 entri tambahan bersifat optional/platform-specific: **PASS** (60/60 ber-`optional: true`; 54/60 juga punya `os`/`cpu`/`libc`). Pemeriksaan awal yang hanya melihat `os`/`cpu` sempat menandai `tslib@2.9.1`; setelah kriteria diperbaiki menjadi "optional **atau** platform-specific", `tslib` terbukti `optional: true` (dep wasm dari `@tailwindcss/oxide-wasm32-wasi`).

Ringkasan entri tambahan per paket induk: `@tailwindcss/oxide` 10, `lightningcss` 10, `rolldown` 15, `typescript` 19, serta 6 helper wasm (`tslib`, `@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`). Semua adalah optional deps platform, bukan dependency baru yang dipilih manual.

## 3. Gerbang (a) — versi Next.js

Output `npm view next dist-tags`:

```
next-11: 11.1.4, next-12-2-6: 12.2.6, next-14-1: 14.1.1, rc: 15.0.0-rc.1,
next-13: 13.5.11, next-12-3-2: 12.3.7, beta: 16.0.0-beta.0, next-14: 14.2.35,
next-15-3: 15.3.9, next-15-2: 15.2.9, next-15-0: 15.1.12,
next-15-0-0: 15.0.8, backport: 15.5.29, latest: 16.4.6,
preview: 16.5.0-preview.0, canary: 16.5.0-canary.71
```

- Patch stabil tertinggi di jalur 16.4.x: **16.4.6** (≥ 16.4.5), juga `latest`. Dipilih karena memenuhi syarat dan merupakan patch termutakhir pada jalur yang disetujui.
- Tersedia 16.5.0-preview.0 dan 16.5.0-canary.71 — **dilaporkan, tidak dipakai** tanpa persetujuan. Tidak ada rilis stabil 16.5+.
- `npm view next@16.4.6 peerDependencies`: `react: ^18.2.0 || ... || ^19.0.0`, `react-dom: ^18.2.0 || ... || ^19.0.0`, plus `sass`, `@playwright/test`, `@opentelemetry/api`, `babel-plugin-react-compiler` (semuanya `optional: true` menurut `peerDependenciesMeta`).
- Terpasang: `react@19.3.1`, `react-dom@19.3.1` → memenuhi. Tidak ada peer wajib tambahan yang perlu diinstal.

## 4. Gerbang (b) — TypeScript 7

- **Berhasil dengan TypeScript 7.0.2; tidak ada fallback ke TS 6.x.**
- Sesuai dokumentasi `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/useTypeScriptCli.md`, CLI checker adalah default dan mendukung TS 7; tidak ada flag `experimental` yang ditambahkan.
- `npm run build:next` pertama gagal bukan karena TS 7, melainkan TS5097 (`An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled`) pada `src/app/api/health/route.test.ts`, `src/utils/dashboardActivity.test.ts`, `src/utils/focusTrap.test.ts`. Diperbaiki dengan menambahkan `"allowImportingTsExtensions": true` ke `tsconfig.next.json` (root/server tsconfig tidak disentuh).
- Build kedua sukses; log checker: `Running TypeScript ... Finished TypeScript in 1454ms ...`, diikuti `Generating static pages using 3 workers (3/3) in 281ms`. Rute: `○ /_not-found`, `ƒ /[[...slug]]`, `ƒ /api/health`.
- `typescript` di-`pin` exact `7.0.2` di `package.json` (semula `^7.0.2`) dan lockfile disinkronkan.
- Next mengubah format `tsconfig.next.json` dan men-set `jsx: react-jsx` di file tersebut (sesuai perilaku bawaan). `git diff` mengonfirmasi `tsconfig.json` dan `server/tsconfig.json` **tidak berubah**.

## 5. Dependency dan audit

| Dependency | Versi | Justifikasi 1 baris |
|---|---|---|
| `next` | `16.4.6` (exact) | Jalur Next.js baru yang disetujui gerbang (a). |
| `@tailwindcss/postcss` | `4.3.5` (exact) | Plugin PostCSS untuk Tailwind 4 di Next, menggantikan `@tailwindcss/vite` pada jalur Next saja. |
| `typescript` | `7.0.2` (exact, sudah ada) | Di-pin exact setelah CLI checker TS 7 terbukti lolos; bukan dependency baru. |

Tidak ada dependency lain yang ditambahkan; `vite`, `fastify`, `@tailwindcss/vite`, dan semua dependency lama tetap ada. Tidak ada `npm audit fix`.

`npm ls next react react-dom typescript`:

```
jasasaja-personal-os@0.1.0 /home/memorygroups/GitHub/jasasaja-os
├─┬ lucide-react@0.546.0
│ └── react@19.3.1 deduped
├─┬ next@16.4.6
│ ├── react-dom@19.3.1 deduped
│ ├── react@19.3.1 deduped
│ └─┬ styled-jsx@5.1.6
│   └── react@19.3.1 deduped
├─┬ react-dom@19.3.1
│ └── react@19.3.1 deduped
├── react@19.3.1
└── typescript@7.0.2
```

`npm audit --omit=dev`: **found 0 vulnerabilities**. (`npm ci` mencatat 4 moderate pada dependensi dev; tidak ada `audit fix` yang dijalankan.)

## 6. Commit dan stat

`git log --oneline -4` (diambil sebelum Commit 3 dibuat; Commit 3 = commit berisi laporan ini):

```
c58cfdf chore: tambah Next.js 16.4.x (pin exact) + konfigurasi
6c875c4 chore: Node 24 (engines, .nvmrc, CI)
4ff4564 chore: sinkronkan package-lock.json (npm 11, optional deps platform)
cfb2d43 docs: ADR-010 amandemen OD-001 migrasi (Better Auth, Next 16.4, Node 24)
```

`git show --stat`:

```
4ff4564 chore: sinkronkan package-lock.json (npm 11, optional deps platform)
 package-lock.json | 1307 ++++++++++++++++++++++++++++++++++++++++++++++-------
 1 file changed, 1154 insertions(+), 153 deletions(-)

6c875c4 chore: Node 24 (engines, .nvmrc, CI)
 .github/workflows/ci.yml | 4 ++--
 .nvmrc                   | 1 +
 package.json             | 3 +++
 3 files changed, 6 insertions(+), 2 deletions(-)

c58cfdf chore: tambah Next.js 16.4.x (pin exact) + konfigurasi
 .gitignore         |   2 +
 next.config.ts     |   9 +
 package-lock.json  | 977 +++++++++++++++++++++++++++++++++++++++++++++++--
 package.json       |   7 +-
 postcss.config.mjs |   7 +
 tsconfig.next.json |  31 ++
 6 files changed, 1012 insertions(+), 21 deletions(-)

Commit 3 "feat: shell SPA di Next.js + GET /api/health":
 .gitignore(next-env.d.ts sudah pada Commit 2), next.config.ts,
 src/app/layout.tsx, src/app/[[...slug]]/page.tsx,
 src/app/api/health/route.ts, src/app/api/health/route.test.ts,
 tsconfig.next.json, docs/nextjs-slice-0-report-2026-11-28.md
```

## 7. Butir 13 — proxy dev-only

Mekanisme: satu blok `rewrites()` di `next.config.ts`, aktif hanya jika `process.env.NODE_ENV === 'development'`. Menggunakan `beforeFiles` dengan source `/api/:path((?!health(?:/|$)).*)` dan destination `http://127.0.0.1:3001/api/:path`, meniru proxy Vite (`changeOrigin` tidak diperlukan pada rewrite server-side Next). Lookahead negatif mengecualikan `/api/health` dan turunannya, sehingga endpoint yang sudah dimigrasi selalu menang atas proxy. `next build` berjalan dengan `NODE_ENV=production`, sehingga array rewrite kosong di production.

Bukti runtime (Fastify sengaja dijalankan tanpa DB — `getDb()` hanya dipanggil saat handler butuh DB):

- Dev Next `/api/health` → 200 `{"data":{"status":"ok"}}` dengan header `Vary`/chunked khas Next ⇒ dilayani route Next, bukan proxy.
- Dev Next `/api/does-not-exist` → diteruskan ke Fastify, menghasilkan `401 UNAUTHENTICATED` dengan header Fastify (`content-length: 89`, `keep-alive: timeout=72`) ⇒ proxy bekerja.
- Production `start:next` tidak memuat rewrite (config memuat `NODE_ENV=production`).

Batasan: daftar pengecualian di regex harus diperbarui manual setiap kali endpoint baru dimigrasi. `beforeFiles` sengaja dipilih karena rewrites ini didahului oleh static files dan **sebelum** dynamic routes App Router; dengan `afterFiles`/`fallback`, halaman catch-all `[[...slug]]` akan menang lebih dulu sehingga proxy tidak terjangkau. Untuk slice berikutnya, bila migrasi bertambah, pertimbangkan memindahkan shell ke rute eksplisit lalu memakai `afterFiles`, atau memakai `proxy.ts`/middleware dengan daftar rute migrasi yang terpusat. Rewrite hanya untuk development; tidak ada auth/proxy di production.

## 8. Hasil curl dan perbandingan test

| Pemeriksaan | Hasil |
|---|---|
| Fastify `curl -i http://127.0.0.1:3001/api/health` | `200 OK`, `content-type: application/json; charset=utf-8`, `content-length: 24`, body `{"data":{"status":"ok"}}` |
| Next prod `curl -i http://localhost:3100/api/health` | `200 OK`, `content-type: application/json; charset=utf-8`, body identik `{"data":{"status":"ok"}}` (tanpa auth; `Vary` dari Next) |
| Next prod `curl -i http://localhost:3100/` | `200 OK`, `text/html; charset=utf-8`, HTML shell dengan `<html lang="id">`, `<title>JASASAJA Personal OS</title>` dan metadata setara `index.html` |
| Next prod `curl -i "http://localhost:3100/learning?item=x"` | `200 OK`, `text/html; charset=utf-8`, HTML shell sama; payload RSC memuat `searchParams: {"item":"x"}` dan `params.slug: ["learning"]` |

Semua server (`start:next`, `dev:next`, Fastify) dihentikan setelah pengujian; tidak ada proses tersisa pada port 3100/3001.

| Test | Sebelum | Sesudah |
|---|---|---|
| `npm test` | 44 pass / 0 fail / 0 skipped / 0 todo (2 suites) | 45 pass / 0 fail / 0 skipped / 0 todo (2 suites) — +1 test baru `route.test.ts`; 44 test lama tetap lulus |
| `npm run typecheck` | lulus | lulus |
| `npm run lint` | lulus | lulus |
| `npm run build` (Vite) | lulus, 1697 modul | lulus, 1697 modul |
| `npm run build:next` | N/A | lulus; CLI checker TS 7 selesai dalam 1454 ms |

## 9. Gerbang (d) — Cache Components

Isi `next.config.ts` (final):

```ts
import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  typescript: {
    tsconfigPath: './tsconfig.next.json',
  },
  ...(isDevelopment
    ? {
        async rewrites() {
          return {
            // beforeFiles mendahului halaman catch-all App Router. Health dikecualikan
            // eksplisit agar rute yang sudah dimigrasi selalu menang atas proxy.
            beforeFiles: [
              {
                source: '/api/:path((?!health(?:/|$)).*)',
                destination: 'http://127.0.0.1:3001/api/:path',
              },
            ],
          };
        },
      }
    : {}),
};

export default nextConfig;
```

Tidak ada `cacheComponents: true`, tidak ada flag `experimental`, tidak ada `useTypeScriptCli: false` (default CLI dipakai). Cache Components **tidak aktif** ✅.

## 10. Batas scope

- `src/App.tsx` dan komponen UI: **tidak diubah** (baris per baris: nol perubahan).
- Asset: tidak ada direktori `src/assets`, tidak ada referensi `/src/assets/...` di `src/` ⇒ tidak perlu replikasi ke `public/`.
- Vite, Fastify, `server/**`, schema, migrasi, seed, script/tsconfig lama: tidak diubah. `.env*` tidak disentuh; tidak ada docker/DB; tidak ada Better Auth/endpoint domain baru; tidak ada ESLint/runner test/Vercel config; tidak ada push/merge/rebase/reset/force.
- `next dev` menghasilkan `AGENTS.md` otomatis; file tersebut dihapus kembali (untracked, tidak dikomit) agar hanya laporan ini yang menjadi perubahan docs.
- Satu-satunya file docs yang ditambahkan: `docs/nextjs-slice-0-report-2026-11-28.md` (masuk Commit 3, tidak dikomit terpisah).
