import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiSearch,
  FiShoppingCart,
} from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

import logo from "../assets/images/logo_frostmart.png";

function AdminNavbar({ searchQuery, setSearchQuery }) {
  const location = useLocation();
  const hideSearch = ["/admin", "/admin/", "/admin/analytics", "/admin/analytics/"].includes(location.pathname);

  useEffect(() => {
    if (setSearchQuery) {
      setSearchQuery("");
    }
  }, [location.pathname]);

  return (
    <div className="bg-white px-8 py-4 flex items-center justify-between shadow-sm border-b">

      {/* LEFT */}
      <div className="flex items-center gap-3">

        <img
          src={logo}
          alt="logo"
          className="w-10 h-10"
        />

        <h1 className="text-2xl font-bold text-blue-700">
          FrostMart
        </h1>

      </div>

      {/* SEARCH */}
      {!hideSearch && (
        <div className="w-[400px] relative">

          <input
            type="text"
            placeholder="Cari..."
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            className="w-full border rounded-full px-5 py-2 outline-none"
          />

          <FiSearch className="absolute right-4 top-3 text-gray-500" />

        </div>
      )}

      {/* ICON */}
      <div className="flex items-center gap-6 text-2xl text-gray-600">
        <Link to="/menu" title="Produk Web" className="hover:text-blue-700 transition-colors">
          <FiShoppingCart />
        </Link>
        <Link to="/profile" title="Menu Profil" className="hover:text-blue-700 transition-colors">
          <FaUserCircle />
        </Link>
      </div>

    </div>
  );
}

export default AdminNavbar;