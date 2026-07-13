import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiArrowLeft, FiLoader } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/auth/forgot-password", { email });
      setSuccessMsg(response.data.message || "Token pemulihan telah dikirim ke email Anda.");
      
      // Arahkan ke halaman reset setelah 2 detik, membawa parameter email
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (error) {
      console.error("[Forgot Password Error]", error);
      setErrorMsg(
        error.response?.data?.message || 
        "Gagal mengajukan pemulihan password. Hubungi admin atau periksa koneksi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-500 flex justify-center items-center relative overflow-hidden px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 z-10">
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition"
        >
          <FiArrowLeft /> Kembali ke Halaman Masuk
        </Link>

        <h1 className="text-3xl font-bold mb-3 text-gray-800">Lupa Password?</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Masukkan alamat email terdaftar Anda. Kami akan mengirimkan token 6-digit untuk memulihkan password Anda.
        </p>

        {errorMsg && (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-4 text-sm font-medium border border-red-200">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-4 text-sm font-medium border border-green-200 flex items-center gap-2">
            <FiLoader className="animate-spin text-green-700" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Email Terdaftar</label>
            <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 focus-within:border-[#1c54ff] transition-all">
              <FiMail className="text-gray-400 mr-3 text-lg" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mail@example.com"
                required
                className="w-full outline-none text-gray-700 bg-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || successMsg}
            className={`w-full transition text-white py-4 rounded-xl text-lg font-semibold shadow-md ${
              isLoading || successMsg ? "bg-blue-400 cursor-not-allowed" : "bg-[#1c54ff] hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Mengirim Email..." : "Kirim Token Pemulihan"}
          </button>
        </form>
      </div>
    </div>
  );
}
