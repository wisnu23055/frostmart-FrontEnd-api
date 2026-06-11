import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiCreditCard, FiClock } from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance'; // Pastikan path ini bener sesuai struktur lu
import { formatDateTime } from '../../utils/dateFormatter';

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return resolve(file);
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.7
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

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

  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState("");

  const handlePaymentProofChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Gambar bukti Anda terlalu besar (maksimal 5MB).");
      return;
    }

    try {
      const compressed = await compressImage(file);
      setPaymentProofFile(compressed);
      setPaymentProofPreview(URL.createObjectURL(compressed));
    } catch (err) {
      console.error("Gagal mengompresi gambar:", err);
      setPaymentProofFile(file);
      setPaymentProofPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePaymentProof = () => {
    setPaymentProofFile(null);
    setPaymentProofPreview("");
  };

  const handleDownloadQris = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = localUrl;
      a.download = `QRIS-Merchant-FrostMart.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(localUrl);
    } catch (err) {
      console.error("Gagal mengunduh QRIS:", err);
      window.open(url, "_blank");
    }
  };

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
  const isQris = payMethod === 'QRIS';
  const isCod = payMethod.toLowerCase() === 'cash' || payMethod === 'Bayar di Tempat (COD)';
  const isPaid = order.payment_status === 'paid' || order.status?.toLowerCase() === 'paid';
  const hasUploadedProof = !!order.payment_proof_url;
  const isPendingNonCod = order.status?.toLowerCase() === 'pending' && !isCod && !isPaid && !hasUploadedProof;

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

        {/* Bukti Pembayaran Sudah Diunggah & Menunggu Verifikasi */}
        {order.status?.toLowerCase() === 'pending' && !isCod && hasUploadedProof && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-4 flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full shrink-0">
              <FiClock size={24} className="animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <p className="text-sm text-blue-800 font-bold mb-0.5">Bukti Pembayaran Berhasil Diunggah</p>
              <p className="text-xs text-blue-600 font-medium">
                Bukti transfer Anda telah berhasil dikirim dan sedang dalam proses verifikasi oleh admin. Mohon tunggu.
              </p>
            </div>
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
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center select-none border border-gray-100 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold text-gray-800 mb-1">Instruksi Pembayaran</h3>
            <p className="text-sm text-gray-400 mb-5">ID Pesanan: FM-{shortId}</p>

            {/* QRIS Code Image / Bank / Ewallet Details */}
            {isQris && qrisStoreData?.qris_url && (
              <div className="flex flex-col items-center gap-2 mb-5">
                <div 
                  className="w-48 h-48 bg-white border border-gray-200 rounded-2xl p-2 flex items-center justify-center shadow-sm cursor-pointer hover:shadow-md transition active:scale-95 mx-auto"
                  onClick={() => handleDownloadQris(qrisStoreData.qris_url)}
                  title="Klik untuk mengunduh QRIS otomatis"
                >
                  <img
                    src={qrisStoreData.qris_url}
                    alt="QRIS Merchant Toko"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-center text-xs text-gray-400 max-w-[280px] mt-1 leading-relaxed">
                  Mendukung GoPay, OVO, Dana, ShopeePay, M-Banking, dll.
                  <br />
                  <span className="text-blue-600 font-semibold">Klik gambar QRIS untuk mengunduh otomatis.</span>
                </p>
              </div>
            )}

            {isTransferBank && qrisStoreData && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left space-y-3 text-sm mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">TRANSFER KE REKENING BERIKUT:</p>
                
                {qrisStoreData.bank_1 && (
                  <div className="flex justify-between items-center pb-1 border-b border-gray-200/60">
                    <div>
                      <p className="font-extrabold text-blue-600">BCA</p>
                      <p className="font-bold text-gray-700 mt-0.5">{qrisStoreData.bank_1}</p>
                    </div>
                    <p className="text-xs text-gray-400 font-bold">A/N {qrisStoreData.bank_account_name || 'FROSTMART'}</p>
                  </div>
                )}
                
                {qrisStoreData.bank_2 && (
                  <div className="flex justify-between items-center pb-1 border-b border-gray-200/60">
                    <div>
                      <p className="font-extrabold text-blue-600">Mandiri</p>
                      <p className="font-bold text-gray-700 mt-0.5">{qrisStoreData.bank_2}</p>
                    </div>
                    <p className="text-xs text-gray-400 font-bold">A/N {qrisStoreData.bank_account_name || 'FROSTMART'}</p>
                  </div>
                )}

                {qrisStoreData.bank_3 && (
                  <div className="flex justify-between items-center pb-1 border-b border-gray-200/60">
                    <div>
                      <p className="font-extrabold text-blue-600">BRI</p>
                      <p className="font-bold text-gray-700 mt-0.5">{qrisStoreData.bank_3}</p>
                    </div>
                    <p className="text-xs text-gray-400 font-bold">A/N {qrisStoreData.bank_account_name || 'FROSTMART'}</p>
                  </div>
                )}

                {qrisStoreData.bank_4 && (
                  <div className="flex justify-between items-center pb-1">
                    <div>
                      <p className="font-extrabold text-blue-600">BNI</p>
                      <p className="font-bold text-gray-700 mt-0.5">{qrisStoreData.bank_4}</p>
                    </div>
                    <p className="text-xs text-gray-400 font-bold">A/N {qrisStoreData.bank_account_name || 'FROSTMART'}</p>
                  </div>
                )}
              </div>
            )}

            {isEwallet && qrisStoreData && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left space-y-3 text-sm mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">TRANSFER KE NOMOR E-WALLET BERIKUT:</p>
                {(() => {
                  const nums = [
                    qrisStoreData.ewallet_1,
                    qrisStoreData.ewallet_2,
                    qrisStoreData.ewallet_3,
                    qrisStoreData.ewallet_4,
                  ].filter(Boolean);
                  
                  const uniqueNums = [...new Set(nums)];
                  const allSame = uniqueNums.length === 1;

                  if (allSame && nums.length > 0) {
                    return (
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-extrabold text-[#1c54ff]">GoPay / OVO / Dana / ShopeePay</p>
                          <p className="font-bold text-gray-700 mt-0.5">{nums[0]}</p>
                        </div>
                        <p className="text-xs text-gray-400 font-bold">A/N {qrisStoreData.ewallet_owner_name || 'FROSTMART'}</p>
                      </div>
                    );
                  } else {
                    return (
                      <div className="space-y-3">
                        {qrisStoreData.ewallet_1 && (
                          <div className="flex justify-between items-center pb-1 border-b border-gray-200/60">
                            <div>
                              <p className="font-bold text-[#1c54ff]">GoPay</p>
                              <p className="text-gray-700 font-semibold mt-0.5">{qrisStoreData.ewallet_1}</p>
                            </div>
                            <p className="text-xs text-gray-400 font-bold">A/N {qrisStoreData.ewallet_owner_name || 'FROSTMART'}</p>
                          </div>
                        )}
                        {qrisStoreData.ewallet_2 && (
                          <div className="flex justify-between items-center pb-1 border-b border-gray-200/60">
                            <div>
                              <p className="font-bold text-[#1c54ff]">OVO</p>
                              <p className="text-gray-700 font-semibold mt-0.5">{qrisStoreData.ewallet_2}</p>
                            </div>
                            <p className="text-xs text-gray-400 font-bold">A/N {qrisStoreData.ewallet_owner_name || 'FROSTMART'}</p>
                          </div>
                        )}
                        {qrisStoreData.ewallet_3 && (
                          <div className="flex justify-between items-center pb-1 border-b border-gray-200/60">
                            <div>
                              <p className="font-bold text-[#1c54ff]">Dana</p>
                              <p className="text-gray-700 font-semibold mt-0.5">{qrisStoreData.ewallet_3}</p>
                            </div>
                            <p className="text-xs text-gray-400 font-bold">A/N {qrisStoreData.ewallet_owner_name || 'FROSTMART'}</p>
                          </div>
                        )}
                        {qrisStoreData.ewallet_4 && (
                          <div className="flex justify-between items-center pb-1">
                            <div>
                              <p className="font-bold text-[#1c54ff]">ShopeePay</p>
                              <p className="text-gray-700 font-semibold mt-0.5">{qrisStoreData.ewallet_4}</p>
                            </div>
                            <p className="text-xs text-gray-400 font-bold">A/N {qrisStoreData.ewallet_owner_name || 'FROSTMART'}</p>
                          </div>
                        )}
                      </div>
                    );
                  }
                })()}
              </div>
            )}

            {/* Total Pembayaran display */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left text-sm mb-5">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold">Total Pembayaran:</span>
                <span className="text-blue-600 font-extrabold text-base">
                  Rp{safeTotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* UPLOAD BUKTI PEMBAYARAN DI MODAL */}
            <div className="border-t border-gray-100 pt-4 text-left space-y-3 mb-6">
              <h4 className="font-bold text-gray-800 text-sm">Upload Bukti Pembayaran</h4>
              <p className="text-xs text-gray-400">Silakan unggah bukti transfer / screenshot Anda di sini.</p>
              
              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-blue-50 text-[#1c54ff] hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-bold transition">
                  Pilih File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePaymentProofChange}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-gray-500 font-medium truncate max-w-[200px]">
                  {paymentProofFile ? paymentProofFile.name : "Tidak ada file"}
                </span>
              </div>

              {paymentProofPreview && (
                <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-white">
                  <img src={paymentProofPreview} alt="Bukti Pembayaran Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemovePaymentProof}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md hover:bg-red-700"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>

            {/* Buttons in Indonesian */}
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowQrisModal(false);
                  handleRemovePaymentProof();
                }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold rounded-xl text-sm transition"
              >
                Batal
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  if (!paymentProofFile) {
                    alert("Harap unggah bukti pembayaran terlebih dahulu!");
                    return;
                  }
                  
                  try {
                    const dataPayload = new FormData();
                    dataPayload.append("payment_proof", paymentProofFile);
                    
                    await axiosInstance.post(`/orders/${order.id}/confirm-payment`, dataPayload, {
                      headers: { "Content-Type": "multipart/form-data" }
                    });
                    
                    // Reload order details
                    const response = await axiosInstance.get(`/orders/${order.id}`);
                    const data = response.data.data || response.data;
                    setOrder(data);
                    
                    alert("Bukti pembayaran berhasil diunggah! Menunggu konfirmasi admin.");
                    handleRemovePaymentProof();
                  } catch (err) {
                    console.error("Gagal mengonfirmasi pembayaran:", err);
                    alert(err.response?.data?.message || "Gagal mengonfirmasi pembayaran. Silakan coba lagi.");
                  }
                  setShowQrisModal(false);
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