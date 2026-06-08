import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiCreditCard, FiClock } from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance'; // Pastikan path ini bener sesuai struktur lu
import { formatDateTime } from '../../utils/dateFormatter';

const translateStatus = (order) => {
  if (!order) return '';
  const s = order.status?.toLowerCase() || '';
  const isPaid = order.payment_status === 'paid';
  if (s === 'pending') {
    if (isPaid) return 'Menunggu Proses';
    return 'Menunggu';
  }
  if (s === 'paid') return 'Proses';
  if (s === 'completed') return 'Selesai';
  if (s === 'cancelled') return 'Dibatalkan';
  return order.status || 'Menunggu';
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [qrisStoreData, setQrisStoreData] = useState(null);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axiosInstance.get(`/orders/${id}`);
        const data = response.data.data || response.data;
        setOrder(data);
      } catch (error) {
        console.error("Gagal menarik detail pesanan:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id]);

  useEffect(() => {
    const fetchActiveStore = async () => {
      try {
        const res = await axiosInstance.get("/store-registrations/active");
        if (res.data?.success && res.data?.data) {
          setQrisStoreData(res.data.data);
        }
      } catch (err) {
        console.error("Gagal menarik data QRIS toko aktif:", err);
      }
    };
    fetchActiveStore();
  }, []);

  useEffect(() => {
    if (!order || order.status?.toLowerCase() !== "pending") {
      return;
    }

    const payStatus = order.payment_status || "";
    if (payStatus === "paid") {
      return;
    }

    const payMethod = order.payment_method || order.paymentMethod || "";
    const isCod = payMethod.toLowerCase() === 'cash' || payMethod === "Bayar di Tempat (COD)";
    if (isCod) {
      return;
    }

    const rawDate = order.createdAt || order.created_at;
    const expiresAt = new Date(rawDate).getTime() + 10 * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        setIsExpired(true);
        setOrder(prev => prev ? { ...prev, status: "cancelled" } : null);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        const pad = (num) => (num < 10 ? `0${num}` : num);
        setTimeLeft(`${pad(minutes)}:${pad(seconds)}`);
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [order]);

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-semibold text-gray-500">Mencetak struk pesanan...</div>;
  if (!order) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-semibold text-gray-500">Pesanan tidak ditemukan.</div>;

  const orderIdStr = order.id || order._id;
  const shortId = orderIdStr.toString().substring(0, 8).toUpperCase();
  const rawDate = order.createdAt || order.created_at;
  const formattedDate = formatDateTime(rawDate);
  const safeTotal = order.totalAmount || order.total_price || order.total || 0;

  const payMethod = order.payment_method || order.paymentMethod || 'Transfer / COD';
  const isTransferBank = payMethod === 'Transfer Bank';
  const isEwallet = payMethod === 'E-Wallet';
  const isCod = payMethod.toLowerCase() === 'cash' || payMethod === 'Bayar di Tempat (COD)';
  const isPaid = order.payment_status === 'paid' || order.status?.toLowerCase() === 'paid';
  const isPendingNonCod = order.status?.toLowerCase() === 'pending' && !isCod && !isPaid;

  // Helper colors for status
  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') {
      if (order?.payment_status === 'paid') return 'text-green-600';
      return 'text-amber-500';
    }
    if (s === 'paid') return 'text-green-600';
    if (s === 'completed') return 'text-blue-600';
    if (s === 'cancelled') return 'text-red-500';
    return 'text-gray-500';
  };

  const getStatusBgColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') {
      if (order?.payment_status === 'paid') return 'bg-green-50 text-green-600';
      return 'bg-amber-50 text-amber-500';
    }
    if (s === 'paid') return 'bg-green-50 text-green-600';
    if (s === 'completed') return 'bg-blue-50 text-[#1c54ff]';
    if (s === 'cancelled') return 'bg-red-50 text-red-500';
    return 'bg-gray-50 text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600">
            <FiArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">Detail Pesanan</h1>
            <p className="text-sm text-gray-500">FM-{shortId}</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${getStatusBgColor(order.status)}`}>
              <FiClock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-0.5">Status Pesanan</p>
              <p className={`font-bold text-lg uppercase tracking-wide ${getStatusColor(order.status)}`}>
                {translateStatus(order)}
              </p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm text-gray-500 mb-0.5">Waktu Pembelian</p>
            <p className="font-semibold text-gray-800">{formattedDate}</p>
          </div>
        </div>

        {/* Countdown Banner & Bayar Sekarang Button */}
        {isPendingNonCod && !isExpired && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-full animate-pulse shrink-0">
                <FiClock size={24} />
              </div>
              <div>
                <p className="text-sm text-amber-800 font-bold mb-0.5">Selesaikan Pembayaran</p>
                <p className="text-xs text-amber-600 font-medium">
                  Harap selesaikan pembayaran dalam <span className="font-bold text-sm text-amber-800">{timeLeft}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowQrisModal(true)}
              className="bg-[#1c54ff] hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <FiCreditCard size={18} />
              Bayar Sekarang
            </button>
          </div>
        )}

        {/* Pembayaran Berhasil, Menunggu Diproses */}
        {order.status?.toLowerCase() === 'pending' && order.payment_status === 'paid' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-4 flex items-center gap-3">
            <div className="p-3 bg-green-100 text-green-600 rounded-full shrink-0 animate-pulse">
              <FiPackage size={24} />
            </div>
            <div>
              <p className="text-sm text-green-800 font-bold mb-0.5">Pembayaran Berhasil Verifikasi</p>
              <p className="text-xs text-green-600 font-medium">
                Pembayaran Anda telah diterima. Pesanan Anda saat ini sedang menunggu untuk diproses dan dikemas oleh toko.
              </p>
            </div>
          </div>
        )}

        {/* Selesaikan Pesanan Banner */}
        {order.status?.toLowerCase() === 'paid' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 text-green-600 rounded-full shrink-0">
                <FiPackage size={24} />
              </div>
              <div>
                <p className="text-sm text-green-800 font-bold mb-0.5">Pesanan Sedang Diproses / Dikirim</p>
                <p className="text-xs text-green-600 font-medium">
                  Jika pesanan telah sampai dengan baik, harap konfirmasi penyelesaian pesanan.
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                if (window.confirm("Apakah Anda yakin ingin menyelesaikan pesanan ini?")) {
                  try {
                    await axiosInstance.post(`/orders/${order.id}/complete-order`);
                    setOrder(prev => prev ? { ...prev, status: "completed" } : null);
                    alert("Pesanan berhasil diselesaikan!");
                  } catch (err) {
                    console.error("Gagal menyelesaikan pesanan:", err);
                    alert("Gagal menyelesaikan pesanan. Silakan coba lagi.");
                  }
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Selesaikan Pesanan
            </button>
          </div>
        )}

        {/* Rincian Produk */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <FiPackage className="text-gray-600" />
            <h2 className="font-bold text-gray-800">Daftar Produk</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items && order.items.map((item, idx) => {
              const pName = item.productName || item.product_name || item.name || 'Produk Frozen';
              const pPrice = Number(item.price) || 0;
              const pQty = Number(item.quantity) || 1;
              return (
                <div key={idx} className="p-6 flex justify-between items-center hover:bg-blue-50/20 transition">
                  <div>
                    <p className="font-bold text-gray-800 text-base">{pName}</p>
                    <p className="text-sm text-gray-500 mt-1">{pQty} x Rp {pPrice.toLocaleString('id-ID')}</p>
                  </div>
                  <p className="font-bold text-gray-800">Rp {(pQty * pPrice).toLocaleString('id-ID')}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ringkasan Pembayaran */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <FiCreditCard className="text-gray-600" />
            <h2 className="font-bold text-gray-800">Rincian Pembayaran</h2>
          </div>
          <div className="p-6 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Metode Pembayaran</span>
              <span className="font-semibold text-gray-800 uppercase">{payMethod}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Subtotal Produk</span>
              <span className="font-semibold text-gray-800">Rp {Number(safeTotal).toLocaleString('id-ID')}</span>
            </div>
            
            <div className="border-t border-dashed border-gray-200 mt-4 pt-4 flex justify-between items-center">
              <span className="font-bold text-gray-800 text-base">Total Belanja</span>
              <span className="font-extrabold text-[#1c54ff] text-xl">Rp {Number(safeTotal).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* QRIS PAYMENT MODAL */}
      {showQrisModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center select-none border border-gray-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-800 mb-1">Pembayaran QRIS</h3>
            <p className="text-sm text-gray-400 mb-5">Order ID: FM-{shortId}</p>

            {/* QRIS Code Image */}
            <div className="w-60 h-60 mx-auto bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-center shadow-inner mb-5">
              <img
                src={
                  (isTransferBank
                    ? (qrisStoreData?.bank_qris_url || qrisStoreData?.ewallet_qris_url)
                    : (qrisStoreData?.ewallet_qris_url || qrisStoreData?.bank_qris_url)) ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=FrostMart-Order-FM-${shortId}`
                }
                alt="QRIS Code"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=FrostMart-Order-FM-${shortId}`;
                }}
              />
            </div>

            {/* Payment Info Details */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm text-left border border-gray-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400 font-semibold">Metode:</span>
                <span className="font-bold text-gray-800">{payMethod}</span>
              </div>
              
              {isTransferBank ? (
                // Transfer Bank
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-semibold">Bank:</span>
                    <span className="font-bold text-gray-800">{qrisStoreData?.bank_name || "BCA"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-semibold">Pemilik Rekening:</span>
                    <span className="font-bold text-gray-800">{qrisStoreData?.bank_account_name || "AIDA FROZEN"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-semibold">No. Rekening:</span>
                    <span className="font-bold text-gray-800">{qrisStoreData?.bank_account_number || "123-456-7890"}</span>
                  </div>
                </>
              ) : (
                // E-Wallet
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-semibold">E-Wallet:</span>
                    <span className="font-bold text-gray-800">{qrisStoreData?.ewallet_name || "GoPay/OVO/Dana"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-semibold">Pemilik Akun:</span>
                    <span className="font-bold text-gray-800">{qrisStoreData?.ewallet_owner_name || "AIDA FROZEN"}</span>
                  </div>
                </>
              )}

              <div className="border-t border-gray-200/60 pt-2.5 mt-2 flex justify-between items-center">
                <span className="text-gray-500 font-bold">Total Pembayaran:</span>
                <span className="text-blue-600 font-extrabold text-base">
                  Rp{safeTotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Buttons in Indonesian */}
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowQrisModal(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold rounded-xl text-sm transition"
              >
                Batal
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  try {
                    await axiosInstance.post(`/orders/${order.id}/confirm-payment`);
                    setOrder(prev => prev ? { ...prev, payment_status: "paid" } : null);
                  } catch (err) {
                    console.error("Gagal mengonfirmasi pembayaran:", err);
                    alert("Gagal mengonfirmasi pembayaran. Silakan coba lagi.");
                  }
                  setShowQrisModal(false);
                  navigate("/payment-success", { 
                    state: {
                      orderNumber: `FM-${shortId}`,
                      paymentMethod: payMethod,
                      totalAmount: safeTotal,
                    }
                  });
                }}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-green-600/20"
              >
                Saya Sudah Bayar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}