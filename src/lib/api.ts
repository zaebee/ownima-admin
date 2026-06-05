/// <reference types="vite/client" />
import axios from "axios";

// Создаем инстанс axios с базовым URL из переменных окружения
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

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
  (error) => {
    if (error.response && error.response.status === 401) {
      // Если токен истек или недействителен, удаляем его
      localStorage.removeItem("admin_token");
      localStorage.removeItem("impersonate_token");
      localStorage.removeItem("impersonated_user_info");
      
      // Диспатчим кастомное событие, чтобы AuthContext или Router могли мягко перенаправить пользователя
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);
