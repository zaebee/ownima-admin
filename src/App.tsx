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
import { VerificationsPage } from "./pages/VerificationsPage"
import { UsersPage } from "./pages/UsersPage"
import { UserDetailPage } from "./pages/UserDetailPage"
import { RiderDetailPage } from "./pages/RiderDetailPage"
import { VehiclesPage } from "./pages/VehiclesPage"
import { VehicleDetailPage } from "./pages/VehicleDetailPage"
import { ReservationsPage } from "./pages/ReservationsPage"
import { ReservationDetailPage } from "./pages/ReservationDetailPage"
import { BillingPage } from "./pages/BillingPage"
import { TransactionDetailPage } from "./pages/TransactionDetailPage"
import { NotFoundPage } from "./pages/NotFoundPage"

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
              <Route path="verifications" element={<VerificationsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="vehicles/:id" element={<VehicleDetailPage />} />
              <Route path="reservations" element={<ReservationsPage />} />
              <Route path="reservations/:id" element={<ReservationDetailPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="transactions/:id" element={<TransactionDetailPage />} />
              <Route path="owners/:id" element={<UserDetailPage />} />
              <Route path="riders/:id" element={<RiderDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
