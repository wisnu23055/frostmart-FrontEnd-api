import React, { useState, useEffect, useRef } from "react";
import { FiDownload, FiChevronLeft, FiChevronRight, FiLoader } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import { formatDateTime } from "../../utils/dateFormatter";

const statusMap = {
  completed: { label: "Selesai", bg: "bg-green-500", text: "text-white" },
  paid: { label: "Proses", bg: "bg-white border border-gray-300", text: "text-gray-700" },
  pending: { label: "Menunggu", bg: "bg-yellow-500", text: "text-white" },
  cancelled: { label: "Dibatalkan", bg: "bg-red-500", text: "text-white" },
};

const formatAddress = (addressStr) => {
  if (!addressStr) return "Alamat tidak tersedia";
  try {
    const parsed = JSON.parse(addressStr);
    if (Array.isArray(parsed)) {
      const primary = parsed.find((addr) => addr.primary) || parsed[0];
      return primary ? primary.address : "Alamat tidak tersedia";
    } else if (typeof parsed === "object" && parsed !== null) {
      return parsed.address || addressStr;
    }
  } catch (e) {
    // Return original string if JSON parsing fails
  }
  return addressStr;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExport(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const [ordersRes, txRes] = await Promise.all([
        axiosInstance.get("/orders"),
        axiosInstance.get("/transactions")
      ]);
      setOrders(ordersRes.data || []);
      setTransactions(txRes.data || []);
    } catch (error) {
      console.error("Gagal mengambil data pesanan & transaksi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const ensureTransactionPaid = async (orderId) => {
    const tx = transactions.find((t) => t.order_id === orderId);
    if (tx && tx.payment_status !== "paid") {
      await axiosInstance.patch(`/transactions/${tx.id}/status`, { payment_status: "paid" });
      setTransactions((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, payment_status: "paid" } : t))
      );
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const previousOrders = [...orders];
    const previousTransactions = [...transactions];

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setSelectedOrder((prev) =>
      prev && prev.id === orderId ? { ...prev, status: newStatus } : prev
    );

    try {
      const tx = transactions.find((t) => t.order_id === orderId);
      const payMethod = tx?.payment_method || "";
      const isCod = payMethod.toLowerCase() === "cash" || payMethod === "Bayar di Tempat (COD)";

      if (isCod) {
        if (newStatus === "completed") {
          await ensureTransactionPaid(orderId);
        }
      } else {
        if (["paid", "completed"].includes(newStatus)) {
          await ensureTransactionPaid(orderId);
        }
      }
      await axiosInstance.patch(`/orders/${orderId}/status`, { status: newStatus });
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      setOrders(previousOrders);
      setTransactions(previousTransactions);
      setSelectedOrder((prev) =>
        prev && prev.id === orderId ? { ...prev, status: prev.status } : prev
      );
      alert(`Gagal memperbarui status!\nAlasan: ${msg}`);
    }
  };

  const handleTransactionStatusChange = async (txId, newPaymentStatus) => {
    const previousTransactions = [...transactions];
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, payment_status: newPaymentStatus } : t))
    );

    try {
      await axiosInstance.patch(`/transactions/${txId}/status`, { payment_status: newPaymentStatus });
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      setTransactions(previousTransactions);
      alert(`Gagal memperbarui status transaksi!\nAlasan: ${msg}`);
    }
  };

  const handleQuickProcess = async (order, targetStatus) => {
    await handleStatusChange(order.id, targetStatus);
  };

  const getStatusBadge = (status) => {
    const s = statusMap[status?.toLowerCase()] || statusMap.pending;
    return (
      <span className={`px-4 py-1 rounded-full text-sm font-semibold inline-block ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  const handleExport = (format) => {
    setShowExport(false);

    if (format === "csv") {
      const header = "Pengguna,ID Pesanan,Produk,Tanggal,Status\n";
      const rows = orders
        .map((o) => {
          const product = o.items?.[0]?.product_name || "-";
          const date = formatDateTime(o.created_at);
          return `"${o.user_name || ""}","FM-${String(o.id).padStart(3, "0")}","${product}","${date}","${o.status}"`;
        })
        .join("\n");
      const blob = new Blob([header + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "orders.csv";
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "xlsx") {
      const header = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="Orders">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">Pengguna</Data></Cell>
        <Cell><Data ss:Type="String">ID Pesanan</Data></Cell>
        <Cell><Data ss:Type="String">Produk</Data></Cell>
        <Cell><Data ss:Type="String">Tanggal</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
      </Row>`;
      const rows = orders.map(o => {
        const product = o.items?.[0]?.product_name || "-";
        const date = formatDateTime(o.created_at);
        return `
      <Row>
        <Cell><Data ss:Type="String">${o.user_name || ""}</Data></Cell>
        <Cell><Data ss:Type="String">FM-${String(o.id).padStart(3, "0")}</Data></Cell>
        <Cell><Data ss:Type="String">${product}</Data></Cell>
        <Cell><Data ss:Type="String">${date}</Data></Cell>
        <Cell><Data ss:Type="String">${o.status}</Data></Cell>
      </Row>`;
      }).join("");
      const footer = `
    </Table>
  </Worksheet>
</Workbook>`;
      const blob = new Blob([header + rows + footer], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "orders.xls";
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Ekspor PDF - Pesanan</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
              h1 { color: #002d84; margin-bottom: 5px; font-size: 24px; }
              p { color: #666; font-size: 14px; margin-bottom: 25px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 13px; }
              th { background-color: #f8fafc; font-weight: bold; color: #475569; }
              tr:nth-child(even) { background-color: #f8fafc; }
            </style>
          </head>
          <body>
            <h1>Semua Pesanan</h1>
            <p>Daftar Pesanan FrostMart - Diekspor: ${new Date().toLocaleDateString("id-ID")}</p>
            <table>
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>ID Pesanan</th>
                  <th>Produk</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${orders.map(o => {
                  const product = o.items?.[0]?.product_name || "-";
                  const date = formatDateTime(o.created_at);
                  return `
                    <tr>
                      <td>${o.user_name || ""}</td>
                      <td>FM-${String(o.id).padStart(3, "0")}</td>
                      <td>${product}</td>
                      <td>${date}</td>
                      <td>${o.status}</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(orders.length / itemsPerPage));
  const paginatedOrders = orders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-5xl font-bold text-gray-800">Pesanan</h1>
          <p className="text-gray-500">Selamat datang kembali, Admin.</p>
        </div>
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            <FiDownload size={16} /> Ekspor
          </button>
          {showExport && (
            <div className="absolute right-0 mt-2 bg-[#0a1e5e] text-white rounded-lg shadow-xl z-50 overflow-hidden min-w-[140px]">
              <p className="px-4 py-2 font-semibold text-sm border-b border-blue-800">Ekspor Sebagai</p>
              <button onClick={() => handleExport("pdf")} className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-800 transition">.pdf</button>
              <button onClick={() => handleExport("csv")} className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-800 transition">.csv</button>
              <button onClick={() => handleExport("xlsx")} className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-800 transition">.xlsx</button>
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl p-8 shadow">
        <h2 className="text-2xl font-bold mb-6">Pesanan Terbaru</h2>

        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-4 font-semibold text-gray-700">Pengguna</th>
              <th className="pb-4 font-semibold text-gray-700">ID Pesanan</th>
              <th className="pb-4 font-semibold text-gray-700">Produk</th>
              <th className="pb-4 font-semibold text-gray-700">Tanggal</th>
              <th className="pb-4 font-semibold text-gray-700">Status</th>
              <th className="pb-4 font-semibold text-gray-700 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="py-10 text-center">
                  <div className="flex flex-col items-center text-gray-500">
                    <FiLoader className="animate-spin mb-2" size={24} />
                    <span className="text-sm">Memuat pesanan...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-20 text-center text-blue-800 font-bold text-xl">
                  Data Tidak Ditemukan
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-medium text-gray-800">
                    {order.user_name || `Pelanggan #${order.user_id}`}
                  </td>
                  <td className="py-4 text-gray-700">FM-{String(order.id).padStart(3, "0")}</td>
                  <td className="py-4 text-gray-700">{order.items?.[0]?.product_name || "-"}</td>
                  <td className="py-4 text-gray-700">
                    {formatDateTime(order.created_at)}
                  </td>
                  <td className="py-4">
                    {(() => {
                      const s = statusMap[order.status?.toLowerCase()] || statusMap.pending;
                      return (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer outline-none transition-all ${s.bg} ${s.text} text-center`}
                          style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", textAlign: "center", textAlignLast: "center" }}
                        >
                          <option value="pending" className="text-gray-800 bg-white font-medium">Menunggu</option>
                          <option value="paid" className="text-gray-800 bg-white font-medium">Proses</option>
                          <option value="completed" className="text-gray-800 bg-white font-medium">Selesai</option>
                          <option value="cancelled" className="text-gray-800 bg-white font-medium">Dibatalkan</option>
                        </select>
                      );
                    })()}
                  </td>
                  <td className="py-4 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-1.5 bg-blue-100 text-[#002d84] font-semibold rounded-full hover:bg-blue-200 transition text-sm"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 px-4 py-2 border border-gray-300 rounded-full disabled:opacity-50 bg-white"
        >
          <FiChevronLeft size={16} /> Sebelumnya
        </button>
        <span className="text-sm text-gray-500">Halaman {page} dari {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 px-4 py-2 border border-gray-300 rounded-full disabled:opacity-50 bg-white"
        >
          Selanjutnya <FiChevronRight size={16} />
        </button>
      </div>

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] border border-gray-100 transition-all duration-300 scale-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Detail Pesanan</h3>
                <p className="text-gray-500 text-sm mt-1">
                  ID Pesanan: FM-{String(selectedOrder.id).padStart(3, "0")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-light p-1 leading-none transition"
              >
                &times;
              </button>
            </div>

            {/* Customer Details */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Pelanggan</p>
                <p className="font-bold text-gray-800 text-base">{selectedOrder.user_name || "Pelanggan"}</p>
                <p className="text-gray-500 mt-0.5">{selectedOrder.user_email || "-"}</p>
                <p className="text-gray-500 mt-0.5">{selectedOrder.user_phone || "No. Telepon tidak tersedia"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Alamat Pengiriman</p>
                <p className="text-gray-700 leading-relaxed font-medium">
                  {formatAddress(selectedOrder.shipping_address || selectedOrder.user_address)}
                </p>
              </div>
            </div>

            {/* Products Table */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-800 mb-3 text-base">Item Pesanan</h4>
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-left text-gray-500 font-semibold">
                      <th className="p-4">Produk</th>
                      <th className="p-4 text-center">Jumlah</th>
                      <th className="p-4 text-right">Harga</th>
                      <th className="p-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 font-semibold text-gray-800">{item.product_name || item.productName || "Produk Frozen"}</td>
                        <td className="p-4 text-center text-gray-600 font-medium">{item.quantity}</td>
                        <td className="p-4 text-right text-gray-600 font-medium">Rp {Number(item.price).toLocaleString("id-ID")}</td>
                        <td className="p-4 text-right font-bold text-gray-800">
                          Rp {(Number(item.price) * item.quantity).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment & Transaction Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-bold text-gray-800 mb-3 text-base">Informasi Pembayaran</h4>
                <div className="space-y-3 text-sm bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm">
                  {(() => {
                    const tx = transactions.find((t) => t.order_id === selectedOrder.id);
                    return (
                      <>
                        <div className="flex justify-between items-center">
                           <span className="text-gray-500 font-semibold">Metode:</span>
                           <span className="font-bold text-gray-800 uppercase bg-blue-50 text-[#002d84] px-2.5 py-1 rounded-md text-xs">
                             {tx?.payment_method || "Transfer / COD"}
                           </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 font-semibold">Pembayaran:</span>
                          {tx ? (
                            <select
                              value={tx.payment_status}
                              onChange={(e) => handleTransactionStatusChange(tx.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-full font-bold text-xs border outline-none cursor-pointer ${
                                tx.payment_status === "paid"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : tx.payment_status === "failed"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : tx.payment_status === "refunded"
                                  ? "bg-purple-100 text-purple-700 border-purple-200"
                                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
                              }`}
                            >
                              <option value="pending">Menunggu</option>
                              <option value="paid">Lunas</option>
                              <option value="failed">Gagal</option>
                              <option value="refunded">Dikembalikan</option>
                            </select>
                          ) : (
                            <span className="font-semibold text-gray-500">-</span>
                          )}
                        </div>
                        {tx?.payment_proof_url && (
                          <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                            <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider block">Bukti Pembayaran:</span>
                            <a 
                              href={tx.payment_proof_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block group overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-blue-500 transition relative"
                            >
                              <img
                                src={tx.payment_proof_url}
                                alt="Bukti Pembayaran"
                                className="w-full max-h-48 object-contain mx-auto group-hover:scale-[1.02] transition duration-200"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition duration-200">
                                Klik untuk Memperbesar 🔍
                              </div>
                            </a>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Total and Order Status */}
              <div className="flex flex-col self-start w-full">
                <h4 className="font-bold text-gray-800 mb-3 text-base">Status & Ringkasan Transaksi</h4>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 shadow-sm space-y-5">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Transaksi</p>
                    <p className="text-3xl font-black text-[#002d84] tracking-tight">
                      Rp {Number(selectedOrder.total_price).toLocaleString("id-ID")}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200/60 flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-semibold">Status Pesanan:</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full font-bold text-xs border outline-none cursor-pointer transition-all duration-200 hover:scale-[1.03] ${
                        selectedOrder.status === "completed"
                          ? "bg-green-500 text-white border-green-600"
                          : selectedOrder.status === "paid"
                          ? "bg-[#002d84] text-white border-blue-900"
                          : selectedOrder.status === "cancelled"
                          ? "bg-red-500 text-white border-red-600"
                          : "bg-yellow-500 text-white border-yellow-600"
                      }`}
                    >
                      <option value="pending">Menunggu</option>
                      <option value="paid">Proses</option>
                      <option value="completed">Selesai</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full transition text-sm"
              >
                Tutup
              </button>
              
              {selectedOrder.status === "pending" && (
                <button
                  onClick={() => handleQuickProcess(selectedOrder, "paid")}
                  className="px-6 py-2.5 bg-[#002d84] text-white font-bold rounded-full hover:bg-blue-800 transition text-sm"
                >
                  Proses Orderan
                </button>
              )}
              {selectedOrder.status === "paid" && (
                <button
                  onClick={() => handleQuickProcess(selectedOrder, "completed")}
                  className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition text-sm"
                >
                  Selesaikan Pesanan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}