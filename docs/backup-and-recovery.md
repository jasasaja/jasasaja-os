# Backup and Recovery — JASASAJA Personal OS

- **Status:** Draft operasional (OD-006 Approved 2026-11-25)
- **Cakupan:** Database development/lokal non-produksi. Backup/restore produksi/Neon butuh keputusan terpisah.
- **Prinsip:** jangan commit dump, checksum, atau secret; jangan jalankan operasi destruktif pada DB dev/prod existing saat restore drill.

## Keputusan OD-006 (Approved)
- Frekuensi: **manual per minggu + sebelum perubahan schema/migrasi**.
- Retensi: **7 backup lokal** (hapus yang paling lama setelah backup baru tervalidasi).
- Lokasi: **`./backups/`** (gitignored).
- Format: **`pg_dump -Fc`** + checksum **SHA256**.
- Restore drill: minimal sekali pada lingkungan **non-production / DB scratch**, hasil tercatat.

## Prasyarat
- Docker Compose dev stack berjalan (`jasasaja-os-dev-postgres`).
- Akses ke container postgres atau `pg_dump`/`pg_restore`/`psql` yang kompatibel.
- File `.env` lokal tersedia untuk kredensial dev; jangan cetak nilai secret.

Di environment ini, `pg_dump`/`psql`/`pg_restore`/`sha256sum` tersedia **di dalam container postgres**, bukan di host. Gunakan `docker compose exec -T postgres ...`.

## Konvensi nama file
Gunakan timestamp lokal yang jelas dan nama DB:

```text
./backups/jasasaja_os_dev_YYYYMMDDTHHMMSSZ.dump
./backups/jasasaja_os_dev_YYYYMMDDTHHMMSSZ.dump.sha256
```

Contoh: `jasasaja_os_dev_20261126T074500Z.dump`

## Prosedur Backup (manual)

1. Pastikan DB dev healthy:
   ```bash
   docker compose ps
   ```
2. Buat folder backup (gitignored):
   ```bash
   mkdir -p backups
   ```
3. Buat dump format custom dari container postgres. Jalankan dari root repo; kredensial diambil dari env container compose (jangan echo):
   ```bash
   TS=$(date -u +%Y%m%dT%H%M%SZ)
   docker compose exec -T postgres sh -lc 'pg_dump -Fc -U "$POSTGRES_USER" -d "$POSTGRES_DB"' > "backups/jasasaja_os_dev_${TS}.dump"
   ```
4. Buat checksum SHA256:
   ```bash
   sha256sum "backups/jasasaja_os_dev_${TS}.dump" > "backups/jasasaja_os_dev_${TS}.dump.sha256"
   ```
5. Verifikasi checksum:
   ```bash
   sha256sum -c "backups/jasasaja_os_dev_${TS}.dump.sha256"
   ```
6. Rotasi retensi (simpan 7 terbaru). Hapus pasangan dump+sha256 tertua hanya setelah backup baru tervalidasi:
   ```bash
   ls -1t backups/jasasaja_os_dev_*.dump | tail -n +8
   # review output, lalu hapus manual file yang sesuai beserta .sha256-nya
   ```

## Prosedur Restore Drill (DB scratch non-produksi)

**Jangan restore ke DB dev existing atau DB produksi.** Gunakan DB scratch baru, lalu hapus setelah verifikasi.

1. Pilih file dump yang tervalidasi:
   ```bash
   sha256sum -c backups/<file>.dump.sha256
   ```
2. Buat DB scratch di container postgres (nama berbeda dari dev):
   ```bash
   docker compose exec -T postgres sh -lc 'createdb -U "$POSTGRES_USER" jasasaja_os_restore_drill'
   ```
3. Restore dump ke scratch DB:
   ```bash
   cat backups/<file>.dump | docker compose exec -T postgres sh -lc 'pg_restore --no-owner --no-privileges -U "$POSTGRES_USER" -d jasasaja_os_restore_drill'
   ```
4. Verifikasi smoke check:
   ```bash
   docker compose exec -T postgres sh -lc 'psql -U "$POSTGRES_USER" -d jasasaja_os_restore_drill -c "SELECT COUNT(*) FROM projects;"'
   docker compose exec -T postgres sh -lc 'psql -U "$POSTGRES_USER" -d jasasaja_os_restore_drill -c "SELECT COUNT(*) FROM learning_paths;"'
   docker compose exec -T postgres sh -lc 'psql -U "$POSTGRES_USER" -d jasasaja_os_restore_drill -c "SELECT COUNT(*) FROM handbook_items;"'
   docker compose exec -T postgres sh -lc 'psql -U "$POSTGRES_USER" -d jasasaja_os_restore_drill -c "SELECT conname, contype FROM pg_constraint WHERE contype IN (''f'',''p'',''u'') ORDER BY conname LIMIT 20;"'
   ```
5. Bandingkan minimal jumlah record kunci dengan DB sumber (dev). Jika ada mismatch, investigasi sebelum menganggap backup valid.
6. Hapus DB scratch setelah drill:
   ```bash
   docker compose exec -T postgres sh -lc 'dropdb -U "$POSTGRES_USER" jasasaja_os_restore_drill'
   ```

## Penanganan Secret & Keamanan
- Jangan commit `./backups/`, dump, checksum, atau output log yang berisi `DATABASE_URL`/password/token.
- Jangan upload backup ke layanan pihak ketiga tanpa persetujuan eksplisit.
- Backup berisi data sensitif; perlakukan sebagai data privat.
- Gunakan env/compose config untuk kredensial; jangan hardcode.

## Kapan Backup Wajib
- Minimal 1x per minggu (manual).
- Sebelum perubahan schema/migrasi.
- Sebelum operasi data besar/import/export yang berisiko.

## Bukti Restore Drill
Catat setiap drill di laporan step/operasional: tanggal, file dump, checksum OK/tidak, DB scratch, hasil count/FK/smoke check, dan cleanup. Jangan sertakan secret.