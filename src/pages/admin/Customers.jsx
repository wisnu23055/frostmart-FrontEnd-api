import React, { useState, useEffect, useRef } from "react";
import { FiDownload, FiChevronLeft, FiChevronRight, FiLoader } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import { formatDateOnly } from "../../utils/dateFormatter";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef(null);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/users?page=${page}&limit=10`);
      const result = response.data;
      setCustomers(result.data || result || []);
      setTotalPages(result.total_pages || 1);
    } catch (error) {
      console.error("Gagal mengambil data customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExport(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = (format) => {
    setShowExport(false);

    if (format === "csv") {
      const header = "User,Status,Joined,Total Orders\n";
      const rows = customers
        .map((c) => {
          const joined = formatDateOnly(c.created_at);
          const status = (c.total_orders || 0) > 0 ? "Active" : "Inactive";
          return `"${c.name}","${status}","${joined}",${c.total_orders || 0}`;
        })
        .join("\n");
      const blob = new Blob([header + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "customers.csv";
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
  <Worksheet ss:Name="Customers">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">User</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
        <Cell><Data ss:Type="String">Joined</Data></Cell>
        <Cell><Data ss:Type="String">Total Orders</Data></Cell>
      </Row>`;
      const rows = customers.map(c => `
      <Row>
        <Cell><Data ss:Type="String">${c.name}</Data></Cell>
        <Cell><Data ss:Type="String">${(c.total_orders || 0) > 0 ? "Active" : "Inactive"}</Data></Cell>
        <Cell><Data ss:Type="String">${formatDateOnly(c.created_at)}</Data></Cell>
        <Cell><Data ss:Type="Number">${c.total_orders || 0}</Data></Cell>
      </Row>`).join("");
      const footer = `
    </Table>
  </Worksheet>
</Workbook>`;
      const blob = new Blob([header + rows + footer], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "customers.xls";
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Export PDF - Customers</title>
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
            <h1>All Customers</h1>
            <p>FrostMart Customers List - Exported: ${new Date().toLocaleDateString("id-ID")}</p>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Total Orders</th>
                </tr>
              </thead>
              <tbody>
                ${customers.map(c => `
                  <tr>
                    <td>${c.name}</td>
                    <td>${(c.total_orders || 0) > 0 ? "Active" : "Inactive"}</td>
                    <td>${formatDateOnly(c.created_at)}</td>
                    <td>${c.total_orders || 0}</td>
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
          <h1 className="text-5xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-500">Welcome back, Admin.</p>
        </div>
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            <FiDownload size={16} /> Export
          </button>
          {showExport && (
            <div className="absolute right-0 mt-2 bg-[#0a1e5e] text-white rounded-lg shadow-xl z-50 overflow-hidden min-w-[140px]">
              <p className="px-4 py-2 font-semibold text-sm border-b border-blue-800">Export As</p>
              <button onClick={() => handleExport("pdf")} className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-800 transition">.pdf</button>
              <button onClick={() => handleExport("csv")} className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-800 transition">.csv</button>
              <button onClick={() => handleExport("xlsx")} className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-800 transition">.xlsx</button>
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl p-8 shadow">
        <h2 className="text-2xl font-bold mb-6">All Customers</h2>

        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-4 font-semibold text-gray-700">User</th>
              <th className="pb-4 font-semibold text-gray-700">Status</th>
              <th className="pb-4 font-semibold text-gray-700">Joined</th>
              <th className="pb-4 font-semibold text-gray-700">Total Orders</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="py-10 text-center">
                  <div className="flex flex-col items-center text-gray-500">
                    <FiLoader className="animate-spin mb-2" size={24} />
                    <span className="text-sm">Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-20 text-center text-blue-800 font-bold text-xl">
                  Data Not Found
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                const isActive = (customer.total_orders || 0) > 0;
                return (
                  <tr key={customer.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-medium text-gray-800">{customer.name}</td>
                    <td className="py-4">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-bold inline-block w-28 text-center ${
                          isActive
                            ? "bg-green-500 text-white"
                            : "bg-white text-gray-600 border border-gray-300"
                        }`}
                        style={{ textAlign: "center" }}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 text-gray-700">
                      {formatDateOnly(customer.created_at)}
                    </td>
                    <td className="py-4 font-medium text-gray-800 text-center">
                      {customer.total_orders || 0}
                    </td>
                  </tr>
                );
              })
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
          <FiChevronLeft size={16} /> Previous
        </button>
        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 px-4 py-2 border border-gray-300 rounded-full disabled:opacity-50 bg-white"
        >
          Next <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}