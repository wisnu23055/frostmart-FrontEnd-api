import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import {
  FiStar, FiHeart, FiShoppingCart, FiChevronRight,
  FiCheckCircle, FiShield, FiTruck, FiBox, FiClock,
  FiMinus, FiPlus, FiUser, FiAlertCircle
} from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";

// =====================
// Helper: ambil URL gambar dari object atau string
// =====================
function getImageUrl(image) {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (typeof image === "object" && image.url) return image.url;
  return null;
}

// =====================
// Helper: format harga Rupiah
// =====================
function formatRp(num) {
  const n = typeof num === "string" ? parseFloat(num) : num;
  return isNaN(n) ? "0" : n.toLocaleString("id-ID");
}

// =====================
// Skeleton Loading
// =====================
function SkeletonLoader() {
  return (
    <div className="max-w-[1300px] mx-auto px-6 py-10 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl" />
        <div className="flex flex-col gap-4 pt-2">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded w-1/2" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

// =====================
// MAIN COMPONENT
// =====================
function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLogin = useSelector((state) => state.auth?.isLogin || false);

  // State data produk
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [mainImage, setMainImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("Deskripsi");

  // Fetch produk dari backend
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      setQty(1);
      window.scrollTo(0, 0);

      try {
        const response = await axiosInstance.get(`/products/${id}`);
        const data = response.data?.data || response.data;
        setProduct(data);
        
        const imgUrl = getImageUrl(data?.image);
        setMainImage(imgUrl || "https://placehold.co/600x450/e2e8f0/94a3b8?text=FrostMart");
        setActiveTab("Deskripsi");
      } catch (err) {
        console.error("Gagal fetch produk:", err);
        setError("Produk tidak ditemukan atau terjadi kesalahan server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch produk lain untuk "Mungkin Anda Suka"
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await axiosInstance.get("/products?limit=8");
        const data = response.data?.data || response.data?.products || response.data || [];
        const arr = Array.isArray(data) ? data : [];
        // Filter keluar produk yang sedang dibuka
        const others = arr.filter((p) => String(p.id) !== String(id)).slice(0, 4);
        setRelatedProducts(others);
      } catch {
        // silent fail
      }
    };
    if (id) fetchRelated();
  }, [id]);

  const handleAddToCart = () => {
    if (!isLogin) {
      alert("Kamu harus login dulu untuk menambahkan produk ke keranjang!");
      navigate("/login");
      return;
    }
    dispatch(
      addToCart({
        ...product,
        image: getImageUrl(product?.image),
        qty: qty,
      })
    );
    // Toast feedback
    const toast = document.createElement("div");
    toast.textContent = `✅ ${product.name} ditambahkan ke keranjang!`;
    toast.style.cssText = `
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
      background:#1c54ff; color:white; padding:12px 24px; border-radius:999px;
      font-size:14px; font-weight:600; z-index:9999;
      box-shadow:0 4px 20px rgba(28,84,255,0.35);
      animation: fadeInUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  const tabList = ["Deskripsi", "Panduan Masak", "Nutrisi"];

  // =====================
  // RENDER: Loading
  // =====================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-24 text-gray-800">
        <div className="max-w-[1300px] mx-auto px-6 py-6 border-b border-gray-100 text-sm text-gray-500">
          <span>Memuat produk...</span>
        </div>
        <SkeletonLoader />
      </div>
    );
  }

  // =====================
  // RENDER: Error
  // =====================
  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-6">
          <FiAlertCircle size={36} />
        </div>
        <h2 className="text-2xl font-bold text-[#11327c] mb-3">
          Produk Tidak Ditemukan
        </h2>
        <p className="text-gray-500 text-sm max-w-sm mb-8">
          {error || "Maaf, produk yang Anda cari tidak tersedia."}
        </p>
        <Link
          to="/menu"
          className="bg-[#1c54ff] text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-800 transition"
        >
          Kembali ke Menu
        </Link>
      </div>
    );
  }

  const productPrice = typeof product.price === "string"
    ? parseFloat(product.price)
    : product.price || 0;

  const productImage = getImageUrl(product.image);
  const productImage2 = getImageUrl(product.image2);
  const productImage3 = getImageUrl(product.image3);
  const productImage4 = getImageUrl(product.image4);
  const displayImage = mainImage || productImage || "https://placehold.co/600x450/e2e8f0/94a3b8?text=FrostMart";

  // Features sesuai data produk
  const features = [
    { icon: <FiBox />, text: "Frozen / Beku" },
    { icon: <FiCheckCircle />, text: product.stock ? `Stok: ${product.stock}` : "Tersedia" },
    { icon: <FiClock />, text: "12 Bulan Simpan" },
    { icon: <FiShield />, text: "Kualitas Terjamin" },
  ];

  return (
    <div className="min-h-screen bg-white pb-24 text-gray-800">

      {/* BREADCRUMB */}
      <div className="max-w-[1300px] mx-auto px-6 py-6 border-b border-gray-100 text-sm text-gray-500 flex items-center gap-2">
        <Link to="/" className="hover:text-[#1c54ff] transition-colors">Home</Link>
        <FiChevronRight size={14} />
        <Link to="/menu" className="hover:text-[#1c54ff] transition-colors">Menu</Link>
        <FiChevronRight size={14} />
        <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
      </div>

      <div className="max-w-[1300px] mx-auto px-6 py-10">

        {/* ===== TOP SECTION ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* IMAGE GALLERY */}
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-100 shadow-sm">
              {product.visibility_status === "promo" && (
                <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow z-10">
                  PROMO
                </span>
              )}
              <img
                src={displayImage}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://placehold.co/600x450/e2e8f0/94a3b8?text=FrostMart";
                }}
              />
            </div>

            {/* Thumbnail — tampilkan gambar utama + placeholder jika hanya 1 */}
            <div className="grid grid-cols-4 gap-3">
              {[productImage, productImage2, productImage3, productImage4].map((img, idx) => {
                const src = img || `https://placehold.co/150x150/e2e8f0/94a3b8?text=Foto+${idx + 1}`;
                return (
                  <button
                    key={idx}
                    onClick={() => img && setMainImage(img)}
                    className={`aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                      (displayImage === img && img) ? "border-[#1c54ff] opacity-100" : "border-gray-100 opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={src}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/150x150/e2e8f0/94a3b8?text=Img";
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* PRODUCT DETAILS */}
          <div className="flex flex-col pt-2">
            {/* Nama & Brand */}
            <h1 className="text-3xl lg:text-4xl font-bold text-[#11327c] mb-1 leading-tight">
              {product.name}
            </h1>
            <p className="text-sm text-gray-500 mb-1 font-medium">
              By {product.brand || "FrostMart"}
            </p>
            {product.sku_code && (
              <p className="text-xs text-gray-400 mb-4">SKU: {product.sku_code}</p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex text-[#1c54ff]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar key={s} className="fill-current" size={16} />
                ))}
              </div>
            </div>

            {/* Harga */}
            <div className="flex items-end gap-4 mb-6">
              <span className="text-3xl font-extrabold text-[#1c54ff]">
                Rp {formatRp(productPrice)}
              </span>
              {productPrice > 0 && (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded mb-2">
                  TERSEDIA
                </span>
              )}
            </div>

            {/* Deskripsi */}
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              {product.description || "Produk frozen food berkualitas tinggi dari FrostMart. Dibekukan pada titik kesegaran terbaik untuk menjaga rasa dan nutrisi."}
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-8 text-sm font-medium text-gray-700 bg-gray-50 p-5 rounded-xl border border-gray-100">
              {features.map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[#1c54ff]">{feat.icon}</span>
                  {feat.text}
                </div>
              ))}
            </div>

            {/* Qty + Add to Cart */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center border-2 border-gray-200 rounded-xl h-12 w-32 flex-shrink-0 overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-[#1c54ff] hover:bg-gray-50 transition"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="flex-1 text-center font-bold text-gray-800 select-none">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-[#1c54ff] hover:bg-gray-50 transition"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
                
                <button className="h-12 w-12 border-2 border-gray-200 rounded-xl flex flex-shrink-0 items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors sm:hidden">
                  <FiHeart size={20} />
                </button>
              </div>

              <div className="flex items-center gap-4 w-full">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-[#1c54ff] hover:bg-blue-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-sm hover:scale-[1.01] active:scale-95"
                >
                  <FiShoppingCart size={18} />
                  Tambah ke Keranjang — Rp {formatRp(productPrice * qty)}
                </button>

                <button className="h-12 w-12 border-2 border-gray-200 rounded-xl flex flex-shrink-0 items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors hidden sm:flex">
                  <FiHeart size={20} />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="flex flex-col items-center gap-2">
                <FiShield size={20} className="text-[#1c54ff]" />
                Aman & Higienis
              </div>
              <div className="flex flex-col items-center gap-2">
                <FiTruck size={20} className="text-[#1c54ff]" />
                Pengiriman Cepat
              </div>
              <div className="flex flex-col items-center gap-2">
                <FiCheckCircle size={20} className="text-[#1c54ff]" />
                Kualitas 100%
              </div>
            </div>
          </div>
        </div>

        {/* ===== TABS SECTION ===== */}
        <div className="mt-24 border-t border-gray-200">
          <div className="flex flex-wrap gap-8 py-4 border-b border-gray-200">
            {tabList.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold uppercase tracking-wider pb-4 -mb-[17px] transition-colors border-b-2 ${
                  activeTab === tab
                    ? "text-[#11327c] border-[#1c54ff]"
                    : "text-gray-400 border-transparent hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="py-10">
            {/* Tab: Deskripsi */}
            {activeTab === "Deskripsi" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-bold text-[#11327c] mb-4">
                    Seni Menikmati Frozen Food Premium
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {product.description || "FrostMart menggunakan teknologi pembekuan cepat (flash-frozen) pada titik kesegaran tertinggi untuk mengunci rasa dan nutrisi."}
                  </p>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                    Komposisi Utama
                  </h4>
                  <ul className="grid grid-cols-2 gap-y-3 text-sm text-gray-600 list-disc pl-5">
                    <li>Bahan Berkualitas Premium</li>
                    <li>Bumbu Rempah Alami</li>
                    <li>Tanpa MSG Berlebih</li>
                    <li>Tanpa Pengawet Buatan</li>
                    <li>Proses Higienis & Tersertifikasi</li>
                    <li>Ramah untuk Keluarga</li>
                  </ul>
                </div>
                <div className="border-[3px] border-black p-4 bg-white shadow-sm h-fit">
                  <h3 className="text-xl font-black text-black border-b-[6px] border-black pb-1 mb-2">
                    Informasi Nilai Gizi
                  </h3>
                  <div className="flex justify-between items-end border-b-[4px] border-black pb-1 mb-2">
                    <span className="text-sm font-bold">
                      Jumlah per sajian
                      <br />
                      <span className="text-2xl font-black">Kalori</span>
                    </span>
                    <span className="text-3xl font-black">150</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <b>Total Lemak</b> <span>8%</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <b>Sodium/Garam</b> <span>15%</span>
                    </div>
                    <div className="flex justify-between">
                      <b>Protein</b> <span>12%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Panduan Masak */}
            {activeTab === "Panduan Masak" && (
              <div className="max-w-3xl">
                <h3 className="text-xl font-bold text-[#11327c] mb-6">
                  Cara Penyajian yang Disarankan
                </h3>
                <div className="space-y-6">
                  {[
                    { step: 1, title: "Penggorengan (Deep Fry)", desc: "Panaskan minyak goreng hingga suhu 170°C. Goreng selama 4-5 menit hingga keemasan dan renyah." },
                    { step: 2, title: "Air Fryer", desc: "Panaskan suhu 180°C. Masak selama 10-12 menit, balik pada menit ke-6 untuk hasil merata." },
                    { step: 3, title: "Oven", desc: "Panaskan oven 200°C. Panggang selama 15-18 menit. Cocok untuk hasil yang lebih rendah lemak." },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1c54ff] flex items-center justify-center font-bold flex-shrink-0">
                        {s.step}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{s.title}</h4>
                        <p className="text-sm text-gray-600">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Nutrisi */}
            {activeTab === "Nutrisi" && (
              <div className="max-w-3xl">
                <h3 className="text-xl font-bold text-[#11327c] mb-4">
                  Detail Kandungan Nutrisi & Alergen
                </h3>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <ul className="space-y-3 text-sm text-gray-700">
                    {[
                      { label: "Kalori Total", val: "150 kkal" },
                      { label: "Protein", val: "12g (14% AKG)" },
                      { label: "Lemak Total", val: "8g (10% AKG)" },
                      { label: "Karbohidrat", val: "15g (5% AKG)" },
                      { label: "Sodium", val: "240mg (10% AKG)" },
                      { label: "Serat", val: "2g" },
                    ].map((item) => (
                      <li key={item.label} className="flex justify-between border-b border-gray-200 pb-2 last:border-0">
                        <span>{item.label}</span>
                        <span className="font-bold">{item.val}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-xs font-medium flex gap-2">
                    <span className="text-lg flex-shrink-0">⚠️</span>
                    <p><strong>Alergen:</strong> Produk ini dapat mengandung gluten, kedelai, dan telur. Harap periksa kemasan untuk informasi lengkap.</p>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>

        {/* ===== MUNGKIN ANDA SUKA ===== */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-[#11327c] uppercase tracking-wider">
                Mungkin Anda Suka
              </h2>
              <Link
                to="/menu"
                className="text-[#1c54ff] text-sm font-bold hover:underline flex items-center gap-1"
              >
                Lihat Semua <FiChevronRight />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => {
                const rpImg = getImageUrl(rp.image);
                const rpPrice = typeof rp.price === "string" ? parseFloat(rp.price) : rp.price || 0;
                return (
                  <div
                    key={rp.id}
                    onClick={() => navigate(`/product/${rp.id}`)}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col h-full cursor-pointer hover:-translate-y-1"
                  >
                    <div className="aspect-square bg-gray-50 overflow-hidden p-4 flex items-center justify-center">
                      <img
                        src={rpImg || "https://placehold.co/150x150/e2e8f0/94a3b8?text=Img"}
                        alt={rp.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/150x150/e2e8f0/94a3b8?text=Img";
                        }}
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-xs text-gray-400 mb-1">{rp.category || "Frozen Food"}</p>
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-2 group-hover:text-[#1c54ff] transition-colors">
                        {rp.name}
                      </h3>
                      <div className="mt-auto flex justify-between items-center pt-2">
                        <span className="text-[#1c54ff] font-bold text-sm">
                          Rp {formatRp(rpPrice)}
                        </span>
                        <button
                          className="bg-[#1c54ff] text-white p-2 rounded-lg hover:bg-blue-800 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isLogin) {
                              navigate("/login");
                              return;
                            }
                            dispatch(addToCart({ ...rp, image: rpImg, qty: 1 }));
                          }}
                        >
                          <FiShoppingCart size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;