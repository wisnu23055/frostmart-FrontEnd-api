// =====================================================================
// SUMBER KEBENARAN TUNGGAL untuk daftar kategori produk FrostMart
// Ubah di sini, berlaku di semua halaman (admin & user)
// =====================================================================

export const PRODUCT_CATEGORIES = [
  "Nugget",
  "Sosis",
  "Olahan Ayam",
  "Olahan Seafood",
  "Dimsum",
  "Kentang",
  "Bakso",
  "Jajanan",
];

// Untuk halaman user (Menu/Search), ditambahkan "Semua Produk" di depan
export const USER_CATEGORIES = ["Semua Produk", ...PRODUCT_CATEGORIES];
