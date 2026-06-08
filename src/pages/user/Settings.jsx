import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import axiosInstance from "../../api/axiosInstance";
import { loginSuccess, logout } from "../../store/slices/authSlice";

function Settings() {
  const [tab, setTab] = useState("profile");
  const dispatch = useDispatch();
  const { isLogin, user } = useSelector((state) => state.auth);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!isLogin) return;
    if (user?.id) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("/auth/user/me");
        dispatch(loginSuccess(response.data));
        setProfileForm({
          name: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
        });
      } catch {
        dispatch(logout());
      }
    };

    fetchProfile();
  }, [dispatch, isLogin, user?.id]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const response = await axiosInstance.put("/auth/user/me", {
        name: profileForm.name || undefined,
        email: profileForm.email || undefined,
        phone: profileForm.phone || undefined,
      });

      dispatch(loginSuccess(response.data));
      alert("Profil berhasil diperbarui!");
    } catch (error) {
      const message = error?.response?.data?.message || "Gagal memperbarui profil.";
      alert(message);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordForm.newPassword) {
      alert("Password baru wajib diisi.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Password baru dan konfirmasi tidak sama.");
      return;
    }

    try {
      await axiosInstance.put("/auth/user/me", {
        password: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("Password berhasil diperbarui!");
    } catch (error) {
      const message = error?.response?.data?.message || "Gagal memperbarui password.";
      alert(message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Pengaturan
      </h1>

      {/* TAB NAVIGATION */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab("profile")}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            tab === "profile"
              ? "bg-[#1c54ff] text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Edit Profile
        </button>

        <button
          onClick={() => setTab("password")}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            tab === "password"
              ? "bg-[#1c54ff] text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Edit Password
        </button>
      </div>

      {/* CONTENT AREA */}
      <div>
        {tab === "profile" ? (
          <div className="space-y-5 max-w-2xl">
            <div>
              <label className="font-semibold text-gray-700 text-sm">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-1.5 focus:outline-none focus:border-[#1c54ff] focus:ring-1 focus:ring-[#1c54ff] transition-all"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-1.5 focus:outline-none focus:border-[#1c54ff] focus:ring-1 focus:ring-[#1c54ff] transition-all"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 text-sm">Nomor Telepon</label>
              <input
                type="text"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                placeholder="+62xxxxxxxxxxx"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-1.5 focus:outline-none focus:border-[#1c54ff] focus:ring-1 focus:ring-[#1c54ff] transition-all"
              />
            </div>
            <div className="pt-4">
              <button
                onClick={handleSaveProfile}
                className="bg-[#1c54ff] hover:bg-blue-700 transition-colors text-white px-8 py-3 rounded-xl font-semibold shadow-md"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 max-w-2xl">
            <div>
              <label className="font-semibold text-gray-700 text-sm">Password Lama</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-1.5 focus:outline-none focus:border-[#1c54ff] focus:ring-1 focus:ring-[#1c54ff] transition-all"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 text-sm">Password Baru</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-1.5 focus:outline-none focus:border-[#1c54ff] focus:ring-1 focus:ring-[#1c54ff] transition-all"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 text-sm">Konfirmasi Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-1.5 focus:outline-none focus:border-[#1c54ff] focus:ring-1 focus:ring-[#1c54ff] transition-all"
              />
            </div>
            <div className="pt-4">
              <button
                onClick={handleSavePassword}
                className="bg-[#1c54ff] hover:bg-blue-700 transition-colors text-white px-8 py-3 rounded-xl font-semibold shadow-md"
              >
                Simpan Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;