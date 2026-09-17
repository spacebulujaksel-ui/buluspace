# Bulu Space Admin — Frontend

Admin panel Bulu Space (React + Vite + Tailwind CSS v4). Frontend-only dengan mock data. Backend (Laravel) diintegrasikan nanti.

## Run Locally

1. `npm install`
2. `npm run dev` → http://localhost:5173

## Login Demo

- Email: `admin@buluspace.com`
- Password: `admin123`

## Build

`npm run build` → output di `dist/`

## Struktur

```
src/
├── pages/        # Login, Dashboard, Bookings, Therapists, Services, Reviews
├── components/   # Sidebar, Header, DataTable, Modal, Badge, Button, StatCard
├── layouts/      # AdminLayout (sidebar + header wrapper)
├── lib/api.ts    # API client stub — connect ke Laravel nanti
├── hooks/        # useAuth (mock auth dengan localStorage)
└── data/         # Mock data (dari bulu_space.sql)
```

## Note

`lib/api.ts` dan `hooks/useAuth.ts` adalah stub yang akan disambungkan ke Laravel backend saat sudah ready.