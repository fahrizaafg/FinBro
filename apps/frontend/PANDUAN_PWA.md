# Panduan Lengkap Implementasi Progressive Web App (PWA) FinBro

Dokumen ini berisi panduan komprehensif untuk mengubah aplikasi FinBro menjadi **Progressive Web App (PWA)** yang canggih. PWA memungkinkan aplikasi web Anda berjalan seperti aplikasi native: dapat diinstal di home screen, berjalan offline, dan memiliki performa tinggi.

---

## Daftar Isi
1. [Pendahuluan & Persyaratan](#1-pendahuluan--persyaratan)
2. [Instalasi & Konfigurasi Dasar](#2-instalasi--konfigurasi-dasar)
3. [Konfigurasi Manifest Lengkap](#3-konfigurasi-manifest-lengkap)
4. [Strategi Caching & Service Worker](#4-strategi-caching--service-worker)
5. [Optimasi Tampilan Mobile & iOS](#5-optimasi-tampilan-mobile--ios)
6. [Best Practices Performa](#6-best-practices-performa)
7. [Checklist Verifikasi PWA](#7-checklist-verifikasi-pwa)
8. [Panduan Troubleshooting](#8-panduan-troubleshooting)

---

## 1. Pendahuluan & Persyaratan

### Mengapa PWA untuk FinBro?
*   **Installable**: User dapat menambahkan FinBro ke layar utama HP tanpa melalui App Store/Play Store.
*   **Offline Ready**: Aplikasi tetap bisa dibuka dan menampilkan data terakhir (transaksi/budget) meski tanpa internet.
*   **Native Feel**: Tampilan full-screen tanpa address bar browser.
*   **Performa**: Loading instan berkat caching aset statis.

### Persyaratan Sistem
*   **Node.js**: v18 atau lebih baru.
*   **Vite Project**: FinBro sudah menggunakan Vite, yang sangat mendukung PWA.
*   **Aset Grafis**:
    *   Icon aplikasi (PNG) ukuran: `192x192` dan `512x512`.
    *   Maskable icon (opsional tapi disarankan untuk Android modern).
    *   Favicon (`.ico` atau `.svg`).

---

## 2. Instalasi & Konfigurasi Dasar

Kita akan menggunakan plugin resmi `vite-plugin-pwa` yang mengotomatisasi pembuatan Service Worker dan Web App Manifest.

### Langkah 1: Instalasi Plugin
Jalankan perintah berikut di terminal proyek (`apps/frontend`):

```bash
npm install vite-plugin-pwa --save-dev
```

### Langkah 2: Update `vite.config.ts`
Tambahkan plugin ke konfigurasi Vite Anda.

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Update otomatis saat ada versi baru
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      devOptions: {
        enabled: true // Aktifkan PWA di mode development untuk testing
      },
      // Konfigurasi Manifest (lihat Bagian 3)
      manifest: { /* ... */ },
      // Konfigurasi Workbox/Caching (lihat Bagian 4)
      workbox: { /* ... */ }
    })
  ],
})
```

---

## 3. Konfigurasi Manifest Lengkap

Web App Manifest adalah file JSON yang memberi tahu browser bagaimana aplikasi Anda harus ditampilkan saat diinstal.

Tambahkan konfigurasi ini ke dalam properti `manifest` di `vite.config.ts`:

```typescript
manifest: {
  name: 'FinBro - Manajer Keuangan',
  short_name: 'FinBro',
  description: 'Kelola keuangan harian Anda dengan mudah, aman, dan tanpa internet.',
  theme_color: '#ffffff', // Sesuaikan dengan warna tema aplikasi
  background_color: '#1a1625', // Warna background saat splash screen
  display: 'standalone', // Mode full screen seperti native app
  orientation: 'portrait', // Kunci orientasi (opsional)
  scope: '/',
  start_url: '/',
  icons: [
    {
      src: 'pwa-192x192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: 'pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png'
    },
    {
      src: 'pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable' // Penting untuk icon adaptif di Android
    }
  ]
}
```

> **Tips:** Pastikan file gambar (`pwa-192x192.png`, dll) benar-benar ada di folder `public/`.

---

## 4. Strategi Caching & Service Worker

Agar aplikasi berjalan offline dan cepat, kita perlu mengonfigurasi **Workbox** (library caching Google). Tambahkan properti `workbox` di `VitePWA` config.

### Konfigurasi Runtime Caching
Strategi caching yang disarankan untuk aplikasi tipe dashboard seperti FinBro:

```typescript
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // Cache aset statis
  runtimeCaching: [
    {
      // Cache Google Fonts (jika pakai)
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 hari
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      // Cache Font Files
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'gstatic-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      // Cache Gambar Eksternal (jika ada)
      urlPattern: ({ request }) => request.destination === 'image',
      handler: 'StaleWhileRevalidate', // Tampilkan cache dulu, lalu update di background
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 hari
        },
      },
    }
  ]
}
```

---

## 5. Optimasi Tampilan Mobile & iOS

iOS (Safari) memerlukan perlakuan khusus agar PWA terlihat sempurna.

### Update `index.html`
Tambahkan meta tags berikut di dalam `<head>`:

```html
<!-- Mencegah zoom user yang tidak disengaja (Native feel) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

