import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../../store/slices/authSlice";
import axiosInstance from "../../api/axiosInstance";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleDaftarClick = (e) => {
    if (user) {
      e.preventDefault();
      alert("Anda sudah login");
    }
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/auth/local/signin", {
        email,
        password,
      });

      const { user } = response.data;

      localStorage.setItem("user", JSON.stringify(user));

      dispatch(loginSuccess(user));

      // 👇👇 LOGIKA PINTAR PENGECEKAN ROLE 👇👇
      // Jika role user adalah "admin", lemparkan ke halaman dashboard Zahra
      if (user.role && user.role.toLowerCase() === "admin") {
        navigate("/admin");
      } else {
        // Jika pembeli biasa, lemparkan ke halaman utama Aditya
        navigate("/");
      }
      // 👆👆 ================================== 👆👆
      
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
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-500 flex justify-center items-center px-8 py-10">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center text-gray-800">
          <h1 className="text-3xl font-extrabold mb-4 text-[#11327c]">Anda Sudah Login</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Anda telah masuk ke akun Anda di FrostMart. Silakan kembali ke Beranda atau buka Dashboard jika Anda Admin.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-full bg-[#1c54ff] hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-md"
            >
              Kembali ke Beranda
            </button>
            {user.role && user.role.toLowerCase() === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-xl transition border border-gray-200"
              >
                Ke Dashboard Admin
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-500 flex justify-center items-center relative overflow-hidden">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 z-10">
        <h1 className="text-4xl font-bold mb-3 text-gray-700">
          Login to your Account
        </h1>
        <p className="text-gray-500 mb-6">Welcome back to FrostMart</p>

        {errorMsg && (
          <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium text-center border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mail@example.com"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#1c54ff] transition-all"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#1c54ff] transition-all"
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Remember me
            </label>
            <button
              type="button"
              className="text-[#1c54ff] hover:text-blue-800 transition"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full transition text-white py-4 rounded-xl text-lg font-semibold shadow-md ${
              isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-[#1c54ff] hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Loading..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          Not registered yet?{" "}
          <Link
            to="/register"
            onClick={handleDaftarClick}
            className="font-semibold text-[#1c54ff] hover:text-blue-800 transition"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;