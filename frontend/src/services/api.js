import axios from "axios";

const api = axios.create({
<<<<<<< HEAD
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dashboard_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("dashboard_token");
      localStorage.removeItem("dashboard_user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      (error.request
        ? "Não foi possível conectar ao servidor"
        : "Erro inesperado na aplicação");

    return Promise.reject(new Error(message));
  }
);

=======
  baseURL: "http://127.0.0.1:8000",
});

>>>>>>> c57a7228d900d0db50b76e941e71cd9a3d700f4f
export default api;