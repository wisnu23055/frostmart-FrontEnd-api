import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";
import logo from "../assets/images/logo_frostmart.png";

function Footer() {
  return (
    <footer id="about" className="bg-[#0f2461] text-white px-10 py-16">

      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/10 pb-12 mb-10">

          {/* LOGO & INFO */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1c54ff] flex items-center justify-center">
                <img src={logo} alt="FrostMart" className="w-7 h-7 object-contain" onError={(e) => { e.target.style.display = "none"; }} />
              </div>
              <h2 className="text-xl font-bold">FrostMart</h2>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-5">
              Jalan Semangka Raya, Telaga Murni,<br />
              Cikarang Barat, Kab. Bekasi
            </p>

            {/* Social Media */}
            <div className="flex items-center gap-3">
              {[
                { icon: <FaInstagram size={16} />, href: "#" },
                { icon: <FaFacebookF size={16} />, href: "#" },
                { icon: <FaTwitter size={16} />, href: "#" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#1c54ff] hover:border-[#1c54ff] transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="font-bold text-base mb-5">Company</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/about" className="hover:text-white transition-colors">Tentang Kami</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Karir</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cara Kerja</a></li>
            </ul>
          </div>

          {/* POLICY */}
          <div>
            <h3 className="font-bold text-base mb-5">Kebijakan</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privasi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pengiriman</a></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="font-bold text-base mb-5">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>08123456789</li>
              <li>frostmart@example.com</li>
            </ul>
          </div>

        </div>

        <p className="text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} FrostMart. ALL RIGHT RESERVED.
        </p>
      </div>

    </footer>
  );
}

export default Footer;