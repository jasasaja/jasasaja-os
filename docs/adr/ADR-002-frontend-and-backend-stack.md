# ADR-002: Frontend and Backend Stack

- **Status:** **Accepted** untuk stack inti (React + Vite + TypeScript, Node.js + TypeScript + Fastify, PostgreSQL, Drizzle, Zod); OD-001 (pinning versi dependency backend yang disetujui) **Approved — 2026-11-25**
- **Tanggal:** 2026-11-24
- **Diperbarui:** 2026-11-25 — OD-001 disetujui pengguna untuk versi dependency backend tertentu.
- **Sumber:** Brief Phase 0.1 & 0.2, persetujuan stack 2026-11-24, Master Blueprint v1.1 §8 (OD-001), hasil inspeksi repository, persetujuan tertulis pengguna 2026-11-25.

## Konteks

Frontend React + Vite + TypeScript sudah berjalan dan dinyatakan lulus 23 unit test, typecheck, lint, production build, serta QA manual browser/aksesibilitas/responsive dan final code review. Pengguna menyetujui stack inti pada 2026-11-24: frontend React + Vite + TypeScript dipertahankan, backend Node.js + TypeScript + Fastify, database PostgreSQL, ORM Drizzle, dan validator Zod. Versi dependency final belum disetujui dan tetap menjadi OD-001.

## Keputusan

**Frontend (Accepted):** pertahankan React + Vite + TypeScript dengan Tailwind CSS dan `lucide-react` yang sudah ada, dengan `tsx + node:test` untuk unit test. Versi yang terpasang di repository menjadi baseline validasi, tetapi pinning versi final masih menunggu OD-001. Tidak ada dependency UI/state/data baru sampai use case membuktikan kebutuhan.

**Backend (Accepted):** Node.js + TypeScript + Fastify, satu proses HTTP JSON di repository yang sama. Zod untuk validasi request. API berada di prefix `/api`, dengan health check dan error envelope seragam. Express dan Hono tidak dipilih untuk MVP; keduanya tetap tercatat sebagai alternatif historis, bukan pilihan aktif. Belum ada dependency backend yang dipasang dalam task dokumentasi ini.

### Status turunan

| Keputusan | Status | Keterangan |
|---|---|---|
| Pertahankan React + Vite + TypeScript | **Accepted** | Dikonfirmasi pengguna |
| Tanpa migrasi framework tanpa ADR + persetujuan | **Accepted** | Dikonfirmasi pengguna |
| `tsx + node:test` sebagai test runner frontend | **Accepted** | Sudah terpasang dan lolos 23/23 test |
| Node.js + TypeScript sebagai bahasa backend | **Accepted** | Disetujui pengguna 2026-11-24 |
| Fastify sebagai framework API utama | **Accepted** | Disetujui pengguna; belum dipasang |
| Express sebagai fallback | **Tidak dipilih** | Konsekuensi dari pilihan Fastify; arsip alternatif |
| Zod sebagai validator server | **Accepted** | Disetujui pengguna |
| Pinning dependency backend (OD-001) | **Accepted — 2026-11-25** | Disetujui tertulis pengguna: `fastify@5.12.8`, `zod@4.6.7`, `drizzle-orm@0.45.4`, `drizzle-kit@0.31.11` (dev), `pg@8.23.1`, `@types/pg@8.23.1` (dev). `typescript` dan `tsx` tetap versi existing repo. Belum dipasang; instalasi menunggu langkah implementasi yang diizinkan. |
| Vitest + Playwright | **Proposed** | Blueprint kandidat; belum diputuskan, tidak dipasang sekarang |
| Zustand, TanStack Query, Dexie, PWA framework, AI adapter | **Rejected** | Dilarang sebelum use case MVP terbukti |
| Migrasi ke Next.js / framework lain | **Rejected** | Tidak sesuai larangan migrasi tanpa ADR dan persetujuan |

## Opsi yang dipertimbangkan

| Opsi | Kompleksitas | Biaya | Single-user | Dev lokal | Deployment | Lock-in | Status |
|---|---|---|---|---|---|---|---|
| Pertahankan React + Vite + TS | Rendah | Rendah | Baik | Baik | Baik | Rendah | **Accepted** |
| Node + TS + Fastify | Sedang | Rendah | Baik | Baik | Baik | Rendah | **Accepted** (utama) |
| Node + TS + Express | Rendah | Rendah | Baik | Baik | Baik | Rendah | **Tidak dipilih** (arsip alternatif) |
| Node + TS + Hono | Sedang | Rendah | Baik | Baik | Baik | Rendah | **Tidak dipilih** (arsip alternatif) |
| BaaS/serverless | Sedang | Sedang–Tinggi | Cukup | Baik | Baik | Tinggi | **Rejected** untuk MVP |
| Python + FastAPI | Sedang | Rendah | Cukup | Cukup | Cukup | Rendah | **Rejected** — bahasa kedua |

## Konsekuensi

**Positif:** satu bahasa untuk frontend dan backend, lockfile frontend tetap stabil, routing SPA tidak berubah, dan API dapat ditambahkan tanpa mengganti build tool.

**Negatif:** frontend dan backend tetap dua proses saat development; perlu proxy `/api` dan dokumentasi port. Backend belum memiliki test runner sendiri sampai diputuskan.

## Risiko

- Ketidaksesuaian versi Node dengan Vite 8/TypeScript 7.
- `npm test` memakai glob shell yang belum diverifikasi di Windows.
- Warning `__dirname` pada `vite.config.ts` dapat menjadi isu pada config loader native Vite mendatang.

## Verifikasi saat implementasi

- `npm ci`, `npm test` (23/23), `npm run typecheck`, `npm run lint`, `npm run build` tetap lulus setelah backend ditambahkan.
- Health check API merespons dan proxy `/api` bekerja pada development.
- Tidak ada perubahan pada 5 route SPA yang sudah ada.

## Rollback

Backend dapat dihapus dari repository sebelum rilis tanpa memengaruhi frontend, karena belum ada dependency frontend yang bergantung padanya. Setelah integrasi Phase 1, rollback dilakukan dengan mematikan pemanggilan API dan mengembalikan data contoh yang berlabel.
