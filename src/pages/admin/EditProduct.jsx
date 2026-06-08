import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FiUploadCloud, FiArrowLeft, FiLoader } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import { compressImage } from "../../utils/imageCompressor";
import { PRODUCT_CATEGORIES } from "../../data/categories";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const fileInputRef2 = useRef(null);
  const fileInputRef3 = useRef(null);
  const fileInputRef4 = useRef(null);
  
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    sku_code: "",
    price: "",
    stock: "",
    description: "",
    visibility_status: "active",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [imageFile2, setImageFile2] = useState(null);
  const [imagePreview2, setImagePreview2] = useState(null);

  const [imageFile3, setImageFile3] = useState(null);
  const [imagePreview3, setImagePreview3] = useState(null);

  const [imageFile4, setImageFile4] = useState(null);
  const [imagePreview4, setImagePreview4] = useState(null);

  // Fetch product on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoadingProduct(true);
        const response = await axiosInstance.get(`/products/${id}`);
        const p = response.data;
        setFormData({
          name: p.name || "",
          category: p.category || "",
          sku_code: p.sku_code || "",
          price: p.price || "",
          stock: p.stock || "",
          description: p.description || "",
          visibility_status: p.visibility_status || "active",
        });
        if (p.image?.url) {
          setImagePreview(p.image.url);
        }
        if (p.image2?.url) {
          setImagePreview2(p.image2.url);
        }
        if (p.image3?.url) {
          setImagePreview3(p.image3.url);
        }
        if (p.image4?.url) {
          setImagePreview4(p.image4.url);
        }
      } catch (error) {
        console.error("Gagal memuat produk:", error);
        alert("Gagal memuat detail produk.");
        navigate("/admin/products");
      } finally {
        setIsLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (file) => {
    if (file && file.size <= 5 * 1024 * 1024) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else if (file) {
      alert("File terlalu besar. Maksimum 5MB.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleImageSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoadingStep("Memperbarui detail produk...");

    try {
      // Step 1: Update product details
      const productData = {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description || "",
        category: formData.category || "Uncategorized",
        sku_code: formData.sku_code || null,
        visibility_status: formData.visibility_status,
      };

      await axiosInstance.put(`/products/${id}`, productData);

      // Step 2: Replace images if new ones are selected
      const hasNewImages = imageFile || imageFile2 || imageFile3 || imageFile4;
      if (hasNewImages) {
        setLoadingStep("Mengompresi gambar...");
        const imgFormData = new FormData();

        if (imageFile) {
          const compressed = await compressImage(imageFile, 1024, 1024, 0.7);
          imgFormData.append("image", compressed);
        }
        if (imageFile2) {
          const compressed = await compressImage(imageFile2, 1024, 1024, 0.7);
          imgFormData.append("image2", compressed);
        }
        if (imageFile3) {
          const compressed = await compressImage(imageFile3, 1024, 1024, 0.7);
          imgFormData.append("image3", compressed);
        }
        if (imageFile4) {
          const compressed = await compressImage(imageFile4, 1024, 1024, 0.7);
          imgFormData.append("image4", compressed);
        }

        setLoadingStep("Mengunggah gambar ke cloud...");
        await axiosInstance.put(`/products/photo/${id}`, imgFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setLoadingStep("Selesai!");
      alert("Produk berhasil diperbarui!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Gagal memperbarui produk:", error);
      alert(error.response?.data?.message || "Terjadi kesalahan saat memperbarui produk.");
    } finally {
      setIsSubmitting(false);
      setLoadingStep("");
    }
  };

  const categories = PRODUCT_CATEGORIES;

  if (isLoadingProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <FiLoader className="animate-spin text-[#0a1e5e] mb-2" size={40} />
        <p className="text-gray-500 font-semibold">Memuat detail produk...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/admin" className="hover:text-blue-600 hover:underline transition-colors">Admin</Link>
        <span>›</span>
        <Link to="/admin/products" className="hover:text-blue-600 hover:underline transition-colors">Products</Link>
        <span>›</span>
        <span className="font-bold text-gray-800">Edit Product</span>
      </div>

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={() => navigate("/admin/products")}
          className="p-2 bg-white rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700 transition"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>
      </div>
      <p className="text-gray-500 mb-8 ml-11">Update the details below to edit the product catalog.</p>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl p-8 shadow">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT: Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Premium Pork Gyoza 500g"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              {/* Category + SKU */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SKU Code</label>
                  <input
                    type="text"
                    name="sku_code"
                    value={formData.sku_code}
                    onChange={handleInputChange}
                    placeholder="E.G. GY-PRK-500"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500">Rp</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe the product, ingredients, and cooking instructions..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition"
                />
              </div>
            </div>

            {/* RIGHT: Image Upload + Visibility */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image (Main)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors min-h-[200px] flex flex-col items-center justify-center ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative group w-full h-full flex items-center justify-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-40 rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg text-white font-medium text-xs">
                        Ganti Gambar
                      </div>
                    </div>
                  ) : (
                    <>
                      <FiUploadCloud className="text-blue-600 mb-3" size={40} />
                      <p className="text-blue-600 font-semibold text-sm">Click to upload or drag and drop</p>
                      <p className="text-gray-400 text-xs mt-1">SVG, PNG, JPG or GIF (Max 5MB)</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Additional Images (2, 3, 4) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Images (Optional)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { file: imageFile2, preview: imagePreview2, setFile: setImageFile2, setPreview: setImagePreview2, ref: fileInputRef2, label: "Foto 2" },
                    { file: imageFile3, preview: imagePreview3, setFile: setImageFile3, setPreview: setImagePreview3, ref: fileInputRef3, label: "Foto 3" },
                    { file: imageFile4, preview: imagePreview4, setFile: setImageFile4, setPreview: setImagePreview4, ref: fileInputRef4, label: "Foto 4" }
                  ].map((item, idx) => (
                    <div key={idx} className="relative">
                      <div
                        onClick={() => item.ref.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors overflow-hidden"
                      >
                        {item.preview ? (
                          <img
                            src={item.preview}
                            alt={item.label}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-2">
                            <FiUploadCloud className="text-gray-400 mx-auto mb-1" size={20} />
                            <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                          </div>
                        )}
                      </div>
                      <input
                        ref={item.ref}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size <= 5 * 1024 * 1024) {
                            item.setFile(file);
                            item.setPreview(URL.createObjectURL(file));
                          } else if (file) {
                            alert("File terlalu besar. Maksimum 5MB.");
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Visibility Status */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-700 mb-4">Visibility Status</h3>
                <label className="flex items-start gap-3 cursor-pointer mb-4">
                  <input
                    type="radio"
                    name="visibility_status"
                    value="active"
                    checked={formData.visibility_status === "active"}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Active</p>
                    <p className="text-gray-500 text-xs">Product will be visible to customers immediately.</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility_status"
                    value="draft"
                    checked={formData.visibility_status === "draft"}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Draft</p>
                    <p className="text-gray-500 text-xs">Save as draft. Will not be visible in store.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-lg font-bold text-white transition shadow ${
              isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-[#0a1e5e] hover:bg-blue-900"
            }`}
          >
            {isSubmitting ? (loadingStep || "Menyimpan...") : "Save & Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
