import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import { FiShoppingCart } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";

// =====================
// Helper
// =====================
function getImageUrl(image) {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (typeof image === "object" && image.url) return image.url;
  return null;
}

function formatRp(num) {
  const n = typeof num === "string" ? parseFloat(num) : num;
  return isNaN(n) ? "0" : n.toLocaleString("id-ID");
}

export default function FrostmartHomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLogin = useSelector((state) => state.auth?.isLogin || false);

  const handleDaftarClick = (e) => {
    if (isLogin) {
      e.preventDefault();
      alert("Anda sudah login");
    }
  };

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get("/products?limit=20");
        const raw = response.data?.data || response.data?.products || response.data || [];
        setProducts(Array.isArray(raw) ? raw : []);
      } catch (error) {
        console.error("Gagal menarik data produk untuk Home:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const heroProducts = products.slice(0, 4);
  const menuProducts = products.slice(4, 8);

  const handleAddToCart = (item) => {
    if (!isLogin) {
      navigate("/login");
      return;
    }
    dispatch(addToCart({ ...item, image: getImageUrl(item.image) }));

    // Toast feedback
    const toast = document.createElement("div");
    toast.textContent = `✅ ${item.name} ditambahkan ke keranjang!`;
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

  // Placeholder cards saat loading
  const SkeletonCard = () => (
    <div className="bg-white w-[220px] rounded-2xl pt-24 pb-6 px-5 relative shadow-xl animate-pulse">
      <div className="w-32 h-32 rounded-full bg-gray-200 absolute -top-10 left-1/2 -translate-x-1/2" />
      <div className="text-center mt-6 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
      </div>
    </div>
  );

  return (
    <div className="bg-[#f5f5f5] text-gray-800 overflow-hidden">

      {/* ========================= HERO ========================= */}
      <section className="bg-gradient-to-b from-[#55a8ea] to-[#3a32ff] min-h-[640px] px-6 md:px-10 py-16 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-16 lg:gap-10">
        <div className="max-w-lg text-white text-center lg:text-left shrink-0">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Pengiriman Tercepat<br />Untuk Makanan Anda
          </h1>
          <p className="text-base mb-8 text-blue-100 leading-relaxed">
            Pesan frozen food favoritmu sekarang. Pengiriman cepat, aman, dan pastinya halal hingga ke tanganmu.
          </p>
          <Link to="/menu">
            <button className="bg-[#251c7a] hover:bg-blue-900 active:scale-95 transition-all duration-200 text-white px-8 py-3 rounded-full font-bold text-base shadow-lg">
              Mulai Belanja
            </button>
          </Link>
        </div>

        {/* Produk Hero */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 md:gap-x-12 gap-y-16 md:gap-y-20 shrink-0 justify-items-center">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : heroProducts.map((item) => {
              const imgUrl = getImageUrl(item.image);
              return (
                <Link
                  to={`/product/${item.id}`}
                  key={item.id}
                  className="bg-white w-[220px] rounded-2xl pt-24 pb-6 px-5 relative shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer"
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full overflow-hidden shadow-lg bg-gray-100 border-4 border-white">
                    <img
                      src={imgUrl || "https://placehold.co/128x128/e2e8f0/94a3b8?text=F"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://placehold.co/128x128/e2e8f0/94a3b8?text=F"; }}
                    />
                  </div>
                  <div className="text-center mt-6">
                    <h2 className="text-sm font-bold truncate text-gray-900">{item.name}</h2>
                    <p className="text-gray-500 mt-1 text-xs truncate">Oleh {item.brand || "FrostMart"}</p>
                    <p className="text-yellow-400 mt-2 text-base">★★★★★</p>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>

      {/* ========================= WHAT WE SERVE ========================= */}
      <section className="py-24 px-10 bg-white text-center">
        <p className="text-orange-400 font-semibold text-sm mb-3 uppercase tracking-widest">
          Cara Kerja
        </p>
        <h2 className="text-4xl font-bold mb-5 text-gray-900">Layanan Kami</h2>
        <p className="text-gray-500 text-base max-w-2xl mx-auto mb-16 leading-relaxed">
          Kualitas produk adalah prioritas utama kami. Kami selalu menjamin kehalalan dan keamanan produk hingga sampai ke tangan Anda.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
          {[
            {
              emoji: "📱",
              title: "Mudah Dipesan",
              desc: "Cukup pesan melalui website kami, tanpa ribet dan antri.",
            },
            {
              emoji: "🛵",
              title: "Pengiriman Tercepat",
              desc: "Pengiriman tepat waktu dengan cold-chain logistics terbaik.",
            },
            {
              emoji: "📦",
              title: "Kualitas Terbaik",
              desc: "Produk frozen food pilihan berkualitas premium untuk keluarga.",
            },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {item.emoji}
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================= DISCOUNT BANNER ========================= */}
      <section
        className="h-[400px] bg-cover bg-center relative flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1615937691194-97dbd3f3dc29?q=80&w=1200&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        <div className="relative text-center text-white px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 max-w-2xl mx-auto leading-tight">
            Selamat Berbelanja!
          </h2>
           <Link to="/register" onClick={handleDaftarClick}>
            <button className="bg-[#1c54ff] hover:bg-blue-700 active:scale-95 transition-all duration-200 text-white px-8 py-3 rounded-full font-bold text-base shadow-lg">
              Daftar Sekarang
            </button>
          </Link>
        </div>
      </section>

      {/* ========================= POPULAR MENU ========================= */}
      <section id="menu" className="py-24 px-10 text-center bg-[#f8f8f8]">
        <p className="text-[#1c54ff] font-semibold text-sm mb-3 uppercase tracking-widest">
          Menu Kami
        </p>
        <h2 className="text-4xl font-bold mb-5 text-gray-900">
          Menu Frozen Food Populer
        </h2>
        <p className="text-gray-500 text-base mb-16 max-w-xl mx-auto leading-relaxed">
          Pilihan terbaik dari FrostMart yang paling sering dibeli pelanggan setia kami.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 max-w-[1200px] mx-auto">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-md animate-pulse">
                <div className="w-36 h-36 rounded-full bg-gray-200 mx-auto mb-5" />
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4 mx-auto" />
                <div className="h-3 bg-gray-200 rounded mb-3 w-1/2 mx-auto" />
                <div className="h-5 bg-gray-200 rounded w-1/3 mx-auto" />
              </div>
            ))
            : menuProducts.map((item) => {
              const imgUrl = getImageUrl(item.image);
              const price = typeof item.price === "string" ? parseFloat(item.price) : item.price || 0;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 shadow-md relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <div className="w-36 h-36 rounded-full overflow-hidden mx-auto mb-5 bg-gray-100 border-4 border-gray-50 shadow-sm">
                    <img
                      src={imgUrl || "https://placehold.co/144x144/e2e8f0/94a3b8?text=F"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = "https://placehold.co/144x144/e2e8f0/94a3b8?text=F"; }}
                    />
                  </div>

                  <h3 className="text-base font-bold truncate text-gray-900">{item.name}</h3>
                  <p className="text-gray-500 mt-1 text-xs truncate">Oleh {item.brand || "FrostMart"}</p>
                  <p className="font-bold text-base mt-3 text-gray-800">
                    Rp {formatRp(price)}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                    className="mt-4 w-full bg-[#1c54ff] hover:bg-blue-800 text-white text-sm font-semibold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <FiShoppingCart size={14} /> Tambah ke Keranjang
                  </button>

                  <span className="absolute bottom-4 right-4 text-red-400 text-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    ♥
                  </span>
                </div>
              );
            })}
        </div>

        <Link to="/menu">
          <button className="bg-[#1c54ff] hover:bg-blue-800 transition-colors text-white px-8 py-3 rounded-full text-base font-bold shadow-md hover:shadow-lg">
            Lihat Semua Menu
          </button>
        </Link>
      </section>

      {/* ========================= TESTIMONI ========================= */}
      <section className="px-10 pb-24 bg-[#f8f8f8]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center max-w-[1200px] mx-auto">
          <div>
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop"
              alt="frozen food frostmart"
              className="rounded-3xl h-[420px] w-full object-cover shadow-xl"
            />
          </div>

          <div className="space-y-6">
            {[
              {
                name: "Hans",
                stars: 5,
                text: '"Di aplikasi ini sangat rekomen banget untuk kalian yang mau pesan Frozen Food tanpa ribet keluar Rumah."',
              },
              {
                name: "Naura Silvana",
                stars: 5,
                text: '"Keren banget aplikasinya, buat kaum mager cocok nih!!"',
              },
            ].map((t, i) => (
              <div
                key={i}
                className={`bg-white p-6 rounded-3xl shadow-md ${i === 1 ? "ml-8" : ""}`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{t.name}</h3>
                    <p className="text-yellow-400 text-sm">{"★".repeat(t.stars)}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}