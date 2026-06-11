import { useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiCheckCircle,
  FiShoppingBag,
  FiHome,
  FiPackage,
  FiMail,
} from "react-icons/fi";
import logo from "../../assets/images/logo_frostmart.png";
import { formatDateTime } from "../../utils/dateFormatter";

// =====================
// Confetti particle animation (pure CSS/JS, tanpa library)
// =====================
function ConfettiCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ["#1c54ff", "#55a8ea", "#facc15", "#34d399", "#f87171", "#a78bfa"];
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      r: Math.random() * 6 + 3,
      d: Math.random() * 2 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
      tiltAngleIncrement: Math.random() * 0.07 + 0.05,
    }));

    let frame;
    let active = true;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncrement;
        p.y += p.d;
        p.tilt = Math.sin(p.tiltAngle) * 12;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 3, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 5);
        ctx.stroke();
      });
      if (active) frame = requestAnimationFrame(draw);
    };

    draw();
    // Stop setelah 5 detik supaya tidak boros resource
    const timer = setTimeout(() => {
      active = false;
    }, 5000);

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

// =====================
// MAIN COMPONENT
// =====================
export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil data order dari state yang dikirim Checkout, atau buat fallback
  const orderData = location.state || {};
  const orderNumber = orderData.orderNumber || `FM-${Date.now().toString().slice(-6)}`;
  const paymentMethod = orderData.paymentMethod || "Transfer Bank";
  const totalAmount = orderData.totalAmount || 0;

  const today = formatDateTime(new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] via-white to-[#e8f5e9] relative overflow-hidden">
      {/* Confetti */}
      <ConfettiCanvas />

      {/* ===== NAVBAR MINIMALIS ===== */}
      <nav
        style={{
          position: "relative",
          zIndex: 10,
          background: "white",
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
          padding: "12px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <img src={logo} alt="FrostMart" style={{ width: 40, height: 40, objectFit: "contain" }} />
          <span style={{ fontSize: 20, fontWeight: 800, color: "#1c54ff" }}>FrostMart</span>
        </Link>
        <Link
          to="/menu"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            fontWeight: 600,
            color: "#1c54ff",
            textDecoration: "none",
            padding: "8px 20px",
            borderRadius: 999,
            border: "1.5px solid #1c54ff",
            transition: "all 0.2s",
          }}
        >
          <FiShoppingBag size={16} />
          Lanjut Belanja
        </Link>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "calc(100vh - 65px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        {/* Card Utama */}
        <div
          style={{
            background: "white",
            borderRadius: 24,
            boxShadow: "0 20px 60px rgba(28,84,255,0.12)",
            padding: "48px 40px",
            maxWidth: 520,
            width: "100%",
            textAlign: "center",
            border: "1px solid rgba(28,84,255,0.08)",
          }}
        >
          {/* Icon centang animasi */}
          <div
            style={{
              width: 96,
              height: 96,
              background: "linear-gradient(135deg, #34d399, #10b981)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 32px rgba(52,211,153,0.35)",
              animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <FiCheckCircle size={48} color="white" strokeWidth={2.5} />
          </div>

          {/* Judul */}
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#11327c",
              marginBottom: 10,
              letterSpacing: "-0.5px",
            }}
          >
            Pembayaran Berhasil! 🎉
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#6b7280",
              marginBottom: 32,
              lineHeight: 1.6,
              maxWidth: 360,
              margin: "0 auto 32px",
            }}
          >
            Terima kasih telah berbelanja di FrostMart. Pesanan frozen food premium Anda
            sedang kami proses dengan cold-chain logistics terbaik.
          </p>

          {/* Card Detail Pesanan */}
          <div
            style={{
              background: "#f8faff",
              border: "1px solid #e0e7ff",
              borderRadius: 16,
              overflow: "hidden",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                borderBottom: "1px solid #e0e7ff",
                padding: "14px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, color: "#6b7280" }}>Nomor Pesanan</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#11327c" }}>
                #{orderNumber}
              </span>
            </div>
            <div
              style={{
                borderBottom: "1px solid #e0e7ff",
                padding: "14px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, color: "#6b7280" }}>Tanggal</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                {today}
              </span>
            </div>
            <div
              style={{
                borderBottom: "1px solid #e0e7ff",
                padding: "14px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, color: "#6b7280" }}>Metode Pembayaran</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                {paymentMethod}
              </span>
            </div>
            {totalAmount > 0 && (
              <div
                style={{
                  padding: "14px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#eff6ff",
                }}
              >
                <span style={{ fontSize: 13, color: "#6b7280" }}>Total Pembayaran</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#1c54ff" }}>
                  Rp{totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </div>

          {/* Info Email */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 32,
              textAlign: "left",
            }}
          >
            <FiMail size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: "#15803d", lineHeight: 1.6, margin: 0 }}>
              Konfirmasi pesanan telah dikirimkan. Cek detailnya pada profil anda untuk
              detail dan informasi pelacakan pengiriman.
            </p>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
            }}
          >
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: 12,
                border: "1.5px solid #1c54ff",
                color: "#1c54ff",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#eff6ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <FiHome size={16} />
              Kembali ke Beranda
            </Link>
            <Link
              to="/profile/orders"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #1c54ff, #3a7eff)",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(28,84,255,0.3)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(28,84,255,0.4)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(28,84,255,0.3)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <FiPackage size={16} />
              Lacak Pesanan
            </Link>
          </div>
        </div>

        {/* Promo Banner Kecil */}
        <div
          style={{
            marginTop: 32,
            background: "linear-gradient(135deg, #1c54ff, #55a8ea)",
            borderRadius: 16,
            padding: "20px 32px",
            maxWidth: 520,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <p style={{ color: "white", fontWeight: 700, fontSize: 15, margin: 0 }}>
              ❄️ Temukan Frozen Food Premium Lainnya
            </p>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: "4px 0 0" }}>
              Stok makanan beku berkualitas, higienis, dan praktis untuk keluarga Anda
            </p>
          </div>
          <Link
            to="/menu"
            style={{
              background: "white",
              color: "#1c54ff",
              fontSize: 13,
              fontWeight: 700,
              padding: "8px 20px",
              borderRadius: 999,
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Jelajahi Menu
          </Link>
        </div>

        {/* Copyright */}
        <p
          style={{
            marginTop: 40,
            fontSize: 12,
            color: "#9ca3af",
            position: "relative",
            zIndex: 1,
          }}
        >
          © {new Date().getFullYear()} FrostMart. Butuh bantuan?{" "}
          <a href="mailto:food@example.com" style={{ color: "#1c54ff", textDecoration: "none" }}>
            Hubungi Support
          </a>
        </p>
      </main>

      {/* Keyframe animation */}
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
