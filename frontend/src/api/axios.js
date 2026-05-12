import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8001",
  timeout: 30000, // 30 s — prevents loadReports/loadStats hanging forever if backend stalls
});

// MES API — used exclusively for authentication
export const mesApi = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 15000,
});

// Inject stored MES token into all ERP backend requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
