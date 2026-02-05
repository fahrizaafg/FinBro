# Panduan Konversi FinBro ke Desktop App (.exe)

Panduan ini menjelaskan langkah-langkah yang telah dilakukan untuk mengubah aplikasi FinBro menjadi aplikasi desktop offline menggunakan Electron, serta cara menjalankannya.

## 1. Analisis & Persiapan
- **Jenis Aplikasi**: Single Page Application (SPA) berbasis React + Vite.
- **Framework Terpilih**: **Electron** (100% Gratis, Open Source).
  - *Alasan*: Komunitas besar, fitur lengkap (auto-update, native API), mudah diintegrasikan dengan web app yang sudah ada.
  - *Alternatif*: Tauri (lebih ringan tapi butuh Rust), NW.js (kurang populer).

## 2. Struktur Proyek
File-file berikut telah ditambahkan/dimodifikasi untuk mendukung Electron:

1.  `electron/main.cjs`: **Main Process** yang mengatur jendela aplikasi dan siklus hidup.
2.  `electron/preload.cjs`: **Preload Script** untuk keamanan dan komunikasi antar proses.
3.  `package.json`: Konfigurasi build, dependencies, dan script `electron:build`.
4.  `vite.config.ts`: Ditambahkan `base: './'` agar aset dapat dimuat secara offline (path relatif).

## 3. Instalasi & Build (Sudah Dilakukan)
Semua dependensi telah diinstal dan konfigurasi telah diterapkan.

### Dependensi Utama (Wajib ada di `dependencies` package.json):
- `electron-is-dev`: Deteksi mode development.
- `electron-updater`: Fitur auto-update gratis.
- *Catatan*: Pastikan kedua library ini ada di `dependencies`, bukan `devDependencies`.

### Dependensi Dev (di `devDependencies`):
- `electron`: Framework utama.
- `electron-builder`: Tools untuk memaketkan aplikasi menjadi .exe.

### Hasil Build:
Aplikasi telah berhasil dibuild dan paket executable tersedia di:
`apps/frontend/release_success/win-unpacked/FinBro Desktop.exe`

Folder ini berisi aplikasi portable yang dapat langsung dijalankan tanpa instalasi (unpacked).

## 4. Cara Menjalankan Aplikasi
1.  Buka File Explorer.
2.  Navigasi ke folder: `C:\Users\Fahri\Documents\trae_projects\FinBro\apps\frontend\release_success\win-unpacked`
3.  Klik ganda pada file **`FinBro Desktop.exe`**.
4.  Aplikasi akan terbuka dalam jendela desktop sendiri.

## 5. Distribusi ke Komputer Lain
Untuk memindahkan aplikasi ke komputer lain:
1.  Copy satu folder **`win-unpacked`** tersebut ke flashdisk atau cloud.
2.  Paste di komputer tujuan.
3.  Jalankan `FinBro Desktop.exe`.
4.  *Catatan*: Pastikan komputer tujuan menggunakan Windows (64-bit).

## 6. Auto-Update (Konfigurasi Lanjutan)
Fitur auto-update telah disiapkan menggunakan `electron-updater`. Untuk mengaktifkannya sepenuhnya, Anda perlu:
1.  Buat repositori **GitHub Public** baru.
2.  Push kode sumber ke repositori tersebut.
3.  Update `package.json` bagian `publish`:
    ```json
    "publish": {
      "provider": "github",
      "owner": "USERNAME_GITHUB_ANDA",
      "repo": "NAMA_REPO_ANDA"
    }
    ```
4.  Generate `GH_TOKEN` (Personal Access Token) di GitHub Settings.
5.  Set environment variable `GH_TOKEN` saat melakukan build untuk rilis publik.

## 7. Troubleshooting Offline
- **Blank Screen**: Biasanya karena path aset salah. Pastikan `base: './'` ada di `vite.config.ts` (Sudah diperbaiki).
- **Data Hilang**: Aplikasi desktop menggunakan penyimpanan lokal (LocalStorage/IndexedDB) yang terpisah dari browser. Data di browser tidak otomatis pindah ke desktop app, kecuali Anda menerapkan fitur ekspor/impor data.
- **Error Build**: Jika gagal build ulang, hapus folder `release_success` dan `dist` terlebih dahulu.

---
**Status Akhir**: Aplikasi Desktop (`.exe`) Siap Digunakan!
