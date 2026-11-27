# OD-002 Deploy Constraint Note — Fastify on Vercel

- **Tanggal:** 2026-11-27
- **Status:** Catatan constraint/release-readiness (OD-002 Approved 2026-11-26 dengan constraint)
- **Tujuan:** Membuat keputusan deploy/OD-002 jelas sebelum ada klaim release/deploy-ready.

## 1. Keputusan OD-002 yang sudah disetujui

Sesuai [adr-status.md](./adr-status.md): frontend Vercel Free, API di Vercel, DB Neon Free, domain default, Rp0/bulan. Tidak ada akun/project/deploy yang dibuat.

## 2. Constraint aktual

Backend saat ini adalah **Fastify long-running Node server** (`server/src/server.ts`, listen port). Target OD-002 menyebut API di Vercel, tetapi Vercel umumnya menjalankan fungsi serverless/edge; long-running process model tidak sama dengan model server lokal.

| Area | Kondisi saat ini | Implikasi |
|---|---|---|
| Server entry | `server/src/server.ts` menjalankan Fastify listen | Perlu entrypoint/adaptor untuk serverless, atau strategi deploy lain |
| Runtime model | Long-running Node process | Cold start, connection pooling, lifecycle, dan batas eksekusi serverless perlu dievaluasi |
| DB connection | `pg` pool via Drizzle | Neon serverless/pooling strategy perlu dipilih saat deploy; jangan hardcode secret |
| Auth/session | Cookie/session DB-backed | Domain/cookie/secure/samesite/callback URL perlu konfigurasi environment produksi |
| CORS/origin | Environment-aware | Vercel domain/default domain harus masuk konfigurasi eksplisit |
| Migrations | Drizzle migrations | Tidak boleh auto-run destruktif di deploy; perlu prosedur rilis |

## 3. Opsi yang perlu diputuskan (belum dipilih/diimplementasikan)

1. **Adaptasi Fastify ke Vercel serverless** — buat entrypoint serverless yang membungkus Fastify app; verifikasi lifecycle, pg pool, dan batas runtime. Butuh slice implementasi + verifikasi.
2. **Pisahkan target deploy API** — pertahankan Fastify long-running di platform Node yang cocok, frontend tetap Vercel. Ini **mengubah detail OD-002** dan butuh persetujuan keputusan baru.
3. **Tunda deploy online** — tetap lokal/dev sampai adaptasi/keputusan dipilih. Paling aman untuk MVP saat ini.

Tidak ada opsi di atas yang diimplementasikan oleh P4.5.

## 4. Release-readiness decision

- **Deploy-ready:** **NO** (constraint OD-002 belum diimplementasikan).
- **Local/dev hardening ready for manual commit+CI check:** **YES, dengan known gaps tercatat**.
- **Aktivasi akun/hosting/produksi:** **NO** tanpa persetujuan eksplisit terpisah.

## 5. Next smallest action

Buat slice keputusan/implementasi terpisah: pilih strategi OD-002 (adaptasi Vercel serverless vs perubahan target hosting API), dokumentasikan ADR/update, lalu implementasikan entrypoint/config setelah persetujuan eksplisit. Jangan aktifkan akun/deploy dalam slice dokumentasi ini.
