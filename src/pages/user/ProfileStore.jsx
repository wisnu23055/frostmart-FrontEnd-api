import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiInfo,
  FiUpload,
  FiCheckCircle,
  FiClock,
  FiSmartphone,
  FiLoader,
} from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";

export default function ProfileStore() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // States
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form step flow:
  // 1: Identitas Penjual (Step 1.1)
  // 2: Data Toko (Step 1.2)
  // 3: Bukti Produk (Step 2)
  // 4: Informasi Rekening (Step 3)
  const [step, setStep] = useState(1);

  // Form Fields State
  const [formData, setFormData] = useState({
    // Step 1: Identitas Penjual
    owner_name: "",
    phone: "",
    nik: "",
    // Step 2: Data Toko
    store_name: "",
    store_type: "",
    category: "",
    address: "",
    // Step 4: Rekening & E-Wallet
    bank_account_name: "",
    bank_1: "", // BCA
    bank_2: "", // Mandiri
    bank_3: "", // BRI
    bank_4: "", // BNI
    ewallet_owner_name: "",
    ewallet_1: "", // GoPay
    ewallet_2: "", // OVO
    ewallet_3: "", // DANA
    ewallet_4: "", // ShopeePay
  });

  // File Upload States
  const [files, setFiles] = useState({
    ktp_image: null,
    product_proof_1: null,
    product_proof_2: null,
    qris_image: null,
  });

  // Previews for visual feedback
  const [previews, setPreviews] = useState({
    ktp_image: "",
    product_proof_1: "",
    product_proof_2: "",
    qris_image: "",
  });

  const checkRegistrationStatus = async () => {
    try {
      const res = await axiosInstance.get("/store-registrations/my");
      if (res.data?.success && res.data?.data) {
        setRegistration(res.data.data);
      }
    } catch (err) {
      console.error("Gagal memeriksa profil toko:", err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  // Set default owner name on step load
  useEffect(() => {
    if (user?.name && !formData.owner_name) {
      setFormData((prev) => ({ ...prev, owner_name: user.name }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, name: value || "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran berkas tidak boleh melebihi 2MB.");
      return;
    }

    setFiles((prev) => ({ ...prev, [fieldName]: file }));
    setPreviews((prev) => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
  };

  // Step Navigations & Validations
  const nextStep = () => {
    if (step === 1) {
      if (!formData.owner_name || !formData.phone || !formData.nik) {
        alert("Harap lengkapi semua data identitas penjual!");
        return;
      }
      if (!files.ktp_image && !previews.ktp_image) {
        alert("Harap unggah foto KTP terlebih dahulu!");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.store_name || !formData.store_type || !formData.address || !formData.category) {
        alert("Harap lengkapi semua data toko!");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if ((!files.product_proof_1 && !previews.product_proof_1) || (!files.product_proof_2 && !previews.product_proof_2)) {
        alert("Harap unggah kedua bukti produk!");
        return;
      }
      setStep(4);
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const startEditing = () => {
    setFormData({
      owner_name: registration.owner_name || "",
      phone: registration.phone || "",
      nik: registration.nik || "",
      store_name: registration.store_name || "",
      store_type: registration.store_type || "",
      category: registration.category || "",
      address: registration.address || "",
      bank_account_name: registration.bank_account_name || "",
      bank_1: registration.bank_1 || "",
      bank_2: registration.bank_2 || "",
      bank_3: registration.bank_3 || "",
      bank_4: registration.bank_4 || "",
      ewallet_owner_name: registration.ewallet_owner_name || "",
      ewallet_1: registration.ewallet_1 || "",
      ewallet_2: registration.ewallet_2 || "",
      ewallet_3: registration.ewallet_3 || "",
      ewallet_4: registration.ewallet_4 || "",
    });
    setPreviews({
      ktp_image: registration.ktp_image_url || "",
      product_proof_1: registration.product_proof_1_url || "",
      product_proof_2: registration.product_proof_2_url || "",
      qris_image: registration.qris_url || "",
    });
    setFiles({
      ktp_image: null,
      product_proof_1: null,
      product_proof_2: null,
      qris_image: null,
    });
    setStep(1);
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!registration) return;
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus pendaftaran toko ini? Semua data pendaftaran saat ini akan hilang secara permanen dari sistem."
    );
    if (!confirmDelete) return;

    setIsSubmitting(true);
    try {
      await axiosInstance.delete(`/store-registrations/${registration.id}`);
      alert("Pendaftaran toko berhasil dihapus.");
      setRegistration(null);
      setFormData({
        owner_name: user?.name || "",
        phone: "",
        nik: "",
        store_name: "",
        store_type: "",
        category: "",
        address: "",
        bank_account_name: "",
        bank_1: "",
        bank_2: "",
        bank_3: "",
        bank_4: "",
        ewallet_owner_name: "",
        ewallet_1: "",
        ewallet_2: "",
        ewallet_3: "",
        ewallet_4: "",
      });
      setPreviews({
        ktp_image: "",
        product_proof_1: "",
        product_proof_2: "",
        qris_image: "",
      });
      setFiles({
        ktp_image: null,
        product_proof_1: null,
        product_proof_2: null,
        qris_image: null,
      });
      setStep(1);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal menghapus pendaftaran toko.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const hasBank = !!(formData.bank_1 || formData.bank_2 || formData.bank_3 || formData.bank_4);
    const hasEwallet = !!(formData.ewallet_1 || formData.ewallet_2 || formData.ewallet_3 || formData.ewallet_4);

    if (!hasBank && !hasEwallet) {
      alert("Harap lengkapi setidaknya satu nomor rekening bank atau akun E-Wallet!");
      return;
    }

    if (hasBank && !formData.bank_account_name) {
      alert("Harap isi Nama Pemilik Rekening jika Anda mengisi rekening bank!");
      return;
    }

    if (hasEwallet && !formData.ewallet_owner_name) {
      alert("Harap isi Nama Pemilik E-Wallet jika Anda mengisi akun E-Wallet!");
      return;
    }

    if (!files.qris_image && !previews.qris_image) {
      alert("Harap unggah berkas QRIS toko Anda!");
      return;
    }

    setIsSubmitting(true);
    try {
      const dataPayload = new FormData();
      // Append files
      if (files.ktp_image) dataPayload.append("ktp_image", files.ktp_image);
      if (files.product_proof_1) dataPayload.append("product_proof_1", files.product_proof_1);
      if (files.product_proof_2) dataPayload.append("product_proof_2", files.product_proof_2);
      if (files.qris_image) dataPayload.append("qris_image", files.qris_image);

      // Append text fields
      Object.keys(formData).forEach((key) => {
        dataPayload.append(key, formData[key] || "");
      });

      if (isEditing) {
        await axiosInstance.put(`/store-registrations/${registration.id}`, dataPayload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Informasi Toko Berhasil Diperbarui!");
        setIsEditing(false);
      } else {
        await axiosInstance.post("/store-registrations", dataPayload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Pendaftaran Toko Berhasil Diajukan!");
      }
      checkRegistrationStatus();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat mendaftarkan toko.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading Screen
  if (isLoadingStatus) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <FiLoader className="animate-spin text-[#1c54ff] mb-3" size={36} />
        <span className="font-semibold text-sm">Memuat profil toko...</span>
      </div>
    );
  }

  // Render 1: Under Review (pending)
  if (registration && registration.status === "pending") {
    return (
      <div className="flex flex-col items-center text-center py-10 max-w-lg mx-auto select-none">
        <div className="w-24 h-24 bg-blue-50 text-[#11327c] rounded-full flex items-center justify-center relative mb-6">
          <span className="text-4xl">📄</span>
          <div className="absolute -bottom-1 -right-1 bg-[#1c54ff] text-white p-1.5 rounded-full border-4 border-white">
            <FiClock size={16} />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-[#11327c] mb-3 leading-tight">
          Dokumen Sedang Ditinjau
        </h1>
        <p className="text-gray-500 text-sm mb-10 leading-relaxed">
          Tim kami sedang memverifikasi dokumen Anda. Proses ini biasanya memakan waktu 1-2 hari kerja.
        </p>

        {/* Progres Status */}
        <div className="w-full bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm mb-8 text-left">
          <div className="flex justify-between items-center mb-3.5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Status Verifikasi</span>
            <span className="text-xs font-bold text-[#1c54ff]">60% Selesai</span>
          </div>

          {/* Bar Progres */}
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden mb-5">
            <div className="bg-[#1c54ff] h-full rounded-full" style={{ width: "60%" }}></div>
          </div>

          {/* Stepper text */}
          <div className="flex justify-between text-[11px] font-bold text-gray-400">
            <div className="text-[#1c54ff] flex flex-col items-center">
              <span className="mb-1">●</span>
              <span>Upload</span>
            </div>
            <div className="text-[#1c54ff] flex flex-col items-center">
              <span className="mb-1">●</span>
              <span>Submit</span>
            </div>
            <div className="text-[#11327c] flex flex-col items-center font-extrabold">
              <span className="mb-1">●</span>
              <span>Review</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="mb-1">●</span>
              <span>Verified</span>
            </div>
          </div>
        </div>

        <div className="flex w-full gap-4 justify-center">
          <button
            onClick={() => alert("Menghubungi Customer Support...")}
            className="flex-1 max-w-[190px] py-3 bg-[#1c54ff] text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition duration-200 text-sm"
          >
            Hubungi CS
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 max-w-[190px] py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold rounded-xl transition duration-200 text-sm"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render 2: Active (approved)
  if (registration && registration.status === "approved" && !isEditing) {
    return (
      <div className="flex flex-col items-center text-center py-10 max-w-lg mx-auto select-none">
        <h1 className="text-3xl font-extrabold text-[#11327c] mb-3 leading-tight">
          Selamat! Profil Tokomu Sudah Aktif
        </h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Sekarang kamu dapat mulai mengelola stok dan menerima pesanan dari pelanggan.
        </p>

        {/* Card Detail Toko */}
        <div className="w-full bg-white border border-gray-100 shadow-md rounded-2xl p-6 mb-8 text-left relative overflow-hidden">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-50">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Detail Toko</h3>
              <p className="text-gray-400 text-xs mt-0.5">INFORMASI PROFIL</p>
            </div>
            <span className="px-3.5 py-1.5 bg-green-100 text-green-700 font-bold text-xs rounded-full flex items-center gap-1.5">
              <FiCheckCircle size={14} /> Approved
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-5 text-sm">
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1">Nama Toko</p>
              <div className="flex items-center gap-1.5 font-bold text-gray-800">
                <FiBriefcase className="text-[#1c54ff]" />
                <span>{registration.store_name}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1">Kategori</p>
              <div className="flex items-center gap-1.5 font-bold text-gray-800">
                <span>🍽️</span>
                <span>{registration.category}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1">Lokasi</p>
              <div className="flex items-center gap-1.5 font-bold text-gray-800">
                <span>📍</span>
                <span className="truncate max-w-[180px]">{registration.address}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1">Tanggal Pembuatan</p>
              <div className="flex items-center gap-1.5 font-bold text-gray-800">
                <span>📅</span>
                <span>{new Date(registration.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-lg mt-4">
          <button
            onClick={() => navigate("/admin")}
            className="flex-1 px-6 py-3 bg-[#1c54ff] hover:bg-blue-700 text-white font-bold rounded-xl transition duration-200 text-sm shadow-lg shadow-blue-500/20 animate-fade-in"
          >
            Buka Dashboard Penjual
          </button>
          <button
            onClick={startEditing}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition duration-200 text-sm border border-gray-200"
          >
            Ubah Informasi Toko
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition duration-200 text-sm shadow-lg shadow-rose-500/20"
          >
            Hapus Toko
          </button>
        </div>
      </div>
    );
  }

  // Render 3: Multi-Step Registration Form
  return (
    <div className="py-2">
      {/* Step Banner & Progress Indicator */}
      <div className="flex justify-between items-start mb-8 pb-5 border-b border-gray-100">
        <div>
          <span className="text-[#1c54ff] font-bold text-xs uppercase tracking-wide">
            {isEditing ? "Ubah Informasi Toko" : "Profil Toko"}
          </span>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">
            {isEditing ? "Perbarui data tokomu secara instan" : "Lengkapi profil toko untuk mulai berjualan"}
          </h2>
        </div>

        {/* Circular progress display */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400">Langkah {step === 1 ? "1" : step === 2 ? "1" : step === 3 ? "2" : "3"} dari 3</p>
            <p className="text-xs font-extrabold text-gray-700">
              {step <= 2 ? "Dokumen Legal" : step === 3 ? "Bukti Produk" : "Detail Rekening"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#002d84] text-white flex items-center justify-center font-black text-sm select-none shadow-md">
            {step <= 2 ? "35%" : step === 3 ? "65%" : "100%"}
          </div>
        </div>
      </div>

      {/* STEP 1: Identitas Penjual */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[#002d84] border-b border-gray-100 pb-3 mb-4">
            <span className="text-lg">👤</span>
            <h3 className="font-extrabold text-lg text-gray-800">Identitas Penjual</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
              <input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Masukkan nama lengkap sesuai KTP"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nomor HP Aktif</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Contoh: 08123456789"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nomor KTP (NIK)</label>
              <input
                type="text"
                name="nik"
                value={formData.nik}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Masukkan 16 digit NIK"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Foto KTP</label>
              <div className="border-2 border-dashed border-gray-200 hover:border-[#1c54ff] transition rounded-2xl p-6 text-center bg-gray-50/50 flex flex-col items-center justify-center">
                <FiUpload className="text-gray-400 mb-3" size={24} />
                <span className="text-sm font-bold text-gray-700">Pilih file atau tarik ke sini</span>
                <span className="text-xs text-gray-400 mt-1 mb-4">JPG, PNG, JPEG, WEBP (Maks. 2MB)</span>

                <label className="cursor-pointer bg-[#002d84] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-900 transition">
                  Cari File
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => handleFileChange(e, "ktp_image")}
                  />
                </label>

                {previews.ktp_image && (
                  <img
                    src={previews.ktp_image}
                    alt="KTP Preview"
                    className="w-40 h-24 object-cover mt-4 rounded-lg border border-gray-200 bg-white shadow-sm"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-5 border-t border-gray-100">
            {isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold rounded-xl text-sm transition"
              >
                Batal Edit
              </button>
            ) : (
              <div></div>
            )}
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-[#1c54ff] text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition"
            >
              Simpan & Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* STEP 1.2: Data Toko */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[#002d84] border-b border-gray-100 pb-3 mb-4">
            <span className="text-lg">🏪</span>
            <h3 className="font-extrabold text-lg text-gray-800">Data Toko</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nama Toko</label>
              <input
                type="text"
                name="store_name"
                value={formData.store_name}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Masukkan nama tokomu"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Jenis Usaha</label>
              <input
                type="text"
                name="store_type"
                value={formData.store_type}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Contoh: Perorangan, PT, CV"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Kategori Utama</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Contoh: Frozen Food, Produk Segar & Sayuran"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Alamat Toko Lengkap</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Masukkan alamat lengkap tokomu"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-between pt-5 border-t border-gray-100">
            <button
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold rounded-xl text-sm transition"
            >
              Kembali
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-[#1c54ff] text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition"
            >
              Simpan & Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Bukti Produk */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[#002d84] border-b border-gray-100 pb-3 mb-4">
            <span className="text-lg">📦</span>
            <h3 className="font-extrabold text-lg text-gray-800">Data Produk</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2.5 uppercase tracking-wide">Bukti Produk 1</label>
              <div className="border-2 border-dashed border-gray-200 hover:border-[#1c54ff] transition rounded-2xl p-5 text-center bg-gray-50/50 flex flex-col items-center justify-center min-h-[220px]">
                <FiUpload className="text-gray-400 mb-2" size={20} />
                <span className="text-sm font-bold text-gray-700">Unggah foto produk pertama</span>
                <span className="text-[11px] text-gray-400 mt-1 mb-4">JPG, PNG, JPEG, WEBP (Maks. 2MB)</span>

                <label className="cursor-pointer bg-[#002d84] text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-blue-900 transition">
                  Cari File
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => handleFileChange(e, "product_proof_1")}
                  />
                </label>

                {previews.product_proof_1 && (
                  <img
                    src={previews.product_proof_1}
                    alt="Proof 1 Preview"
                    className="w-24 h-24 object-cover mt-4 rounded-lg border border-gray-200 bg-white"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2.5 uppercase tracking-wide">Bukti Produk 2</label>
              <div className="border-2 border-dashed border-gray-200 hover:border-[#1c54ff] transition rounded-2xl p-5 text-center bg-gray-50/50 flex flex-col items-center justify-center min-h-[220px]">
                <FiUpload className="text-gray-400 mb-2" size={20} />
                <span className="text-sm font-bold text-gray-700">Unggah foto produk kedua</span>
                <span className="text-[11px] text-gray-400 mt-1 mb-4">JPG, PNG, JPEG, WEBP (Maks. 2MB)</span>

                <label className="cursor-pointer bg-[#002d84] text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-blue-900 transition">
                  Cari File
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => handleFileChange(e, "product_proof_2")}
                  />
                </label>

                {previews.product_proof_2 && (
                  <img
                    src={previews.product_proof_2}
                    alt="Proof 2 Preview"
                    className="w-24 h-24 object-cover mt-4 rounded-lg border border-gray-200 bg-white"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Guide/Petunjuk */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800 flex gap-3.5 items-start">
            <FiInfo className="text-blue-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-extrabold text-blue-900 mb-1">Petunjuk Unggah</h4>
              <p className="leading-relaxed text-blue-800/90 text-xs">
                Pastikan seluruh bagian produk terlihat jelas dan tidak terpotong. Dokumen harus masih berlaku (tidak kadaluwarsa). Nama pada dokumen harus sesuai dengan nama pemilik toko.
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-5 border-t border-gray-100">
            <button
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold rounded-xl text-sm transition"
            >
              Kembali
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-[#1c54ff] text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition"
            >
              Simpan & Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Informasi Rekening, E-Wallet & QRIS */}
      {step === 4 && (
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-[#002d84] border-b border-gray-100 pb-3">
            <span className="text-lg">💰</span>
            <h3 className="font-extrabold text-lg text-gray-800">Informasi Penarikan & Pembayaran</h3>
          </div>

          {/* 1. INFORMASI REKENING BANK */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-[#002d84] uppercase tracking-wider border-b border-gray-50 pb-2">
              1. Transfer Bank (BCA, Mandiri, BRI, BNI)
            </h4>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nama Pemilik Rekening</label>
              <input
                type="text"
                name="bank_account_name"
                value={formData.bank_account_name}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Masukkan nama lengkap pemilik rekening sesuai KTP/Bank"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nomor Rekening BCA</label>
                <input
                  type="text"
                  name="bank_1"
                  value={formData.bank_1}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Contoh: 1234567890"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nomor Rekening Mandiri</label>
                <input
                  type="text"
                  name="bank_2"
                  value={formData.bank_2}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Contoh: 0987654321"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nomor Rekening BRI</label>
                <input
                  type="text"
                  name="bank_3"
                  value={formData.bank_3}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Contoh: 112233445566"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nomor Rekening BNI</label>
                <input
                  type="text"
                  name="bank_4"
                  value={formData.bank_4}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Contoh: 9988776655"
                />
              </div>
            </div>
          </div>

          {/* 2. INFORMASI AKUN E-WALLET */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-[#002d84] uppercase tracking-wider border-b border-gray-50 pb-2">
              2. Akun E-Wallet (GoPay, OVO, DANA, ShopeePay)
            </h4>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nama Pemilik Akun E-Wallet</label>
              <input
                type="text"
                name="ewallet_owner_name"
                value={formData.ewallet_owner_name}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Masukkan nama pemilik akun e-wallet Anda"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nomor GoPay</label>
                <input
                  type="text"
                  name="ewallet_1"
                  value={formData.ewallet_1}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Contoh: 081234567890"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nomor OVO</label>
                <input
                  type="text"
                  name="ewallet_2"
                  value={formData.ewallet_2}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Contoh: 081234567890"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nomor DANA</label>
                <input
                  type="text"
                  name="ewallet_3"
                  value={formData.ewallet_3}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Contoh: 081234567890"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nomor ShopeePay</label>
                <input
                  type="text"
                  name="ewallet_4"
                  value={formData.ewallet_4}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Contoh: 081234567890"
                />
              </div>
            </div>
          </div>

          {/* 3. QRIS MERCHANT TOKO */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-[#002d84] uppercase tracking-wider border-b border-gray-50 pb-2">
              3. Berkas QRIS Merchant Toko (Wajib)
            </h4>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2.5 uppercase tracking-wide">
                Upload Foto QRIS Merchant Toko Anda
              </label>
              <div className="border-2 border-dashed border-gray-200 hover:border-[#1c54ff] transition rounded-2xl p-6 text-center bg-gray-50/50 flex flex-col items-center justify-center">
                <FiUpload className="text-gray-400 mb-3" size={24} />
                <span className="text-sm font-bold text-gray-700">Unggah berkas foto QRIS toko Anda</span>
                <span className="text-xs text-gray-400 mt-1 mb-4">JPG, PNG, JPEG, WEBP (Maks. 2MB)</span>

                <label className="cursor-pointer bg-[#002d84] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-900 transition">
                  Cari File
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => handleFileChange(e, "qris_image")}
                  />
                </label>

                {previews.qris_image && (
                  <img
                    src={previews.qris_image}
                    alt="QRIS Preview"
                    className="w-40 h-40 object-cover mt-4 rounded-lg border border-gray-200 bg-white shadow-sm"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-5 border-t border-gray-100">
            <button
              onClick={prevStep}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold rounded-xl text-sm transition"
            >
              Kembali
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#1c54ff] hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin" />
                  {isEditing ? "Memperbarui..." : "Mengajukan..."}
                </>
              ) : (
                isEditing ? "Simpan Perubahan" : "Simpan & Lanjutkan"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
