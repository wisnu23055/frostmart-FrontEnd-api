import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FiDownload, FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2 } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";

export default function Products() {
  const navigate = useNavigate();
  const { searchQuery } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/products?page=${page}&limit=10&search=${searchQuery || ""}`);
      const result = response.data;
      setProducts(result.data || result || []);
      setTotalPages(result.total_pages || 1);
    } catch (error) {
      console.error("Gagal mengambil data produk:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery]);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExport(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/products/${deleteModal.product.id}`);
      setDeleteModal({ open: false, product: null });
      fetchProducts();
    } catch (error) {
      alert("Gagal menghapus produk");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = (format) => {
    setShowExport(false);

    if (format === "csv") {
      const header = "Produk,Harga,Stok,Kategori\n";
      const rows = products.map((p) => `"${p.name}",${p.price},${p.stock},"${p.category || ""}"`).join("\n");
      const blob = new Blob([header + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products.csv";
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
  <Worksheet ss:Name="Products">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">Produk</Data></Cell>
        <Cell><Data ss:Type="String">Harga</Data></Cell>
        <Cell><Data ss:Type="String">Stok</Data></Cell>
        <Cell><Data ss:Type="String">Kategori</Data></Cell>
      </Row>`;
      const rows = products.map(p => `
      <Row>
        <Cell><Data ss:Type="String">${p.name}</Data></Cell>
        <Cell><Data ss:Type="Number">${p.price}</Data></Cell>
        <Cell><Data ss:Type="Number">${p.stock}</Data></Cell>
        <Cell><Data ss:Type="String">${p.category || ""}</Data></Cell>
      </Row>`).join("");
      const footer = `
    </Table>
  </Worksheet>
</Workbook>`;
      const blob = new Blob([header + rows + footer], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products.xls";
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Ekspor PDF - Produk</title>
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
            <h1>Semua Produk</h1>
            <p>Daftar Produk FrostMart - Diekspor: ${new Date().toLocaleDateString("id-ID")}</p>
            <table>
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Harga</th>
                  <th>Stok</th>
                  <th>Kategori</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(p => `
                  <tr>
                    <td>${p.name}</td>
                    <td>Rp ${Number(p.price).toLocaleString("id-ID")}</td>
                    <td>${p.stock}</td>
                    <td>${p.category || "Tanpa Kategori"}</td>
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

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-5xl font-bold text-gray-800">Produk</h1>
          <p className="text-gray-500">Selamat datang kembali, Admin.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/products/add")}
            className="bg-white border border-gray-300 text-gray-800 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            Tambah Produk Baru
          </button>
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
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl p-8 shadow">
        <h2 className="text-2xl font-bold mb-6">Semua Stok</h2>

        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-4 font-semibold text-gray-700">Produk</th>
              <th className="pb-4 font-semibold text-gray-700">Harga</th>
              <th className="pb-4 font-semibold text-gray-700">Stok</th>
              <th className="pb-4 font-semibold text-gray-700">Kategori</th>
              <th className="pb-4 font-semibold text-gray-700 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-gray-500">Memuat data...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-20 text-center text-blue-800 font-bold text-xl">
                  Data Tidak Ditemukan
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-medium text-gray-800">
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.image?.url || "https://placehold.co/40x40/e2e8f0/94a3b8?text=No+Img"} 
                        alt={product.name} 
                        className="w-10 h-10 object-cover rounded-lg bg-gray-100 border border-gray-200"
                        onError={(e) => { e.target.src = "https://placehold.co/40x40/e2e8f0/94a3b8?text=No+Img"; }}
                      />
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-gray-700">Rp {Number(product.price).toLocaleString("id-ID")}</td>
                  <td className="py-4 text-gray-700">{product.stock}</td>
                  <td className="py-4 text-gray-700">{product.category || "Tanpa Kategori"}</td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition bg-blue-100"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, product })}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition bg-red-100"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
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

      {/* DELETE MODAL */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Hapus Produk?</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Apakah Anda yakin ingin menghapus '{deleteModal.product?.name}'?
              Tindakan ini akan menghapus data produk secara permanen dari stok.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, product: null })}
                className="px-6 py-2.5 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-2.5 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}