import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiShoppingBag,
  FiSettings,
  FiMapPin,
  FiLogOut,
  FiBriefcase,
} from "react-icons/fi";

function ProfileSidebar() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuClass = ({ isActive }) =>
    isActive
      ? "flex items-center gap-3 bg-blue-700 text-white px-4 py-3 rounded-xl font-medium"
      : "flex items-center gap-3 bg-gray-100 hover:bg-blue-100 text-gray-700 px-4 py-3 rounded-xl font-medium transition";

  return (
    <div className="bg-white w-[260px] rounded-3xl shadow-lg p-8 h-fit">

      {/* PROFILE */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-3xl font-extrabold mb-4 select-none">
          {getInitials(user?.name)}
        </div>

        <h2 className="text-3xl font-bold text-center break-words w-full">
          {user?.name || "Nama Pengguna"}
        </h2>

        <p className="text-gray-500 text-sm mt-1 text-center break-all w-full">
          {user?.email || "email@example.com"}
        </p>
      </div>

      {/* MENU */}
      <div className="flex flex-col gap-3 mt-10">

        <NavLink to="/profile/orders" className={menuClass}>
          <FiShoppingBag />
          Pesanan Saya
        </NavLink>

        <NavLink to="/profile/settings" className={menuClass}>
          <FiSettings />
          Pengaturan
        </NavLink>

        <NavLink to="/profile/address" className={menuClass}>
          <FiMapPin />
          Alamat
        </NavLink>

        {user?.role === "admin" && (
          <NavLink to="/profile/register-store" className={menuClass}>
            <FiBriefcase />
            Daftarkan Toko
          </NavLink>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-700 px-4 py-3 rounded-xl font-medium transition"
        >
          <FiLogOut />
          Keluar
        </button>

      </div>
    </div>
  );
}

export default ProfileSidebar;