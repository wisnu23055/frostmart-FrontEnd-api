import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../../api/axiosInstance";

const emptyForm = {
  address_type: "rumah",
  recipient_name: "",
  city_district: "",
  postal_code: "",
  full_address: "",
};

const addressTypeOptions = [
  { value: "rumah", label: "Rumah" },
  { value: "kantor", label: "Kantor" },
  { value: "apartemen", label: "Apartemen" },
  { value: "kos", label: "Kos" },
  { value: "lainnya", label: "Lainnya" },
];

function Address() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [activeId, setActiveId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axiosInstance.get("/addresses/me");
        setAddresses(response.data);

        if (response.data.length > 0) {
          const primaryAddress = response.data.find((item) => item.is_primary) || response.data[0];
          setActiveId(primaryAddress.id);
          setForm({
            address_type: primaryAddress.address_type || "rumah",
            recipient_name: primaryAddress.recipient_name || "",
            city_district: primaryAddress.city_district || "",
            postal_code: primaryAddress.postal_code || "",
            full_address: primaryAddress.full_address || "",
          });
          setIsFormOpen(false);
        } else {
          setIsFormOpen(true);
        }
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          navigate("/login");
          return;
        }

        setAddresses([]);
        setIsFormOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startCreate = () => {
    setActiveId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const startEdit = (address) => {
    setActiveId(address.id);
    setForm({
      address_type: address.address_type || "rumah",
      recipient_name: address.recipient_name || "",
      city_district: address.city_district || "",
      postal_code: address.postal_code || "",
      full_address: address.full_address || "",
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const payload = {
        address_type: form.address_type,
        recipient_name: form.recipient_name.trim(),
        city_district: form.city_district.trim(),
        postal_code: form.postal_code.trim(),
        full_address: form.full_address.trim(),
      };

      const response = activeId
        ? await axiosInstance.put(`/addresses/${activeId}`, payload)
        : await axiosInstance.post("/addresses", payload);

      if (activeId) {
        setAddresses((prev) => prev.map((item) => (item.id === activeId ? response.data : item)));
      } else {
        setAddresses((prev) => [response.data, ...prev]);
        setActiveId(response.data.id);
      }

      setForm({
        address_type: response.data.address_type,
        recipient_name: response.data.recipient_name,
        city_district: response.data.city_district,
        postal_code: response.data.postal_code,
        full_address: response.data.full_address,
      });
      setIsFormOpen(false);
    } catch (error) {
      const message = error?.response?.data?.message || "Gagal menyimpan alamat.";
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const target = addresses.find((item) => item.id === id);
    if (!target) return;

    const confirmed = window.confirm("Hapus alamat ini?");
    if (!confirmed) return;

    setIsSaving(true);

    try {
      await axiosInstance.delete(`/addresses/${id}`);
      const nextAddresses = addresses.filter((item) => item.id !== id);
      setAddresses(nextAddresses);

      if (activeId === id) {
        const nextPrimary = nextAddresses.find((item) => item.is_primary) || nextAddresses[0] || null;

        if (nextPrimary) {
          setActiveId(nextPrimary.id);
          setForm({
            address_type: nextPrimary.address_type || "rumah",
            recipient_name: nextPrimary.recipient_name || "",
            city_district: nextPrimary.city_district || "",
            postal_code: nextPrimary.postal_code || "",
            full_address: nextPrimary.full_address || "",
          });
          setIsFormOpen(false);
        } else {
          setActiveId(null);
          setForm(emptyForm);
          setIsFormOpen(true);
        }
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Gagal menghapus alamat.";
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  const hasAddresses = addresses.length > 0;

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Alamat Tersimpan</h1>
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm text-gray-500">
          Memuat alamat...
        </div>
      </div>
    );
  }

  return (
    <div>
      {isFormOpen && (
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm mb-6">
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 text-right mb-2">
                Kategori Alamat
              </label>
              <select
                name="address_type"
                value={form.address_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#1c54ff] focus:ring-1 focus:ring-[#1c54ff] transition-all bg-white"
              >
                {addressTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 text-right mb-2">
                Nama Lengkap Penerima
              </label>
              <input
                type="text"
                name="recipient_name"
                value={form.recipient_name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#1c54ff] focus:ring-1 focus:ring-[#1c54ff] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 text-right mb-2">
                Kota / Kecamatan
              </label>
              <input
                type="text"
                name="city_district"
                value={form.city_district}
                onChange={handleChange}
                placeholder="Pilih Kota atau Kecamatan"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#1c54ff] focus:ring-1 focus:ring-[#1c54ff] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 text-right mb-2">
                Kode Pos
              </label>
              <input
                type="text"
                name="postal_code"
                value={form.postal_code}
                onChange={handleChange}
                placeholder="Contoh: 12345"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#1c54ff] focus:ring-1 focus:ring-[#1c54ff] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 text-right mb-2">
                Alamat Lengkap
              </label>
              <textarea
                name="full_address"
                value={form.full_address}
                onChange={handleChange}
                placeholder="Nama jalan, gedung, nomor rumah, dsb."
                rows={4}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#1c54ff] focus:ring-1 focus:ring-[#1c54ff] transition-all resize-none"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {hasAddresses && (
          <div className="space-y-4">
            {addresses.map((item) => (
              <div
                key={item.id}
                className={`border rounded-2xl p-6 shadow-sm transition-colors bg-white ${
                  item.id === activeId ? "border-[#1c54ff]" : "border-gray-200 hover:border-[#1c54ff]"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 capitalize">
                      {item.address_type}
                    </h2>
                    <p className="text-gray-600 mt-2">
                      {item.recipient_name}
                    </p>
                    <p className="text-gray-600 mt-1">
                      {item.city_district} • {item.postal_code}
                    </p>
                    <p className="text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">
                      {item.full_address}
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 mt-6 text-sm font-semibold">
                  <button
                    onClick={() => startEdit(item)}
                    className="flex items-center gap-2 text-[#1c54ff] hover:text-blue-800 transition"
                  >
                    <FiEdit2 />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={isSaving}
                    className="flex items-center gap-2 text-red-500 hover:text-red-700 transition disabled:opacity-60"
                  >
                    <FiTrash2 />
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={startCreate}
            className="w-full border-2 border-dashed border-gray-300 text-gray-500 py-5 rounded-2xl text-base font-medium hover:border-[#1c54ff] hover:text-[#1c54ff] hover:bg-blue-50 transition-all flex items-center justify-center gap-3"
          >
            <FiPlus className="text-lg" />
            Tambahkan Alamat Baru
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#1c54ff] text-white py-4 rounded-2xl font-semibold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {isSaving ? "Menyimpan..." : activeId ? "Simpan Alamat" : "Simpan Alamat Baru"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Address;