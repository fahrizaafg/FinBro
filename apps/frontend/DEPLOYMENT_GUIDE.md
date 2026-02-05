# Panduan Deployment FinBro ke Vercel

Dokumen ini berisi langkah-langkah lengkap untuk men-deploy aplikasi FinBro (React/Vite) ke Vercel, platform hosting yang optimal untuk frontend modern.

## Prasyarat
1.  Akun **GitHub** (atau GitLab/Bitbucket).
2.  Akun **Vercel** (bisa login menggunakan GitHub).
3.  Kode sumber FinBro sudah di-push ke repository GitHub.

---

## Langkah 1: Persiapan Repository (GitHub)

Jika kode Anda masih di lokal, upload ke GitHub terlebih dahulu:

1.  Buka terminal di VS Code.
2.  Inisialisasi git (jika belum):
    ```bash
    git init
    git add .
    git commit -m "Siap deploy ke Vercel"
    ```
3.  Buat repository baru di [GitHub](https://github.com/new).
4.  Hubungkan dan push:
    ```bash
    git remote add origin https://github.com/USERNAME/FinBro.git
    git branch -M main
    git push -u origin main
    ```

---

## Langkah 2: Deployment di Vercel

1.  **Login ke Dashboard Vercel**
    *   Buka [vercel.com](https://vercel.com) dan login.

2.  **Import Project**
    *   Klik tombol **"Add New..."** > **"Project"**.
    *   Di bagian "Import Git Repository", cari repository `FinBro` Anda.
    *   Klik tombol **Import**.

3.  **Konfigurasi Project**
    Vercel akan otomatis mendeteksi bahwa ini adalah project **Vite**. Pastikan setting berikut benar:

    *   **Framework Preset**: `Vite` (Otomatis terdeteksi).
    *   **Root Directory**:
        *   Karena struktur project Anda adalah monorepo (`apps/frontend`), Anda perlu mengubah ini.
        *   Klik **Edit** pada Root Directory.
        *   Pilih folder `apps/frontend`.
    *   **Build & Output Settings**:
        *   Biarkan default (Build Command: `npm run build` atau `vite build`, Output Directory: `dist`).
    *   **Environment Variables**:
        *   Jika aplikasi menggunakan variabel lingkungan (seperti API key), tambahkan di sini. (Saat ini FinBro bersifat lokal/offline-first, jadi mungkin tidak perlu).

4.  **Deploy**
    *   Klik tombol **Deploy**.
    *   Tunggu proses build selesai (biasanya < 1 menit).

5.  **Selesai!**
    *   Setelah sukses, Anda akan melihat tampilan kembang api.
    *   Klik screenshot aplikasi untuk membuka URL deployment (contoh: `https://finbro.vercel.app`).

---

## Langkah 3: Verifikasi PWA & Mobile

Setelah aplikasi live, lakukan pengecekan berikut di HP Anda:

1.  **Akses URL**: Buka link Vercel di Chrome (Android) atau Safari (iOS).
2.  **Install App**:
    *   **Android**: Muncul prompt "Add FinBro to Home Screen" atau klik menu titik tiga > "Install app".
    *   **iOS**: Klik tombol Share (kotak dengan panah ke atas) > "Add to Home Screen".
3.  **Cek Ikon**: Pastikan ikon logo "F" FinBro muncul di layar utama (bukan screenshot halaman).
4.  **Offline Mode**: Matikan data/WiFi, lalu buka aplikasi dari Home Screen. Aplikasi harus tetap bisa dibuka dan berfungsi.

---

## Troubleshooting Umum

*   **Error 404 saat refresh halaman**:
    *   Pastikan file `vercel.json` sudah ada di root folder `apps/frontend` dengan konfigurasi rewrite ke `/index.html`. (Sudah kami buatkan sebelumnya).

*   **Ikon tidak muncul**:
    *   Saat ini kami menggunakan format SVG untuk ikon (`pwa-icon.svg`) agar kompatibel secara universal tanpa perlu generate banyak file PNG. Jika di perangkat tertentu ikon tidak muncul, Anda mungkin perlu mengonversi `public/pwa-icon.svg` menjadi `pwa-192x192.png` dan `pwa-512x512.png` menggunakan tool online (seperti [svgtopng.com](https://svgtopng.com)) lalu update `vite.config.ts` kembali.
