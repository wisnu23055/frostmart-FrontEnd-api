import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiUser,
  FiMail,
  FiLock,
  FiCheckCircle,
} from "react-icons/fi";

import axiosInstance from "../../api/axiosInstance";

function Register() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // VALIDASI PASSWORD
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Password dan Konfirmasi Password harus sama!");
      return;
    }

    // VALIDASI TERMS
    if (!formData.agreeTerms) {
      setErrorMsg("Kamu harus menyetujui Syarat dan Ketentuan serta Kebijakan Privasi!");
      return;
    }

    setIsLoading(true);

    try {
      await axiosInstance.post("/auth/local/signup", {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      alert("Register berhasil! Silakan login.");
      navigate("/login");
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Koneksi ke backend gagal. Pastikan server Node.js nyala!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 flex justify-center items-center px-8 py-10">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center text-gray-800">
          <h1 className="text-3xl font-extrabold mb-4 text-[#11327c]">Anda Sudah Login</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Anda telah berhasil masuk ke akun Anda di FrostMart. Tidak perlu melakukan pendaftaran baru.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-[#1c54ff] hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-md"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f"
          alt="Frozen Food"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white px-10 text-center">
          <h1 className="text-5xl font-bold mb-6">
            FrostMart
          </h1>

          <p className="text-2xl font-semibold mb-4">
            Kesegaran terjaga, kualitas terjamin.
          </p>

          <p className="text-lg text-gray-200">
            Rasakan layanan logistik gourmet dengan pendinginan presisi untuk keunggulan kuliner.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 bg-gradient-to-b from-blue-500 to-blue-700 flex justify-center items-center px-8 py-10">

        <div className="w-full max-w-md text-white">

          <h2 className="text-4xl font-bold mb-3">
            Daftar Akun Baru
          </h2>

          <p className="mb-10 text-lg text-blue-100">
            Bergabung dengan FrostMart hari ini.
          </p>

          {errorMsg && (
            <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium text-center border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* FULL NAME */}
            <div>
              <label className="block mb-2 font-medium">
                Nama Lengkap
              </label>

              <div className="flex items-center bg-white rounded-lg px-4 py-3">
                <FiUser className="text-gray-500 text-xl mr-3" />

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap Anda"
                  required
                  className="w-full outline-none text-gray-700"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="block mb-2 font-medium">
                Email
              </label>

              <div className="flex items-center bg-white rounded-lg px-4 py-3">
                <FiMail className="text-gray-500 text-xl mr-3" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Masukkan email Anda"
                  required
                  className="w-full outline-none text-gray-700"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block mb-2 font-medium">
                Password
              </label>

              <div className="flex items-center bg-white rounded-lg px-4 py-3">
                <FiLock className="text-gray-500 text-xl mr-3" />

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Buat password"
                  required
                  className="w-full outline-none text-gray-700"
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block mb-2 font-medium">
                Konfirmasi Password
              </label>

              <div className="flex items-center bg-white rounded-lg px-4 py-3">
                <FiCheckCircle className="text-gray-500 text-xl mr-3" />

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password Anda"
                  required
                  className="w-full outline-none text-gray-700"
                />
              </div>
            </div>

            {/* TERMS */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 accent-blue-900"
              />

              <p className="text-sm text-blue-100 leading-relaxed">
                Saya menyetujui{" "}
                <span className="underline cursor-pointer font-medium">
                  Syarat dan Ketentuan
                </span>{" "}
                dan{" "}
                <span className="underline cursor-pointer font-medium">
                  Kebijakan Privasi
                </span>
              </p>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-900 hover:bg-blue-950 transition py-4 rounded-lg font-semibold text-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : "Daftar Akun"}
            </button>

          </form>

          {/* LOGIN LINK */}
          <p className="text-center mt-8">
            Sudah punya akun?{" "}

            <Link
              to="/login"
              className="font-semibold underline"
            >
              Masuk di sini
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Register;