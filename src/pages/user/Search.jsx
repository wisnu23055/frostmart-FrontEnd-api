import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import { FiShoppingCart, FiTag, FiSearch, FiAlertCircle } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import { USER_CATEGORIES } from "../../data/categories";

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

const CATEGORIES = USER_CATEGORIES;

// =====================
// PRODUCT CARD
// =====================
function ProductCard({ product, onAddToCart }) {
  const imgUrl = getImageUrl(product.image);
  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price || 0;

  return (
    <div className="mt-12 w-full max-w-[220px] mx-auto">
      <div className="relative bg-white rounded-[2rem] shadow-[0_4px_20px_-5px_rgba(0,0,0,0.08)] hover:shadow-xl transition-all pt-14 pb-4 px-4 flex flex-col h-full border border-gray-50 items-center text-center hover:-translate-y-1 duration-200">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full p-1 shadow-md">
          <Link to={`/product/${product.id}`} className="block w-full h-full rounded-full overflow-hidden bg-gray-100">
            <img
              src={imgUrl || "https://placehold.co/120x120/e2e8f0/94a3b8?text=Img"}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "https://placehold.co/120x120/e2e8f0/94a3b8?text=Img"; }}
            />
          </Link>
        </div>
        <div className="flex-1 flex flex-col w-full">
          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1 mt-1">{product.name}</h3>
          <p className="text-[11px] text-gray-500 mt-1 mb-2">{product.category || "Frozen Food"} · {product.brand || "FrostMart"}</p>
          <div className="mt-auto w-full">
            <p className="text-[#2453d4] font-bold text-[15px] mb-3">Rp {formatRp(price)}</p>
            <button
              onClick={() => onAddToCart(product)}
              className="w-full bg-[#1c54ff] hover:bg-blue-800 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 text-sm font-bold shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <FiShoppingCart size={15} /> + Keranjang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================
