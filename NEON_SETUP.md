# Panduan Migrasi ke Neon DB

## Langkah 1: Buat Database di Neon
1. Kunjungi https://console.neon.tech/
2. Sign up atau login ke akun Neon Anda
3. Klik "Create Project"
4. Pilih region yang terdekat dengan lokasi Anda
5. Beri nama project (misalnya: "DentalPro")
6. Copy connection string yang diberikan

## Langkah 2: Update Environment Variables
1. Buka file `.env` di root project
2. Ganti nilai `DATABASE_URL` dengan connection string dari Neon:
   ```
   DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
   ```

## Langkah 3: Generate Database Schema
Jalankan command berikut untuk membuat schema di Neon DB:
```bash
npx prisma db push
```

## Langkah 4: (Optional) Migrasi Data dari SQLite
Jika Anda ingin memindahkan data yang sudah ada dari SQLite ke Neon:

1. Export data dari SQLite:
```bash
npx prisma db seed
```

2. Atau manual export/import data menggunakan Prisma Studio:
```bash
npx prisma studio
```

## Langkah 5: Test Koneksi
Jalankan aplikasi untuk memastikan koneksi berhasil:
```bash
npm run dev
```

## Troubleshooting
- Pastikan connection string sudah benar
- Pastika SSL mode diaktifkan (sslmode=require)
- Cek firewall tidak memblokir koneksi ke Neon

## Connection String Format
```
postgresql://[username]:[password]@[hostname]/[database]?sslmode=require
```

Contoh:
```
postgresql://johndoe:randompassword@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```
