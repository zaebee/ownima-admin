/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Layout } from "./components/layout/Layout"
import { LoginPage } from "./pages/LoginPage"
import { Dashboard } from "./pages/Dashboard"
import { UsersPage } from "./pages/UsersPage"
import { UserDetailPage } from "./pages/UserDetailPage"
import { RiderDetailPage } from "./pages/RiderDetailPage"
import { SettingsPage } from "./pages/SettingsPage"
import { VehiclesPage } from "./pages/VehiclesPage"
import { VehicleDetailPage } from "./pages/VehicleDetailPage"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Публичный маршрут для входа */}
          <Route path="/login" element={<LoginPage />} />

          {/* Защищенные маршруты админки */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="vehicles/:id" element={<VehicleDetailPage />} />
              <Route path="owners/:id" element={<UserDetailPage />} />
              <Route path="riders/:id" element={<RiderDetailPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
