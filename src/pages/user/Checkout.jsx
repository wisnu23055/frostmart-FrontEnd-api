import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCart, removeFromCart } from "../../store/slices/cartSlice";
import axiosInstance from "../../api/axiosInstance";
import { FiLoader } from "react-icons/fi";

const COURIERS = [
  { id: 1, name: "GoSend Instan", eta: "30-35 Menit", price: 15000 },
  { id: 2, name: "Grab Instan", eta: "30-35 Menit", price: 14000 },
  { id: 3, name: "AntarAja Same Day", eta: "3-5 Jam", price: 8000 },
];

const PAYMENTS = [
  {
    id: 1,
    name: "Bayar di Tempat (COD)",
    desc: "Bayar saat pesanan telah tiba",
  },
  { id: 2, name: "Transfer Bank", desc: "BCA, Mandiri, BNI, BRI (Menggunakan Scan QRIS)" },
  { id: 3, name: "E-Wallet", desc: "GoPay, OVO, Dana, ShopeePay (Menggunakan Scan QRIS)" },
];

const STORE_NAME = "AIDA FROZEN";

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
  const checkedIds = location.state?.checkedIds || null;
  const allCartItems = useSelector((state) => state.cart.items);
  const cartItems = checkedIds 
    ? allCartItems.filter(item => checkedIds.includes(item.id))
    : allCartItems;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const [selectedCourier, setSelectedCourier] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [qrisStoreData, setQrisStoreData] = useState(null);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [pendingOrderInfo, setPendingOrderInfo] = useState(null);

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
    const fetchAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        const response = await axiosInstance.get("/addresses/me");
        const data = response.data.data || response.data || [];
        setAddresses(data);
        if (data.length > 0) {
          const primary = data.find((a) => a.is_primary);
          setSelectedAddress(primary ? primary.id : data[0].id);
        }
      } catch (err) {
        console.error("Gagal menarik alamat:", err);
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, []);

  const subtotal = cartItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const selectedCourierData = COURIERS.find((c) => c.id === selectedCourier);
  const ongkosKirim = selectedCourierData?.price || 0;
  const total = subtotal + ongkosKirim;

  const currentAddressObj = addresses.find((a) => a.id === selectedAddress);
  const formattedShippingAddress = currentAddressObj 
    ? `${currentAddressObj.full_address}, ${currentAddressObj.city_district}, ${currentAddressObj.postal_code} (Penerima: ${currentAddressObj.recipient_name})`
    : "";

  const handleBuatPesanan = async () => {
    if (cartItems.length === 0) {
      alert("Keranjang kosong!");
      return;
    }

    if (addresses.length === 0 || !selectedAddress) {
      alert("Silakan tambahkan alamat pengiriman terlebih dahulu di menu Profil!");
      return;
    }

    setIsLoading(true);

    try {
      const orderPayload = {
        items: cartItems.map(item => {
          let pureId = item.id;
          if (typeof pureId === 'object' && pureId !== null) pureId = pureId.id || pureId._id;
          if (!pureId) pureId = item._id;

          return {
            product_id: pureId,
            quantity: item.qty,
            price: item.price
          };
        }),
        shippingAddress: formattedShippingAddress,
        courier: selectedCourierData?.name,
        paymentMethod: PAYMENTS.find(p => p.id === selectedPayment)?.name,
        payment_method: PAYMENTS.find(p => p.id === selectedPayment)?.name,
        subtotal: subtotal,
        shippingFee: ongkosKirim,
        totalAmount: total,
      };

      const response = await axiosInstance.post('/orders/checkout', orderPayload);
      
      if (checkedIds && checkedIds.length > 0) {
        checkedIds.forEach(id => {
          dispatch(removeFromCart(id));
        });
      } else {
        dispatch(clearCart());
      }
      
      const orderId = response.data?.order?.id || response.data?.data?.order?.id || response.data?.data?.id || response.data?.id || Date.now().toString().slice(-6);
      const shortOrderNum = `FM-${orderId.toString().slice(-6).toUpperCase()}`;
      const methodText = PAYMENTS.find(p => p.id === selectedPayment)?.name || "Transfer Bank";

      if (selectedPayment === 2 || selectedPayment === 3) {
        setPendingOrderInfo({
          id: orderId,
          orderNumber: shortOrderNum,
          paymentMethod: methodText,
          totalAmount: total,
        });
        setShowQrisModal(true);
      } else {
        navigate("/payment-success", {
          state: {
            orderNumber: shortOrderNum,
            paymentMethod: methodText,
            totalAmount: total,
          }
        });
      }
      
    } catch (error) {
      console.error("Gagal membuat pesanan:", error);
      alert(error.response?.data?.message || "Terjadi kesalahan saat memproses pesanan. Pastikan server nyala.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 w-full flex flex-col gap-5">
            {/* ALAMAT PENGIRIMAN */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-700">Alamat Pengiriman</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {isLoadingAddresses ? (
                  <div className="p-8 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                    <FiLoader className="animate-spin text-blue-600" size={20} />
                    <span>Memuat alamat...</span>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 text-sm mb-3">Belum ada alamat pengiriman terdaftar.</p>
                    <Link
                      to="/profile/address"
                      className="inline-block bg-blue-50 text-[#1c54ff] hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                    >
                      + Tambah Alamat di Profil
                    </Link>
                  </div>
                ) : (
                  addresses.map((addr) => {
                    const fullAddrText = `${addr.full_address}, ${addr.city_district}, ${addr.postal_code}`;
                    const labelText = addr.address_type ? addr.address_type.charAt(0).toUpperCase() + addr.address_type.slice(1) : "Alamat";
                    return (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition ${
                          selectedAddress === addr.id ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress === addr.id}
                          onChange={() => setSelectedAddress(addr.id)}
                          className="accent-[#1c54ff] mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-sm">{labelText}</span>
                            {addr.is_primary && (
                              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                Utama
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 font-medium">Penerima: {addr.recipient_name}</p>
                          <p className="text-sm text-gray-500 mt-1">{fullAddrText}</p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* KURIR PENGIRIMAN */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-700">Kurir Pengiriman</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {COURIERS.map((courier) => (
                  <label
                    key={courier.id}
                    className={`flex items-center justify-between px-5 py-4 cursor-pointer transition ${
                      selectedCourier === courier.id ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="courier"
                        checked={selectedCourier === courier.id}
                        onChange={() => setSelectedCourier(courier.id)}
                        className="accent-[#1c54ff]"
                      />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{courier.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{courier.eta}</p>
                      </div>
                    </div>
                    <p className="text-blue-600 font-semibold text-sm">
                      Rp{courier.price.toLocaleString("id-ID")}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            {/* METODE PEMBAYARAN */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-700">Metode Pembayaran</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {PAYMENTS.map((payment) => (
                  <label
                    key={payment.id}
                    className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition ${
                      selectedPayment === payment.id ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === payment.id}
                      onChange={() => setSelectedPayment(payment.id)}
                      className="accent-[#1c54ff] mt-1"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{payment.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {payment.id === 1 ? payment.desc :
                         payment.id === 2 ? (qrisStoreData ? `${qrisStoreData.bank_name || 'BCA'} - A/N ${qrisStoreData.bank_account_name || 'AIDA FROZEN'} (${qrisStoreData.bank_account_number || '123-456-7890'}) (Menggunakan Scan QRIS)` : payment.desc) :
                         payment.id === 3 ? (qrisStoreData ? `${qrisStoreData.ewallet_name || 'GoPay/OVO/Dana'} - A/N ${qrisStoreData.ewallet_owner_name || 'AIDA FROZEN'} (Menggunakan Scan QRIS)` : payment.desc) :
                         payment.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-5 lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="font-bold text-gray-800 text-sm">{STORE_NAME}</p>
              </div>
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-6">Keranjang kosong</p>
                ) : (
                  cartItems.map((item, index) => (
                    // Tambahkan index sebagai fallback key agar tidak error jika id bentrok/kosong
                    <div key={item.id || index} className="flex items-center gap-3 px-5 py-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        <img
                          src={item.image || "https://placehold.co/48x48/e2e8f0/94a3b8?text=Img"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.qty} PCS</p>
                        <p className="text-blue-600 font-bold text-sm mt-0.5">
                          Rp{item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 text-base mb-4">Ringkasan Pesanan</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rp{subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Ongkos Kirim</span>
                  <span>Rp{ongkosKirim.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                <span className="font-semibold text-gray-700 text-sm">Total Pembayaran</span>
                <span className="text-blue-600 font-bold text-base">
                  Rp{total.toLocaleString("id-ID")}
                </span>
              </div>

              <button
                onClick={handleBuatPesanan}
                disabled={isLoading}
                className={`mt-5 w-full font-semibold py-3 rounded-xl text-sm transition text-white shadow-sm
                  ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#1c54ff] hover:bg-blue-800'}
                `}
              >
                {isLoading ? 'Memproses...' : 'Buat Pesanan'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QRIS PAYMENT MODAL */}
      {showQrisModal && pendingOrderInfo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center select-none border border-gray-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-800 mb-1">Pembayaran QRIS</h3>
            <p className="text-sm text-gray-400 mb-5">Order ID: {pendingOrderInfo.orderNumber}</p>

            {/* QRIS Code Image */}
            <div className="w-60 h-60 mx-auto bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-center shadow-inner mb-5">
              <img
                src={
                  (selectedPayment === 2
                    ? (qrisStoreData?.bank_qris_url || qrisStoreData?.ewallet_qris_url)
                    : (qrisStoreData?.ewallet_qris_url || qrisStoreData?.bank_qris_url)) ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=FrostMart-Order-${pendingOrderInfo.orderNumber}`
                }
                alt="QRIS Code"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=FrostMart-Order-${pendingOrderInfo.orderNumber}`;
                }}
              />
            </div>

            {/* Payment Info Details */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm text-left border border-gray-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400 font-semibold">Metode:</span>
                <span className="font-bold text-gray-800">{pendingOrderInfo.paymentMethod}</span>
              </div>
              
              {selectedPayment === 2 ? (
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
                  Rp{pendingOrderInfo.totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Buttons in Indonesian */}
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowQrisModal(false);
                  alert("Pesanan Anda disimpan. Silakan lakukan pembayaran di menu Pesanan Saya nanti.");
                  navigate("/profile/orders");
                }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold rounded-xl text-sm transition"
              >
                Batal
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  try {
                    if (pendingOrderInfo.id) {
                      await axiosInstance.post(`/orders/${pendingOrderInfo.id}/confirm-payment`);
                    }
                  } catch (err) {
                    console.error("Gagal mengonfirmasi pembayaran:", err);
                  }
                  setShowQrisModal(false);
                  navigate("/payment-success", { state: pendingOrderInfo });
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