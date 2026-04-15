import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import LoginPage from './auth/LoginPage'
import AppLayout from './layouts/AppLayout'
import PublicLayout from './layouts/PublicLayout'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/ProfilePage'
import AdminUsersPage from './pages/AdminUsersPage'
import NotFound from './pages/NotFound'
import PublicHome from './pages/public/PublicHome'
import { rankingTheValuesRoutes, rankingTheValuesPublicRoutes } from './tools/ranking-the-values/routes'
import { spinTheWheelRoutes } from './tools/spin-the-wheel/routes'
import { careerFrameworkRoutes } from './tools/career-framework/routes'
import FullscreenLayout from './layouts/FullscreenLayout'

export default function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes (logged-in employees) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profiel" element={<ProfilePage />} />
        <Route path="/admin/gebruikers" element={<AdminUsersPage />} />
        {/* Register tool routes here */}
        {rankingTheValuesRoutes}
        {careerFrameworkRoutes}
      </Route>

      {/* Fullscreen tool routes (protected, no navbar) */}
      <Route
        element={
          <ProtectedRoute>
            <FullscreenLayout />
          </ProtectedRoute>
        }
      >
        {spinTheWheelRoutes}
      </Route>

      {/* Public routes (workshop participants, no login required) */}
      <Route element={<PublicLayout />}>
        <Route path="/publiek" element={<PublicHome />} />
        {rankingTheValuesPublicRoutes}
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
