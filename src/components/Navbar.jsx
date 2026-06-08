import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import logo from "../assets/images/logo frostmart.png";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname === "/search";
  const [isOpen, setIsOpen] = useState(false);

  const isLogin = useSelector((state) => state.auth.isLogin);
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 md:px-10 py-3 gap-4">
        
        {/* LOGO */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <img
            src={logo}
            alt="FrostMart Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-xl font-bold text-blue-600">FrostMart</h1>
        </NavLink>

        {/* TENGAH (DESKTOP ONLY) */}
        <div className="hidden md:flex flex-1 justify-center">
          <ul className="flex gap-10 text-lg font-medium">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 border-b-4 border-blue-600 pb-1"
                    : "text-gray-500 hover:text-blue-600 transition"
                }
              >
                Home
              </NavLink>
            </li>
            
            <li>
              <NavLink
                to="/menu"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 border-b-4 border-blue-600 pb-1"
                    : "text-gray-500 hover:text-blue-600 transition"
                }
              >
                Menu
              </NavLink>
            </li>

            {/* ABOUT ROUTE LINK */}
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 border-b-4 border-blue-600 pb-1"
                    : "text-gray-500 hover:text-blue-600 transition"
                }
              >
                About
              </NavLink>
            </li>
          </ul>
        </div>

        {/* KANAN */}
        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          
          {!isSearchPage && (
            <button
              onClick={() => navigate("/search")}
              className="text-gray-500 text-2xl hover:text-blue-600 transition"
            >
              <FiSearch />
            </button>
          )}

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 text-2xl relative"
                : "text-gray-500 text-2xl relative hover:text-blue-600 transition"
            }
          >
            <FiShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </NavLink>

          {isLogin ? (
            <button
              onClick={() => navigate("/profile")}
              className="text-gray-500 text-2xl hover:text-blue-600 transition"
            >
              <FaUserCircle />
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-base font-semibold hover:bg-blue-700 transition"
            >
              Sign in
            </button>
          )}

          {/* HAMBURGER BUTTON (MOBILE ONLY) */}
          <button
            onClick={toggleMenu}
            className="text-gray-500 text-2xl hover:text-blue-600 transition md:hidden focus:outline-none ml-1"
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 transition-all duration-200">
          <ul className="flex flex-col gap-4 text-base font-semibold">
            <li>
              <NavLink
                to="/"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  isActive ? "text-blue-600 block" : "text-gray-600 hover:text-blue-600 block transition"
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/menu"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  isActive ? "text-blue-600 block" : "text-gray-600 hover:text-blue-600 block transition"
                }
              >
                Menu
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  isActive ? "text-blue-600 block" : "text-gray-600 hover:text-blue-600 block transition"
                }
              >
                About
              </NavLink>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;