# BuluSpace

Premium waxing studio — booking & admin system. 3 aplikasi:

| Folder | Isi | Stack |
|---|---|---|
| `backend/` | REST API | Laravel 13 (PHP 8.3+) |
| `admin/` | Panel admin staf | React 19 + Vite + Tailwind |
| `website/` | Situs publik customer | React 19 + Vite + Tailwind |
| `jadwal/` | Halaman jadwal terapis (public, tanpa login) | React 19 + Vite + Tailwind |

## Struktur singkat

- **`backend/routes/api.php`** — semua endpoint `/api/*`
- **`backend/app/Http/Controllers`** — `Api/` (publik) & `Admin/` (token admin per cabang)
- **`admin/src/pages`** — Dashboard, Bookings, Jadwal, Therapists, Services, Promos, Reviews
- **`website/src`** — situs customer (booking, promo, lacak booking)
- **`jadwal/src/App.tsx`** — board jadwal terapis (warna: Barat=biru, Selatan=pink)

## Menjalankan lokal

1. **Backend** (terminal 1):
   ```sh
   cd backend
   cp .env.example .env   # isi DB MySQL `bulu_space`
   composer install
   php artisan key:generate
   php artisan migrate --seed
   php -S 127.0.0.1:8000 -t public
   ```
2. **Situs customer** (terminal 2): `cd website && npm install && npm run dev` (port 3000)
3. **Admin** (terminal 3): `cd admin && npm install && npm run dev` (port 5173)
4. **Jadwal terapis** (terminal 4): `cd jadwal && npm install && npm run dev`
   - Atur `VITE_API_URL`, opsional `VITE_GOOGLE_CALENDAR_SRC` di `.env`

Login admin demo: `admin@buluspace.com` / `admin123` (Jakarta Barat), `citraut@gmail.com` / `citra221` (Jakarta Selatan).

## Deploy Hostinger (shared hosting)

### Asumsi
- Domain mis. `buluspace.com` → static (website) via `public_html`
- Subdomain `api.buluspace.com` → Laravel API
- Subdomain `admin.buluspace.com` → build admin
- Subdomain `jadwal.buluspace.com` → build jadwal
- (Atau semua di satu domain dengan folder `/customer`, `/admin`, `/jadwal`.)

### Backend (api subdomain)
1. Pilih **PHP 8.3** di panel Hostinger.
2. Upload isi `backend/` ke folder subdomain (mis. `api.buluspace.com/`), **kecuali** `vendor/`.
3. Set folder web root ke `.../backend/public` (atau taruh `public` sebagai `document root`).
4. SSH / File Manager, lalu:
   ```sh
   composer install --no-dev --optimize-autoloader
   cp .env.example .env        # isi sesuai akun, lihat di bawah
   php artisan key:generate
   php artisan migrate --force
   php artisan storage:link
   php artisan config:cache
   ```
5. **`.env` produksi**:
   ```
   APP_ENV=production
   APP_URL=https://api.buluspace.com
   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_DATABASE=<nama db hostinger>
   DB_USERNAME=<user db>
   DB_PASSWORD=<pass db>
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.hostinger.com
   MAIL_PORT=465
   MAIL_USERNAME=no-reply@buluspace.com
   MAIL_PASSWORD=<pass email>
   MAIL_ENCRYPTION=ssl
   MAIL_FROM_ADDRESS=no-reply@buluspace.com
   MAIL_FROM_NAME="BuluSpace"
   ```

### Frontend (website / admin / jadwal)
Build dengan `VITE_API_URL` menunjuk API produksi:
```sh
cd website && npm install && VITE_API_URL=https://api.buluspace.com/api npm run build
cd admin && npm install && VITE_API_URL=https://api.buluspace.com/api npm run build
cd jadwal && npm install && VITE_API_URL=https://api.buluspace.com/api npm run build
```
Upload isi folder `dist/` masing-masing ke folder/ subdomain tujuan.

### Perawatan
- **Promo image upload** tersimpan di `storage/app/public/promos` (pasti `storage:link` aktif).
- **Email** dikirim sinkron saat event (booking baru→admin, konfirmasi→customer, completed→terima kasih). Format tanggal jatuh tempo pembayaran H-1.
- Backups & SSL: gunakan panel Hostinger (auto SSL di subdomain).

## Tips CLI akses (dev)
- Akses admin: `admin/src/pages/Dashboard.tsx`, `Bookings.tsx`.
- Public endpoint jadwal: `GET /api/schedule-board?date=YYYY-MM-DD`.