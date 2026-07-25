import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useBrandingDocumentSync } from './hooks/useBrandingDocumentSync';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/marketing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { AcceptInvitePage } from './pages/auth/AcceptInvitePage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PatientsPage } from './pages/dashboard/PatientsPage';
import { CalendarPage } from './pages/dashboard/CalendarPage';
import { ReportsPage } from './pages/dashboard/ReportsPage';
import { PaymentsPage } from './pages/dashboard/PaymentsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

// Renders the public landing page for signed-out visitors at "/", the
// dashboard layout for authenticated users, or bounces to /login (preserving
// the deep link) for any other path when signed out.
function HomeGate() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (location.pathname === '/') {
      return <LandingPage />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout />;
}

function AppRoutes() {
  useBrandingDocumentSync();

  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />

        {/* "/" is the landing page when signed out, the dashboard layout when signed in */}
        <Route path="/" element={<HomeGate />}>
          <Route index element={<DashboardPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="appointments" element={<Navigate to="/consultations" replace />} />
          <Route path="calendar" element={<Navigate to="/consultations" replace />} />
          <Route path="consultations" element={<CalendarPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="doctors" element={<Navigate to="/settings" replace />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
