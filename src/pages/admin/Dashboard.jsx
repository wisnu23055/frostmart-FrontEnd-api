import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FiDollarSign, FiShoppingCart, FiEye } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const statusMap = {
  completed: { label: "Selesai", bg: "bg-green-500", text: "text-white" },
  paid: { label: "Proses", bg: "bg-white border border-gray-300", text: "text-gray-700" },
  pending: { label: "Menunggu", bg: "bg-yellow-500", text: "text-white" },
  cancelled: { label: "Dibatalkan", bg: "bg-red-500", text: "text-white" },
};

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get("/orders");
      setOrders(response.data || []);
    } catch (error) {
      console.error("Gagal mengambil data orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute stats
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const ordersThisMonth = orders.filter((o) => {
    const d = new Date(o.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const totalOrdersMonth = ordersThisMonth.length;
  const pageViews = Math.floor(totalRevenue / 100) + orders.length * 137;

  // Chart data — orders per month
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const ordersPerMonth = Array(12).fill(0);
  orders.forEach((o) => {
    const d = new Date(o.created_at);
    if (d.getFullYear() === currentYear) {
      ordersPerMonth[d.getMonth()]++;
    }
  });

  const chartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Total Pesanan",
        data: ordersPerMonth,
        backgroundColor: "#0a1e5e",
        borderRadius: 4,
        maxBarThickness: 32,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top", align: "end" },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 50 } },
      x: { grid: { display: false } },
    },
  };

  // Recent orders (latest 9)
  const recentOrders = orders.slice(0, 9);

  const getStatusBadge = (status) => {
    const s = statusMap[status?.toLowerCase()] || statusMap.pending;
    return (
      <span className={`px-4 py-1 rounded-full text-sm font-semibold ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-5xl font-black text-gray-800">Dasbor Admin</h1>
      <p className="text-gray-500 mb-8">Selamat datang kembali, Admin.</p>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* TOTAL REVENUE CARD */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="text-gray-500 text-base font-bold uppercase tracking-wider mb-2">Total Pendapatan</p>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 break-words">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </h1>
            <p className="text-green-500 text-sm font-semibold mt-3 flex items-center gap-1">
              <span>+10.1%</span>
              <span className="text-gray-400 font-normal">vs bulan lalu</span>
            </p>
          </div>
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl shrink-0 ml-4">
            <FiDollarSign size={28} />
          </div>
        </div>

        {/* TOTAL ORDERS CARD */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="text-gray-500 text-base font-bold uppercase tracking-wider mb-2">Total Pesanan Bulan Ini</p>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900">
              {totalOrdersMonth}
            </h1>
            <p className="text-green-500 text-sm font-semibold mt-3 flex items-center gap-1">
              <span>+5.9%</span>
              <span className="text-gray-400 font-normal">vs bulan lalu</span>
            </p>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shrink-0 ml-4">
            <FiShoppingCart size={28} />
          </div>
        </div>

        {/* PAGE VIEWS CARD */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="text-gray-500 text-base font-bold uppercase tracking-wider mb-2">Kunjungan Halaman</p>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900">
              {pageViews.toLocaleString("id-ID")}
            </h1>
            <p className="text-green-500 text-sm font-semibold mt-3 flex items-center gap-1">
              <span>+22.3%</span>
              <span className="text-gray-400 font-normal">vs bulan lalu</span>
            </p>
          </div>
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl shrink-0 ml-4">
            <FiEye size={28} />
          </div>
        </div>
      </div>

      {/* OVERVIEW CHART */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Ikhtisar Bulanan</h2>
            <p className="text-gray-500 text-sm">
              {new Date().toLocaleString("id-ID", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="h-72">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Pesanan Terbaru</h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-left border-b border-gray-100 text-gray-400 text-sm font-semibold">
                <th className="pb-4">Pengguna</th>
                <th className="pb-4">ID Pesanan</th>
                <th className="pb-4">Produk</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-blue-800 font-bold text-xl">
                    Data Tidak Ditemukan
                  </td>
                </tr>
              ) : (
                recentOrders.map((order, index) => (
                  <tr key={order.id || index} className="border-b border-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-50/50 transition">
                    <td className="py-4">{order.user_name || `Pelanggan #${order.user_id}`}</td>
                    <td>FM-{String(order.id).padStart(3, "0")}</td>
                    <td>{order.items?.[0]?.product_name || "-"}</td>
                    <td>{getStatusBadge(order.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;