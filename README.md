# ❄️ FrostMart — Frontend Web Application (ReactJS)

FrostMart adalah platform e-commerce frozen food premium yang modern, cepat, dan sepenuhnya responsif. Aplikasi ini dirancang menggunakan React, Vite, dan Tailwind CSS dengan cold-chain logistics flow terintegrasi.

---

## 🌟 Fitur Utama

- **📱 Desain Modern & Responsif**: Tampilan antarmuka premium yang dioptimalkan secara dinamis untuk perangkat mobile, tablet, dan desktop.
- **🛒 Manajemen Keranjang & Alamat**: Fitur checkout multi-alamat terpadu dengan pemrosesan produk terpilih.
- **💳 Integrasi QRIS Pembayaran**: Alur pembayaran dinamis untuk Transfer Bank dan E-Wallet menggunakan Scan QRIS gerai aktif.
- **⏱️ Hitung Mundur Pembatalan**: Sistem hitung mundur pembayaran 10 menit real-time untuk menjamin ketersediaan stok produk.
- **📦 Dasbor Admin Komprehensif**:
  - Manajemen pesanan dengan status transisi dinamis (Menunggu, Proses, Selesai, Dibatalkan).
  - Manajemen stok dan CRUD pendaftaran toko.
  - Halaman Analitis interaktif dengan grafik (Bar & Line chart) yang responsif.
  - Ekspor data lengkap ke format **PDF, CSV, dan Excel (XML)** pada menu Orders, Products, Customers, dan Invoices.
  - Cetak Faktur (Invoice) langsung dari dashboard dengan template siap print.

---

## 🛠️ Tech Stack

- **Core**: [React JS](https://react.dev/) (v18+) & [Vite](https://vitejs.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Routing**: [React Router DOM](https://reactrouter.com/) (v6+)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- **API Client**: [Axios](https://axios-http.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (Feather, FontAwesome, dll.)

---

## 🚀 Cara Menjalankan Project

### 1. Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) (versi 16 atau lebih baru) dan npm.

### 2. Instalasi Dependensi
Jalankan perintah berikut di direktori root frontend:
```bash
npm install
```

### 3. Konfigurasi Lingkungan (Env)
Pastikan berkas API Endpoint dikonfigurasi pada Axios instance (`src/api/axiosInstance.js`) mengarah ke URL server backend Anda (default: `http://localhost:5000/api`).

### 4. Jalankan Development Server
Mulai server lokal pengembangan dengan perintah:
```bash
npm run dev
```
Buka tautan yang muncul di terminal (biasanya [http://localhost:5173](http://localhost:5173)) pada browser Anda.

---

## 📁 Struktur Folder Utama

```
src/
├── api/             # Konfigurasi instance Axios
├── assets/          # Logo, gambar produk, dan stylesheet
├── components/      # Komponen UI global (Navbar, Sidebar, dll.)
├── layouts/         # Layout halaman utama & profil
├── pages/
│   ├── admin/       # Dashboard, Orders, Products, Customers, Invoices
│   └── user/        # Home, Menu, Cart, Checkout, OrderDetail, RegisterStore
├── router/          # Konfigurasi navigasi rute aplikasi
└── store/           # Redux slices untuk Auth & Cart
```

---

*© 2026 FrostMart Team. Hak Cipta Dilindungi.*