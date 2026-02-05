# Rebuild Responsif Mobile (320–480px, Portrait)

## Ringkasan
- Optimalisasi ulang tampilan untuk viewport 320–480px (portrait) dengan pendekatan mobile-first.
- Perbaikan nav header/bottom, sidebar, kartu, tabel, dan tipografi agar proporsional, tidak overlap, dan nyaman disentuh.
- Rebuild dilakukan dan diverifikasi via lint, typecheck, build, serta preview lokal.

## Perubahan Utama
- Global: mencegah scroll horizontal dan menambah padding bawah aman untuk bottom nav.
  - [index.css](file:///c:/Users/Fahri/Documents/trae_projects/FinBro/apps/frontend/src/index.css#L5-L14)
- Dashboard: skala tipografi saldo di mobile, list view transaksi di mobile, padding aman untuk bottom nav.
  - [Dashboard.tsx](file:///c:/Users/Fahri/Documents/trae_projects/FinBro/apps/frontend/src/pages/Dashboard.tsx#L226-L234)
  - [Dashboard.tsx:Mobile List](file:///c:/Users/Fahri/Documents/trae_projects/FinBro/apps/frontend/src/pages/Dashboard.tsx#L810-L841)
- Transactions: tombol dan filter touch-friendly, tabel desktop dan list mobile, label konfirmasi hapus yang aman tipe.
  - [Transactions.tsx](file:///c:/Users/Fahri/Documents/trae_projects/FinBro/apps/frontend/src/pages/Transactions.tsx#L168-L184)
  - [Transactions.tsx:Konfirmasi Hapus](file:///c:/Users/Fahri/Documents/trae_projects/FinBro/apps/frontend/src/pages/Transactions.tsx#L315-L323)
- Budget: padding aman untuk bottom nav dan kontrol bulan yang nyaman disentuh.
  - [Budget.tsx](file:///c:/Users/Fahri/Documents/trae_projects/FinBro/apps/frontend/src/pages/Budget.tsx#L146-L154)
- Settings: mengurangi padding kartu di mobile, tombol bahasa/currency touch-friendly.
  - [Settings.tsx](file:///c:/Users/Fahri/Documents/trae_projects/FinBro/apps/frontend/src/pages/Settings.tsx#L100-L116)
- Layout: header mobile fixed, bottom nav fixed, konten diberi ruang via `pt-20` dan `pb-24`.
  - [Layout.tsx](file:///c:/Users/Fahri/Documents/trae_projects/FinBro/apps/frontend/src/components/Layout.tsx#L214-L233)
  - [Layout.tsx:Bottom Nav](file:///c:/Users/Fahri/Documents/trae_projects/FinBro/apps/frontend/src/components/Layout.tsx#L254-L276)

## Media Queries & Breakpoints
- Mobile-first: style dasar ditujukan untuk layar kecil, dengan override menggunakan `md:`/`lg:` untuk desktop.
- Penyesuaian tambahan untuk viewport 320–480px dilakukan melalui:
  - Pengurangan padding komponen berat: `p-6 md:p-8` pada kartu Settings, Budget, dsb.
  - Tipografi besar disesuaikan: `text-3xl md:text-5xl` pada saldo utama di Dashboard.
  - Pengaturan konten agar tidak tertutup nav: `pb-24 md:pb-10` pada halaman.

## Layout Flex/Grid
- Sidebar disembunyikan di mobile (`md:hidden`) dan digantikan header + bottom nav.
- Grid kartu di Dashboard di-mobile-kan menjadi satu kolom; tabel transaksi dikonversi ke list.
- `overflow-x-hidden` ditetapkan global untuk menghindari konten melebar horizontal.

## Komponen Bermasalah di Portrait
- Navbar/Header: sekarang fixed dan transparan, konten diberi `pt-20`.
- Bottom Nav: tetap di bawah, konten diberi `pb-24` dan utilitas `pb-safe` untuk area aman.
- Cards: padding di-mobile-kan, radius tetap, bayangan ringan.
- Typography: heading besar disesuaikan agar tidak terpotong di 320px.

## Testing
- Lintas browser: Chrome, Edge, Firefox menggunakan Device Emulation.
- Viewport: 320, 360, 375, 390, 414, 480.
- Gestur: tap, scroll vertikal, tidak ada scroll horizontal; hover disubstitusi dengan active/pressed di mobile.
- Proses:
  1. Jalankan lint dan build.
  2. Preview lokal di `http://localhost:4173/`.
  3. Uji setiap halaman: Dashboard, Transactions, Budget, Settings.

## Before vs After (Deskripsi)
- Sebelum:
  - Konten bawah tertutup bottom nav; beberapa kartu terlalu besar di 320px.
  - Tabel transaksi menyempit dan meluber horizontal; tipografi saldo terpotong.
  - Tombol kecil dan kurang nyaman disentuh.
- Sesudah:
  - Konten memiliki ruang aman di atas/bawah; tidak ada overlap dengan nav.
  - Transaksi tampil list di mobile; tabel hanya di desktop.
  - Tipografi saldo pas di layar kecil; semua tombol/input touch-friendly.

## Cara Reproduksi
- Buka preview lokal di `http://localhost:4173/`.
- Aktifkan Device Emulation dan pilih 320×640, 360×640, 375×667, 414×736, 480×800.
- Navigasi setiap halaman dan cek scroll vertikal, keterbacaan font, serta interaksi.
