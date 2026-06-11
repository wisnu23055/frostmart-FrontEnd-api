import { NavLink } from "react-router-dom";

function AdminSidebar() {
  const linkClass = ({ isActive }) =>
    isActive
      ? "bg-white text-[#002d84] font-bold rounded-r-full pl-6 py-2.5 block transition-all duration-200"
      : "text-white hover:text-white hover:bg-white/10 pl-6 py-2.5 block rounded-r-full transition-all duration-200 font-semibold";

  return (
    <div className="w-56 bg-[#002d84] text-white min-h-screen pt-8 pr-4 flex-shrink-0 transition-all select-none">

      <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3 pl-6">
        Ringkasan
      </p>

      <div className="flex flex-col gap-1.5 mb-8">
        <NavLink to="/admin" end className={linkClass}>
          Dasbor
        </NavLink>
        <NavLink to="/admin/analytics" className={linkClass}>
          Analisis
        </NavLink>
      </div>

      <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3 pl-6">
        Penjualan
      </p>

      <div className="flex flex-col gap-1.5">
        <NavLink to="/admin/orders" className={linkClass}>
          Pesanan
        </NavLink>
        <NavLink to="/admin/products" className={linkClass}>
          Produk
        </NavLink>
        <NavLink to="/admin/customers" className={linkClass}>
          Pelanggan
        </NavLink>
        <NavLink to="/admin/invoice" className={linkClass}>
          Faktur
        </NavLink>
      </div>

    </div>
  );
}

export default AdminSidebar;