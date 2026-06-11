import axios from 'axios';

// Bikin pondasi kabel utama ke Backend
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Alamat dasar BE
  withCredentials: true, // Penting kalau BE pakai sistem Cookie/Session
});

// Satpam otomatis: Kalau ada token di browser, langsung selipin ke setiap request FE
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;