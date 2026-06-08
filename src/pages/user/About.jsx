import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiTarget, FiAward, FiTruck, FiShield, FiHeart, FiMapPin, FiPhone, FiMail, FiUser, FiTag } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";

export default function About() {
  const [storeData, setStoreData] = useState(null);

  useEffect(() => {
    const fetchActiveStore = async () => {
      try {
        const res = await axiosInstance.get("/store-registrations/active");
        if (res.data?.success && res.data?.data) {
          setStoreData(res.data.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data toko aktif:", err);
      }
    };
    fetchActiveStore();
  }, []);

  const storeName = storeData?.store_name?.trim() || "AIDA FROZEN";
  const storeAddress = storeData?.address?.trim() || "Jl. Frozen Food Premium No. 12, Kota Jakarta";
  const storePhone = storeData?.phone?.trim() || "+62 812-3456-7890";
  const storeOwner = storeData?.owner_name?.trim() || "AIDA FROZEN Team";
  const storeType = storeData?.store_type?.trim() || "Warung / Retail";
  const storeCategory = storeData?.category?.trim() || "Frozen Food";
  const storeImage = storeData?.product_proof_1_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-24">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-[#55a8ea] to-[#3a32ff] text-white py-20 px-6 text-center rounded-b-[3rem] shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-300/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Tentang FrostMart
          </h1>
          <p className="text-base md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Menghadirkan kelezatan makanan beku premium langsung ke depan pintu rumah Anda dengan kecepatan tinggi, keamanan terjamin, dan kehalalan 100%.
          </p>
        </div>
      </section>

      {/* CORE VISION & MISSION */}
      <section className="max-w-5xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* VISI */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center text-center">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-5">
              <FiEye size={36} />
            </div>
            <h2 className="text-2xl font-black text-[#11327c] mb-3">Visi Kami</h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Menjadi platform penyedia makanan beku (frozen food) nomor satu di Indonesia yang dikenal karena keunggulan kualitas cold-chain, kecepatan pengiriman, dan integritas produk yang tinggi bagi keluarga Indonesia.
            </p>
          </div>

          {/* MISI */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center text-center">
            <div className="p-4 bg-yellow-50 text-yellow-600 rounded-full mb-5">
              <FiTarget size={36} />
            </div>
            <h2 className="text-2xl font-black text-[#11327c] mb-3">Misi Kami</h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Menyediakan pilihan makanan beku berkualitas premium yang halal dan higienis, menjaga kesegaran rasa dengan pengiriman rantai dingin terbaik, serta memberikan kemudahan berbelanja online secara instan untuk kepuasan pelanggan setia kami.
            </p>
          </div>
        </div>
      </section>

      {/* OUR VALUES */}
      <section className="max-w-5xl mx-auto px-6 mt-20 text-center">
        <p className="text-[#1c54ff] font-bold text-xs uppercase tracking-widest mb-2">Nilai Utama</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-12">Mengapa Memilih Kami?</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <FiShield className="text-green-600" size={28} />,
              bg: "bg-green-50",
              title: "100% Halal & Higienis",
              desc: "Seluruh produk kami telah tersertifikasi halal dan diproses dengan standar kebersihan tertinggi."
            },
            {
              icon: <FiAward className="text-blue-600" size={28} />,
              bg: "bg-blue-50",
              title: "Kualitas Premium",
              desc: "Dipilih dari produsen terpercaya dan dibekukan instan untuk mengunci rasa dan kesegaran nutrisi."
            },
            {
              icon: <FiTruck className="text-purple-600" size={28} />,
              bg: "bg-purple-50",
              title: "Pengiriman Cold-Chain",
              desc: "Pengiriman cepat dengan metode penjagaan suhu beku agar produk tidak rusak di jalan."
            },
            {
              icon: <FiHeart className="text-red-600" size={28} />,
              bg: "bg-red-50",
              title: "Pelayanan Sepenuh Hati",
              desc: "Layanan customer care yang responsif dan siap membantu kebutuhan belanja Anda kapan saja."
            }
          ].map((val, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center hover:-translate-y-1 transition-all duration-300">
              <div className={`p-3 rounded-2xl ${val.bg} mb-4`}>
                {val.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-2">{val.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SHOP LOCATION / INFO DETAIL */}
      <section className="max-w-5xl mx-auto px-6 mt-20">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-black text-[#11327c]">Toko Utama Kami</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              FrostMart dioperasikan secara resmi dari gerai utama **{storeName}**. Kami melayani pembelian retail maupun grosir untuk menyuplai berbagai kebutuhan rumah tangga hingga pelaku bisnis kuliner lokal di wilayah kami.
            </p>
            
            <div className="space-y-4 text-sm text-gray-700 font-medium">
              <div className="flex items-start gap-3">
                <FiMapPin className="text-blue-600 shrink-0 mt-1" size={20} />
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Alamat Toko</div>
                  <span className="text-gray-800">{storeAddress}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiPhone className="text-blue-600 shrink-0 mt-1" size={20} />
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Nomor Telepon</div>
                  <span className="text-gray-800">{storePhone}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiUser className="text-blue-600 shrink-0 mt-1" size={20} />
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pemilik Toko</div>
                  <span className="text-gray-800">{storeOwner}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiTag className="text-blue-600 shrink-0 mt-1" size={20} />
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tipe &amp; Kategori</div>
                  <span className="text-gray-800">{storeType} ({storeCategory})</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-[350px] shrink-0 aspect-[4/3] bg-gray-50 border border-gray-100 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center relative">
            <img
              src={storeImage}
              alt={storeName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://placehold.co/400x300/e2e8f0/94a3b8?text=FrostMart+Store";
              }}
            />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="max-w-5xl mx-auto px-6 mt-20 text-center">
        <div className="bg-gradient-to-r from-[#1c54ff] to-[#11327c] rounded-[2.5rem] p-8 md:p-12 text-white shadow-lg space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-extrabold relative z-10">Siap Menikmati Kelezatan Frozen Food Kami?</h2>
          <p className="text-blue-100 text-sm max-w-xl mx-auto relative z-10 leading-relaxed">
            Dapatkan pengalaman belanja frozen food instan tercepat dan terlengkap hanya dengan satu klik.
          </p>
          <div className="pt-2 relative z-10">
            <Link to="/menu">
              <button className="bg-white text-[#1c54ff] hover:bg-blue-50 font-bold px-10 py-3.5 rounded-full text-base shadow-lg transition duration-200">
                Mulai Belanja Sekarang
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
