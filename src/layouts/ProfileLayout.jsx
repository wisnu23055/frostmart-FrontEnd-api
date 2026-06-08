import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiSettings, FiMapPin, FiLogOut, FiBriefcase } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import axiosInstance from '../api/axiosInstance';
import { loginSuccess, logout } from '../store/slices/authSlice';

export default function ProfileLayout() {
  // 1. Inisialisasi navigate
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLogin, user } = useSelector((state) => state.auth);

  const navItems = [
    { name: 'Pesanan Saya', path: '/profile/orders', icon: <FiShoppingBag /> },
    { name: 'Pengaturan', path: '/profile/settings', icon: <FiSettings /> },
    { name: 'Alamat', path: '/profile/address', icon: <FiMapPin /> },
  ];

  if (user?.role === "admin") {
    navItems.push({ name: 'Daftarkan Toko', path: '/profile/register-store', icon: <FiBriefcase /> });
  }

  // 2. Buat fungsi handleLogout
  const handleLogout = async () => {
    try {
      await axiosInstance.delete('/auth/remove-session');
    } catch {
      // ignore: user might already be logged out server-side
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  useEffect(() => {
    if (!isLogin) return;
    if (user?.id) return;

    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/auth/user/me');
        dispatch(loginSuccess(response.data));
      } catch {
        dispatch(logout());
        navigate('/login');
      }
    };

    fetchProfile();
  }, [dispatch, isLogin, navigate, user?.id]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. BANNER BIRU (Aman, posisinya akan pas di bawah Navbar) */}
      <div className="w-full h-52 bg-[#1c54ff]"></div>

      {/* 2. KONTAINER UTAMA (Ditarik naik menimpa banner biru pakai -mt-28) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-28 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* ================================== */}
          {/* SIDEBAR PROFIL KIRI                */}
          {/* ================================== */}
          <div className="w-full lg:w-[300px] bg-white rounded-2xl shadow-md p-6 shrink-0 border border-gray-100">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 bg-blue-50 text-[#1c54ff] rounded-full mb-4 border-4 border-white shadow-sm flex items-center justify-center text-3xl font-bold">
                {user?.name?.slice(0, 2).toUpperCase() || 'FM'}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name || 'FrostMart User'}</h2>
              <p className="text-sm text-gray-500 mt-1">{user?.email || 'user@example.com'}</p>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#1c54ff] text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-blue-50 hover:text-[#1c54ff]'
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
              
              <div className="h-px bg-gray-200 my-3"></div>
              
              {/* 3. Pasang fungsi handleLogout ke event onClick */}
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
              >
                <FiLogOut />
                Keluar
              </button>
            </nav>
          </div>

          {/* ================================== */}
          {/* KONTEN KANAN (Otomatis dibungkus background kotak putih!) */}
          {/* ================================== */}
          <div className="w-full flex-1 bg-white rounded-2xl shadow-md p-6 lg:p-8 border border-gray-100 min-h-[500px]">
             <Outlet />
          </div>

        </div>
      </div>
      
    </div>
  );
}