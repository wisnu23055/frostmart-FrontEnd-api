import React, { useState, useEffect } from 'react';
import { FiPackage, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom'; // <--- TAMBAHAN: Import useNavigate
import axiosInstance from '../../api/axiosInstance'; 
import { formatDateTimeShort } from '../../utils/dateFormatter'; 

const getStatusIcon = (order) => {
  const s = order?.status?.toLowerCase() || '';
  const isPaid = order?.payment_status === 'paid';
  if (s === 'pending' && isPaid) return <FiClock className="text-green-500" size={18} />;
  if (s.includes('selesai') || s.includes('completed')) return <FiCheckCircle className="text-green-500" size={18} />;
  if (s.includes('batal') || s.includes('cancelled')) return <FiXCircle className="text-red-500" size={18} />;
  return <FiClock className="text-yellow-500" size={18} />; 
};

const getStatusStyle = (order) => {
  const s = order?.status?.toLowerCase() || '';
  const isPaid = order?.payment_status === 'paid';
  if (s === 'pending' && isPaid) return 'bg-green-100 text-green-700';
  if (s.includes('selesai') || s.includes('completed')) return 'bg-green-100 text-green-700';
  if (s.includes('batal') || s.includes('cancelled')) return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
};

const translateStatus = (order) => {
  const s = order?.status?.toLowerCase() || '';
  const isPaid = order?.payment_status === 'paid';
  if (s === 'pending') {
    if (isPaid) return 'Menunggu Proses';
    return 'Menunggu';
  }
  if (s === 'paid') return 'Proses';
  if (s === 'completed') return 'Selesai';
  if (s === 'cancelled') return 'Dibatalkan';
  return order.status || 'Menunggu';
};

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // <--- TAMBAHAN: Inisialisasi navigate

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const response = await axiosInstance.get('/orders/my');
        
        let data = [];
        if (response.data && Array.isArray(response.data)) {
            data = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            data = response.data.data;
        }
        
        const sortedData = data.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || 0);
            const dateB = new Date(b.createdAt || b.created_at || 0);
            return dateB - dateA;
        });
        
        setOrders(sortedData);
      } catch (error) {
        console.error("Gagal menarik data pesanan:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMyOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-[1000px] mx-auto px-6">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#11327c]">Riwayat Pesanan</h1>
          <p className="text-gray-500 mt-2 text-sm">Pantau status pengiriman dan riwayat belanja frozen food Anda di sini.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-10 text-center text-gray-500 font-medium">
              Memuat data pesanan Anda...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPackage size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Belum ada pesanan</h3>
              <p className="text-gray-500 text-sm mt-2 mb-6">Yuk, mulai belanja makanan beku favoritmu!</p>
              <Link to="/menu" className="bg-[#1c54ff] hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => {
                const orderId = order.id || order._id || "N/A";
                const shortId = orderId.toString().substring(0, 8).toUpperCase();
                
                const rawTotal = order.totalAmount || order.total_amount || order.total || order.totalPrice || order.total_price || 0;
                const safeTotal = typeof rawTotal === 'string' ? parseFloat(rawTotal.replace(/[^0-9.-]+/g,"")) : rawTotal;

                const rawDate = order.createdAt || order.created_at;
                const formattedDate = formatDateTimeShort(rawDate);

                let itemNames = "Pesanan Frostmart";
                if (order.items && Array.isArray(order.items) && order.items.length > 0) {
                   itemNames = order.items.map(i => {
                      if (i.Product && i.Product.name) return i.Product.name; 
                      if (i.productName) return i.productName; 
                      if (i.name) return i.name; 
                      return 'Produk';
                   }).join(', ');
                } else if (order.item_details) { 
                   itemNames = order.item_details;
                }

                return (
                  <div key={orderId} className="p-6 hover:bg-blue-50/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    {/* Info Kiri */}
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getStatusIcon(order)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-gray-900">FM-{shortId}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(order)}`}>
                            {translateStatus(order)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Tanggal: {formattedDate}</p>
                        <p className="text-sm text-gray-700 line-clamp-1" title={itemNames}>{itemNames}</p>
                      </div>
                    </div>

                    {/* Info Kanan & Aksi */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t border-gray-100 md:border-0 pt-4 md:pt-0">
                      <div className="text-left md:text-right mb-0 md:mb-3">
                        <p className="text-xs text-gray-500 mb-1">Total Belanja</p>
                        <p className="font-extrabold text-[#1c54ff] text-lg">
                          Rp {safeTotal.toLocaleString('id-ID')}
                        </p>
                      </div>
                      {/* 👇👇 TAMBAHAN: Fungsi onClick navigasi ke halaman detail 👇👇 */}
                      <button 
                        onClick={() => navigate(`/profile/orders/${orderId}`)} 
                        className="text-sm font-semibold text-[#1c54ff] border border-[#1c54ff] hover:bg-[#1c54ff] hover:text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Lihat Detail
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}