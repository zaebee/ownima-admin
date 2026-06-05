/// <reference types="vite/client" />
import axios from "axios";

// Создаем инстанс axios с базовым URL из переменных окружения
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });

  failedQueue = [];
};

// Добавляем токен авторизации к каждому запросу
api.interceptors.request.use((config) => {
  const impToken = localStorage.getItem("impersonate_token");
  const token = impToken || localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обрабатываем ошибки авторизации (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      const isImpersonating = !!localStorage.getItem("impersonate_token");
      const refreshToken = localStorage.getItem("admin_refresh_token");

      if (refreshToken && !isImpersonating) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(api(originalRequest));
              },
              reject: (err: any) => {
                reject(err);
              },
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post(
            `${api.defaults.baseURL}/auth/refresh-token`,
            { refresh_token: refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (res.status === 200 || res.status === 201) {
            const { access_token, refresh_token } = res.data;
            
            localStorage.setItem("admin_token", access_token);
            if (refresh_token) {
              localStorage.setItem("admin_refresh_token", refresh_token);
            }

            api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
            originalRequest.headers.Authorization = `Bearer ${access_token}`;

            processQueue(null, access_token);
            isRefreshing = false;

            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;

          // Если обновление токена не удалось, выходим из системы
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_refresh_token");
          localStorage.removeItem("impersonate_token");
          localStorage.removeItem("impersonated_user_info");
          
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
          return Promise.reject(refreshError);
        }
      } else {
        // Если рефреш-токена нет или мы имперсонируем пользователя
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_refresh_token");
        localStorage.removeItem("impersonate_token");
        localStorage.removeItem("impersonated_user_info");
        
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);