// EMPTY STATE
// =====================
function EmptyState({ query, onReset }) {
  return (
    <div className="min-h-[65vh] bg-[#f8fafc] flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="w-24 h-24 bg-[#eef2ff] text-[#6484e5] rounded-full flex items-center justify-center mb-6 shadow-inner">
        <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="44" width="44" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="7"></circle>
          <line x1="21" y1="21" x2="15" y2="15"></line>
          <line x1="8" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="8" y2="12"></line>
        </svg>
      </div>
      <h2 className="text-[26px] font-extrabold text-[#11327c] mb-3">
        Oops! Produk Tidak Ditemukan
      </h2>
      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
        Maaf, makanan beku premium yang Anda cari{query ? ` "${query}"` : ""} tidak tersedia atau mungkin ada kesalahan ketik.
      </p>
      <button
        onClick={onReset}
        className="text-[#1c54ff] text-sm font-bold hover:underline transition-all"
      >
        Atau Jelajahi Katalog Produk →
      </button>
    </div>
  );
}

// =====================
// MAIN
// =====================
function Search() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLogin = useSelector((state) => state.auth?.isLogin || false);

  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(queryFromUrl);
  const [activeCategory, setActiveCategory] = useState("Semua Produk");
  const [priceFilter, setPriceFilter] = useState("all");

  // Data dari backend
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync input saat URL berubah
  useEffect(() => {
    setSearchInput(queryFromUrl);
  }, [queryFromUrl]);

  // Fetch dari backend setiap kali query berubah
  const fetchProducts = useCallback(async (query) => {
    setIsLoading(true);
    try {
      const params = query ? `?search=${encodeURIComponent(query)}&limit=50` : "?limit=50";
      const response = await axiosInstance.get(`/products${params}`);
      const raw = response.data?.data || response.data?.products || response.data || [];
      setProducts(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Gagal mengambil data produk:", err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(queryFromUrl);
  }, [queryFromUrl, fetchProducts]);

  // Filter lokal (kategori + harga)
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const cat = p.category || "Lainnya";
      const matchCat = activeCategory === "Semua Produk" || cat === activeCategory;
      const price = typeof p.price === "string" ? parseFloat(p.price) : p.price || 0;
      let matchPrice = true;
      if (priceFilter === "under30") matchPrice = price < 30000;
      if (priceFilter === "30to80") matchPrice = price >= 30000 && price <= 80000;
      if (priceFilter === "above80") matchPrice = price > 80000;
      return matchCat && matchPrice;
    });
  }, [products, activeCategory, priceFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    setSearchParams(q ? { q } : {});
  };

  const handleResetSearch = () => {
    setSearchInput("");
    setSearchParams({});
    setActiveCategory("Semua Produk");
    setPriceFilter("all");
  };

  const handleAddToCart = (product) => {
    if (!isLogin) {
      alert("Kamu harus login dulu untuk menambahkan produk ke keranjang!");
      navigate("/login");
      return;
    }
    dispatch(addToCart({
      ...product,
      image: getImageUrl(product.image),
    }));

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

  // Empty state (setelah loading selesai)
  const showEmpty = !isLoading && filtered.length === 0;

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24">

      {/* HERO + SEARCH BAR */}
      <div className="bg-[#2453d4] pt-16 pb-28 px-6 text-center text-white rounded-b-[3rem] shadow-sm relative">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-widest uppercase mb-6">
          ALWAYS FROZEN
        </h1>
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-5">
          <div className="relative flex items-center w-full h-12 rounded-full shadow-lg bg-white overflow-hidden border-2 border-transparent focus-within:border-blue-300 transition-colors">
            <div className="grid place-items-center h-full w-12 text-gray-400 flex-shrink-0">
              <FiSearch size={20} />
            </div>
            <input
              className="peer h-full w-full outline-none text-sm text-gray-700 pr-2 bg-transparent"
              type="text"
              placeholder="Cari produk frozen food..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-[#1c54ff] hover:bg-blue-800 text-white h-full px-6 text-sm font-semibold transition-colors flex-shrink-0"
            >
              Cari
            </button>
          </div>
        </form>
        {queryFromUrl ? (
          <p className="text-blue-100 text-sm font-light">
            Hasil pencarian: <span className="font-bold">"{queryFromUrl}"</span>
          </p>
        ) : (
          <p className="text-blue-100 text-sm font-light">Menampilkan seluruh katalog produk</p>
        )}
        {!isLoading && (
          <p className="text-blue-200 text-xs mt-1">{filtered.length} produk ditemukan</p>
        )}
      </div>

      {/* CATEGORY PILLS */}
      <div className="relative z-10 flex flex-wrap justify-center gap-3 px-6 -mt-6 max-w-4xl mx-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold shadow-md transition-all border ${
              activeCategory === cat
                ? "bg-[#1c54ff] text-white border-[#1c54ff]"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-[1300px] mx-auto px-6 mt-16 flex flex-col lg:flex-row gap-10 items-start">

        {/* Filter Harga */}
        <aside className="w-full lg:w-[240px] flex-shrink-0">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-800 text-sm mb-5 flex items-center gap-2">
              <FiTag className="text-yellow-500" size={16} /> Filter Harga
            </h3>
            <div className="space-y-4 text-sm text-gray-600 flex flex-col sm:flex-row sm:flex-wrap lg:flex-col gap-x-6 gap-y-3 sm:space-y-0 lg:space-y-4">
              {[
                { value: "all", label: "Semua harga" },
                { value: "under30", label: "< Rp 30.000" },
                { value: "30to80", label: "Rp 30.000 - Rp 80.000" },
                { value: "above80", label: "> Rp 80.000" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    className="accent-[#1c54ff] w-4 h-4"
                    checked={priceFilter === opt.value}
                    onChange={() => setPriceFilter(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 w-full">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="mt-12 w-full max-w-[220px] mx-auto animate-pulse">
                  <div className="bg-gray-200 rounded-[2rem] pt-14 pb-4 px-4 h-44" />
                </div>
              ))}
            </div>
          ) : showEmpty ? (
            <EmptyState query={queryFromUrl} onReset={handleResetSearch} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-6">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;