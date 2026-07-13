import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiLock, FiKey, FiArrowLeft, FiCheck } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validasi input
    if (newPassword !== confirmPassword) {
      setErrorMsg("Password baru dan konfirmasi password tidak cocok!");
      return;
    }

    if (token.trim().length < 6) {
      setErrorMsg("Token pemulihan harus diisi minimal 6 digit.");
      return;
    }

    setIsLoading(true);

    try {
      await axiosInstance.post("/auth/reset-password", {
        token: token.trim(),
        new_password: newPassword,
      });

      setSuccessMsg("Password Anda berhasil diperbarui!");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (error) {
      console.error("[Reset Password Error]", error);
      setErrorMsg(
        error.response?.data?.message || 
        "Gagal menyetel ulang password. Pastikan token benar dan belum kadaluarsa."
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
          to="/forgot-password"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition"
        >
          <FiArrowLeft /> Kembali ke Minta Token
        </Link>

        <h1 className="text-3xl font-bold mb-3 text-gray-800">Setel Ulang Password</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Masukkan token 6-digit yang dikirim ke {email || "email Anda"} beserta password baru Anda.
        </p>

        {errorMsg && (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-4 text-sm font-medium border border-red-200">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-4 text-sm font-medium border border-green-200 flex items-center gap-2">
            <div className="bg-green-200 p-1 rounded-full">
              <FiCheck className="text-green-700" size={16} />
            </div>
            {successMsg} Mengarahkan ke halaman login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Token */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Token Pemulihan (6 Digit)</label>
            <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 focus-within:border-[#1c54ff] transition-all">
              <FiKey className="text-gray-400 mr-3 text-lg" />
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Masukkan 6-digit token"
                required
                maxLength={10}
                className="w-full outline-none text-gray-700 bg-transparent tracking-wide"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Password Baru</label>
            <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 focus-within:border-[#1c54ff] transition-all">
              <FiLock className="text-gray-400 mr-3 text-lg" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                className="w-full outline-none text-gray-700 bg-transparent"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Konfirmasi Password Baru</label>
            <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 focus-within:border-[#1c54ff] transition-all">
              <FiLock className="text-gray-400 mr-3 text-lg" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
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
            {isLoading ? "Menyimpan Password..." : "Simpan Password Baru"}
          </button>
        </form>
      </div>
    </div>
  );
}
