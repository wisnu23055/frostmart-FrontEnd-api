import React, { useState, useEffect, useRef } from "react";
import { FiDownload, FiChevronLeft, FiChevronRight, FiLoader } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";

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

export default function Invoice() {
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
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

  const fetchData = async () => {
    try {
      const [transRes, ordersRes] = await Promise.all([
        axiosInstance.get("/transactions"),
        axiosInstance.get("/orders"),
      ]);
      setTransactions(transRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Build invoice data by combining orders + transactions
  const invoiceData = orders.map((order) => {
    const transaction = transactions.find((t) => t.order_id === order.id);
    const date = new Date(order.created_at);
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    const invoiceNumber = `Inv-${dateStr}${String(order.id).padStart(3, "0")}`;

    return {
      id: order.id,
      user: order.user_name || `Pelanggan #${order.user_id}`,
      orderCode: `FM-${String(order.id).padStart(3, "0")}`,
      status: order.status,
      invoiceNumber,
      paymentStatus: transaction?.payment_status || "pending",
      createdAt: order.created_at,
    };
  });

  const getStatusBadge = (status) => {
    const s = statusMap[status?.toLowerCase()] || statusMap.pending;
    return (
      <span className={`px-4 py-1.5 rounded-full text-xs font-bold inline-block w-28 text-center ${s.bg} ${s.text}`} style={{ textAlign: "center" }}>
        {s.label}
      </span>
    );
  };

  const handleExport = (format) => {
    setShowExport(false);

    if (format === "csv") {
      const header = "Pengguna,Pesanan,Status,Faktur,Status Pembayaran\n";
      const rows = invoiceData
        .map((inv) => `"${inv.user}","${inv.orderCode}","${inv.status}","${inv.invoiceNumber}","${inv.paymentStatus}"`)
        .join("\n");
      const blob = new Blob([header + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "invoices.csv";
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
  <Worksheet ss:Name="Invoices">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">Pengguna</Data></Cell>
        <Cell><Data ss:Type="String">Pesanan</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
        <Cell><Data ss:Type="String">Faktur</Data></Cell>
        <Cell><Data ss:Type="String">Status Pembayaran</Data></Cell>
      </Row>`;
      const rows = invoiceData.map(inv => `
      <Row>
        <Cell><Data ss:Type="String">${inv.user}</Data></Cell>
        <Cell><Data ss:Type="String">${inv.orderCode}</Data></Cell>
        <Cell><Data ss:Type="String">${inv.status}</Data></Cell>
        <Cell><Data ss:Type="String">${inv.invoiceNumber}</Data></Cell>
        <Cell><Data ss:Type="String">${inv.paymentStatus}</Data></Cell>
      </Row>`).join("");
      const footer = `
    </Table>
  </Worksheet>
</Workbook>`;
      const blob = new Blob([header + rows + footer], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "invoices.xls";
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Ekspor PDF - Faktur</title>
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
            <h1>Semua Faktur</h1>
            <p>Daftar Faktur FrostMart - Diekspor: ${new Date().toLocaleDateString("id-ID")}</p>
            <table>
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Pesanan</th>
                  <th>Status</th>
                  <th>Faktur</th>
                  <th>Status Pembayaran</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceData.map(inv => `
                  <tr>
                    <td>${inv.user}</td>
                    <td>${inv.orderCode}</td>
                    <td>${inv.status}</td>
                    <td>${inv.invoiceNumber}</td>
                    <td>${inv.paymentStatus}</td>
                  </tr>
                `).join("")}
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
  const totalPages = Math.max(1, Math.ceil(invoiceData.length / itemsPerPage));
  const paginatedData = invoiceData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-5xl font-bold text-gray-800">Faktur</h1>
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
        <h2 className="text-2xl font-bold mb-6">Semua Faktur</h2>

        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-4 font-semibold text-gray-700">Pengguna</th>
              <th className="pb-4 font-semibold text-gray-700">Pesanan</th>
              <th className="pb-4 font-semibold text-gray-700">Status</th>
              <th className="pb-4 font-semibold text-gray-700">Faktur</th>
              <th className="pb-4 font-semibold text-gray-700">Detail</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="py-10 text-center">
                  <div className="flex flex-col items-center text-gray-500">
                    <FiLoader className="animate-spin mb-2" size={24} />
                    <span className="text-sm">Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-20 text-center text-blue-800 font-bold text-xl">
                  Data Tidak Ditemukan
                </td>
              </tr>
            ) : (
              paginatedData.map((inv) => (
                <tr key={inv.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-medium text-gray-800">{inv.user}</td>
                  <td className="py-4 text-gray-700">{inv.orderCode}</td>
                  <td className="py-4">{getStatusBadge(inv.status)}</td>
                  <td className="py-4 text-gray-700">{inv.invoiceNumber}</td>
                  <td className="py-4">
                    <button
                      onClick={() => {
                        const orderObj = orders.find((o) => o.id === inv.id);
                        setSelectedInvoice(orderObj);
                      }}
                      className="text-gray-500 hover:text-blue-600 text-sm font-medium transition"
                    >
                      Lihat Detail
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

      {/* INVOICE DETAIL MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:p-0">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] border border-gray-100 print:shadow-none print:border-none print:max-h-full print:p-0 animate-in fade-in zoom-in duration-200" id="printable-invoice">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6 print:pb-4 print:mb-4">
              <div>
                <h3 className="text-3xl font-extrabold text-[#002d84] tracking-tight">FAKTUR PENJUALAN</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Invoice No: {(() => {
                    const date = new Date(selectedInvoice.created_at);
                    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
                    return `Inv-${dateStr}${String(selectedInvoice.id).padStart(3, "0")}`;
                  })()}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Tanggal Transaksi: {new Date(selectedInvoice.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })} WIB
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-light p-1 leading-none transition print:hidden"
              >
                &times;
              </button>
            </div>

            {/* Customer & Transaction Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Pelanggan</p>
                <p className="font-bold text-gray-800 text-base">{selectedInvoice.user_name || "Pelanggan"}</p>
                <p className="text-gray-500 text-sm mt-0.5">{selectedInvoice.user_email || "-"}</p>
                <p className="text-gray-500 text-sm mt-0.5">{selectedInvoice.user_phone || "No. Telepon tidak tersedia"}</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-4 mb-2">Alamat Pengiriman</p>
                <p className="text-gray-700 text-sm leading-relaxed font-medium">
                  {formatAddress(selectedInvoice.shipping_address || selectedInvoice.user_address)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-sm h-fit shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Rincian Pembayaran</p>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-semibold">Metode Pembayaran:</span>
                    <span className="font-bold text-gray-800 uppercase bg-blue-50 text-[#002d84] px-2.5 py-1 rounded-md text-xs">
                      {selectedInvoice.payment_method || "Transfer / COD"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-semibold">Status Bayar:</span>
                    <span className={`font-extrabold uppercase text-xs px-2.5 py-1 rounded-md ${
                      selectedInvoice.payment_status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {selectedInvoice.payment_status === "paid" ? "Lunas" : "Menunggu"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-semibold">Status Pesanan:</span>
                    <span className="font-bold text-gray-800 uppercase text-xs">
                      {statusMap[selectedInvoice.status?.toLowerCase()]?.label || selectedInvoice.status}
                    </span>
                  </div>
                  {(() => {
                    const tx = transactions.find((t) => t.order_id === selectedInvoice.id);
                    const proofUrl = selectedInvoice.payment_proof_url || tx?.payment_proof_url;
                    if (proofUrl) {
                      return (
                        <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                          <span className="text-gray-500 font-bold text-xs uppercase tracking-wider block">Bukti Pembayaran:</span>
                          <a 
                            href={proofUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block group overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-blue-500 transition relative"
                          >
                            <img
                              src={proofUrl}
                              alt="Bukti Pembayaran"
                              className="w-full max-h-32 object-contain mx-auto group-hover:scale-[1.02] transition duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition duration-200 print:hidden">
                              Buka Gambar 🔍
                            </div>
                          </a>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>

            {/* Product items table */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-800 mb-3 text-base">Daftar Produk</h4>
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-left text-gray-500 font-semibold">
                      <th className="p-4">Produk</th>
                      <th className="p-4 text-center">Qty</th>
                      <th className="p-4 text-right">Harga</th>
                      <th className="p-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedInvoice.items?.map((item, idx) => (
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

            {/* Total */}
            <div className="flex justify-between items-center bg-[#002d84]/5 border border-[#002d84]/10 rounded-2xl p-5 mb-8 shadow-sm print:bg-gray-100">
              <span className="font-bold text-gray-700 text-base">Total Tagihan</span>
              <span className="text-2xl font-extrabold text-[#002d84]">
                Rp {Number(selectedInvoice.total_price).toLocaleString("id-ID")}
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 print:hidden">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full transition text-sm"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-[#002d84] text-white font-bold rounded-full hover:bg-blue-800 transition text-sm flex items-center gap-2"
              >
                Cetak Invoice
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CSS Print Styles */}
      <style>{`
        @media print {
          body > div:first-child {
            visibility: hidden !important;
          }
          #printable-invoice {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 9999 !important;
            background: white !important;
            visibility: visible !important;
          }
          #printable-invoice * {
            visibility: visible !important;
          }
        }
      `}</style>
    </div>
  );
}