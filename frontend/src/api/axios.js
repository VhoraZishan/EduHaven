import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// 🔐 Attach token automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
export const BACKEND_URL = "http://localhost:8000";