<!-- iOS PWA Support -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="FinBro" />

<!-- Warna Theme Browser -->
<meta name="theme-color" content="#1a1625" />

<!-- Icon iOS -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

### CSS Tweaks (`src/index.css`)
Tambahkan CSS ini untuk pengalaman scroll yang lebih baik di mobile:

```css
body {
  /* Mencegah efek bounce/karet gelang saat scroll mentok di iOS */
  overscroll-behavior-y: none;
  /* Mencegah select text yang tidak perlu */
  -webkit-user-select: none;
  user-select: none;
  /* Support safe area notch iPhone */
  padding-bottom: env(safe-area-inset-bottom);
}

/* Izinkan select text pada input form */
input, textarea {
  -webkit-user-select: text;
  user-select: text;
}
```

---

## 6. Best Practices Performa

PWA yang baik harus cepat. Berikut tips optimasinya:

1.  **Code Splitting (Lazy Loading)**:
    Pastikan rute halaman dimuat secara lazy agar bundle awal kecil.
    ```typescript
    // App.tsx
    const Dashboard = React.lazy(() => import('./pages/Dashboard'));
    const Transactions = React.lazy(() => import('./pages/Transactions'));
    // Gunakan <Suspense> untuk loading state
    ```

2.  **Preconnect External Origins**:
    Jika menggunakan font atau API eksternal, tambahkan preconnect di `index.html`.
    ```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    ```

3.  **Gunakan Format Gambar Modern**:
    Gunakan WebP atau SVG untuk icon dan ilustrasi daripada PNG/JPG besar.

4.  **Audit dengan Lighthouse**:
    Buka Chrome DevTools > Lighthouse > Centang "Progressive Web App" > Analyze. Targetkan skor 100%.

---

## 7. Checklist Verifikasi PWA

Gunakan daftar ini sebelum merilis aplikasi:

- [ ] **Manifest Valid**: Browser mendeteksi manifest.json tanpa error.
- [ ] **Service Worker Aktif**: Status "Activated" di tab Application > Service Workers.
- [ ] **HTTPS**: PWA **wajib** berjalan di HTTPS (kecuali localhost).
- [ ] **Installable**: Muncul prompt install di Chrome Android / Icon "+" di address bar Desktop.
- [ ] **Offline Mode**: Matikan internet (Offline mode di DevTools), refresh halaman. Aplikasi harus tetap terbuka (tidak ada dinosaurus Chrome).
- [ ] **Icons**: Icon muncul benar di Home Screen (Android & iOS) dan Splash Screen.
- [ ] **Responsif**: Layout tidak rusak di layar kecil (iPhone SE) maupun besar.
- [ ] **Viewport**: Tidak bisa di-zoom cubit (pinch-zoom) oleh user.
- [ ] **Navigation**: Tombol "Back" browser (jika ada) atau gesture back Android berfungsi normal.

---

## 8. Panduan Troubleshooting

### Masalah 1: "Install App" tidak muncul
*   **Penyebab**: Manifest tidak valid, tidak ada Service Worker, atau tidak HTTPS.
*   **Solusi**:
    1.  Cek tab **Application > Manifest** di DevTools untuk error merah.
    2.  Pastikan properti `icons` memiliki minimal ukuran 192x192 dan 512x512.
    3.  Pastikan `display` diset ke `standalone`.
    4.  Pastikan berinteraksi dengan halaman minimal 30 detik (browser heuristic).

### Masalah 2: Update konten baru tidak muncul
*   **Penyebab**: Service Worker melayani file lama dari cache ("Cache-first strategy").
*   **Solusi**:
    *   Secara default (`registerType: 'autoUpdate'`), plugin akan mencoba update.
    *   Tutup semua tab aplikasi dan buka kembali.
    *   Untuk UX lebih baik, buat komponen `ReloadPrompt` yang memberi notifikasi: *"Konten baru tersedia. Klik untuk refresh."*

### Masalah 3: Tampilan terpotong Notch di iPhone
*   **Solusi**: Tambahkan `viewport-fit=cover` di meta viewport:
    ```html
    <meta name="viewport" content="..., viewport-fit=cover" />
    ```
    Dan gunakan CSS env variables:
    ```css
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    ```

### Masalah 4: Aplikasi blank putih saat offline
*   **Penyebab**: File `index.html` atau JS utama tidak ter-cache.
*   **Solusi**: Pastikan `globPatterns` di config workbox mencakup `**/*.{js,css,html}`.

---
**Selamat!** Dengan mengikuti panduan ini, FinBro sekarang adalah aplikasi PWA modern yang siap bersaing dengan aplikasi native.
