import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    // Если не авторизован, перенаправляем на страницу входа
    return <Navigate to="/login" replace />
  }

  // Если авторизован, рендерим дочерние маршруты (Layout и страницы)
  return <Outlet />
}
