import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import { FiStar, FiShoppingCart, FiTag } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import { USER_CATEGORIES } from "../../data/categories";

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

function Stars({ rating = 5 }) {
  return (
    <div className="flex gap-0.5 justify-center mt-2 mb-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar key={s} size={12} className={s <= Math.round(rating) ? "fill-[#facc15] text-[#facc15]" : "text-gray-200 fill-gray-200"} />
      ))}
    </div>
  );
}

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
          <Stars rating={product.rating || 5} />
          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1 mt-1">{product.name}</h3>
          <p className="text-[11px] text-gray-500 mt-1 mb-3">{product.brand || "FrostMart"} · {product.category || 'Frozen Food'}</p>
          <div className="mt-auto w-full">
            <p className="text-blue-700 font-bold text-[15px] mb-3">
              Rp {formatRp(price)}
            </p>
            <button onClick={() => onAddToCart(product)} className="w-full bg-[#1c54ff] hover:bg-blue-800 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 text-sm font-bold shadow-md transition-transform hover:scale-105 active:scale-95">
              <FiShoppingCart size={16} /> + Keranjang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Menu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLogin = useSelector((state) => state.auth.isLogin);
  
  // State Dinamis
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Semua Produk");
  const [priceFilter, setPriceFilter] = useState("all");

  // Fetch dari API Backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get("/products?limit=100");
        const data = response.data.data || response.data || [];
        setProducts(data);
      } catch (error) {
        console.error("Gagal menarik data menu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      // Pastikan category ada supaya filter jalan (pakai fallback buat data kotor)
      const cat = p.category || "Lainnya";
      const matchCat = activeCategory === "Semua Produk" || cat === activeCategory;
      
      let matchPrice = true;
      const price = p.price || 0;
      if (priceFilter === "under30") matchPrice = price < 30000;
      if (priceFilter === "30to80") matchPrice = price >= 30000 && price <= 80000;
      if (priceFilter === "above80") matchPrice = price > 80000;
      
      return matchCat && matchPrice;
    });
  }, [activeCategory, priceFilter, products]);

  const handleAddToCart = (product) => {
    if (!isLogin) {
      alert("Kamu harus login dulu untuk menambahkan produk ke keranjang!");
      navigate("/login");
      return;
    }
    dispatch(addToCart({ ...product, image: getImageUrl(product.image) }));
    
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

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24">
      
      {/* Hero Section */}
      <div className="bg-[#2453d4] pt-20 pb-28 px-6 text-center text-white rounded-b-[3rem] shadow-sm relative">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-widest uppercase">ALWAYS FROZEN</h1>
      </div>

      {/* Tombol Kategori */}
      <div className="relative z-10 flex flex-wrap justify-center gap-3 px-6 -mt-6 max-w-4xl mx-auto">
        {CATEGORIES.map((cat) => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)} 
            className={`px-6 py-2.5 rounded-full text-sm font-semibold shadow-md transition-all ${
              activeCategory === cat 
              ? "bg-[#1c54ff] text-white" 
              : "bg-white text-gray-600 hover:bg-gray-50"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Main Layout */}
      <div className="max-w-[1300px] mx-auto px-6 mt-16 flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Kolom KIRI: Filter Harga */}
        <aside className="w-full lg:w-[240px] flex-shrink-0">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-800 text-sm mb-5 flex items-center gap-2">
              <FiTag className="text-yellow-500" size={16} /> Filter Harga
            </h3>
            <div className="space-y-4 text-sm text-gray-600 flex flex-col sm:flex-row sm:flex-wrap lg:flex-col gap-x-6 gap-y-3 sm:space-y-0 lg:space-y-4">
              <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="price" className="accent-[#1c54ff] w-4 h-4" checked={priceFilter === "all"} onChange={() => setPriceFilter("all")} /> Semua harga</label>
              <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="price" className="accent-[#1c54ff] w-4 h-4" checked={priceFilter === "under30"} onChange={() => setPriceFilter("under30")} /> &lt; Rp 30.000</label>
              <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="price" className="accent-[#1c54ff] w-4 h-4" checked={priceFilter === "30to80"} onChange={() => setPriceFilter("30to80")} /> Rp 30.000 - Rp 80.000</label>
              <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="price" className="accent-[#1c54ff] w-4 h-4" checked={priceFilter === "above80"} onChange={() => setPriceFilter("above80")} /> &gt; Rp 80.000</label>
            </div>
          </div>
        </aside>

        {/* Kolom KANAN: Grid 4 Kolom Produk */}
        <div className="flex-1 w-full">
          {isLoading ? (
            <div className="text-center text-gray-500 py-10 font-semibold">Mengambil menu terbaru dari server...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-10 font-semibold">Tidak ada produk di kategori ini.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-6">
              {filtered.map((product) => (
                <ProductCard key={product.id || product._id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Menu;