# FinBro - Financial Brother

FinBro adalah aplikasi manajemen keuangan pribadi yang modern, aman, dan mudah digunakan. Dibangun dengan teknologi web terkini (React + Vite) dan dikemas sebagai aplikasi desktop menggunakan Electron.

## Fitur Utama

- **Dashboard Interaktif**: Ringkasan visual pengeluaran dan pemasukan Anda.
- **Pencatatan Transaksi**: Catat setiap pengeluaran dan pemasukan dengan mudah.
- **Manajemen Hutang**: Pantau hutang piutang agar tidak lupa.
- **Anggaran (Budgeting)**: Tetapkan batas pengeluaran bulanan per kategori.
- **Multi-Bahasa & Mata Uang**: Dukungan Bahasa Indonesia/Inggris dan berbagai mata uang.
- **Mode Gelap/Terang**: Tampilan yang nyaman di mata.
- **Privasi Terjamin**: Semua data tersimpan secara lokal di perangkat Anda (Offline First).

## Teknologi

- **Frontend**: React, TypeScript, Tailwind CSS
- **Desktop**: Electron
- **Build Tool**: Vite
- **Charts**: Recharts
- **Icons**: Lucide React

## Cara Menjalankan (Development)

1.  Clone repositori ini.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Jalankan mode development:
    ```bash
    npm run dev
    ```

## Cara Build (Desktop App)

Untuk membuat file executable (`.exe`):

```bash
npm run electron:build
```

Hasil build akan tersedia di folder `release_success/win-unpacked`.

## Struktur Proyek

- `src/`: Kode sumber React (UI/UX).
- `electron/`: Kode utama Electron (Main & Preload process).
- `dist/`: Hasil build web assets.
- `release_success/`: Hasil build aplikasi desktop.

## Lisensi

Private / Proprietary.
