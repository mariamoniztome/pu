import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PatientsPage } from './pages/dashboard/PatientsPage';
import { AppointmentsPage } from './pages/dashboard/AppointmentsPage';
import { CalendarPage } from './pages/dashboard/CalendarPage';
import { ConsultationsPage } from './pages/dashboard/ConsultationsPage';
import { ReportsPage } from './pages/dashboard/ReportsPage';
import { PaymentsPage } from './pages/dashboard/PaymentsPage';
import { DoctorsPage } from './pages/dashboard/DoctorsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="consultations" element={<ConsultationsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="doctors" element={<DoctorsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
