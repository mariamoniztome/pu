import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { CalendarPage } from './pages/CalendarPage';
import { ConsultationsPage } from './pages/ConsultationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { PaymentsPage } from './pages/PaymentsPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="consultations" element={<ConsultationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
