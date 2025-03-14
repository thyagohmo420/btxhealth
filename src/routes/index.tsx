import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { DefaultLayout } from '../components/layouts/DefaultLayout';

// Pages
import Dashboard from '../pages/Dashboard';
import Reception from '../pages/Reception';
import Triage from '../pages/Triage';
import MedicalOffice from '../pages/MedicalOffice';
import MedicalRecords from '../pages/MedicalRecords';
import Appointments from '../pages/Appointments';
import Patients from '../pages/Patients';
import ServiceManagement from '../pages/ServiceManagement';
import Professionals from '../pages/Professionals';
import Notifications from '../pages/Notifications';
import Settings from '../pages/Settings';
import Sectors from '../pages/Sectors';
import Nursing from '../pages/Nursing';
import Vaccines from '../pages/Vaccines';
import Pharmacy from '../pages/Pharmacy';
import Telemedicine from '../pages/Telemedicine';
import Monitoring from '../pages/Monitoring';
import Education from '../pages/Education';
import Reports from '../pages/Reports';
import TVDisplay from '../pages/TVDisplay';

export function Router() {
  return (
    <Routes>
      <Route element={<DefaultLayout><Outlet /></DefaultLayout>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reception" element={<Reception />} />
        <Route path="/triage" element={<Triage />} />
        <Route path="/medical-office" element={<MedicalOffice />} />
        <Route path="/medical-records" element={<MedicalRecords />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/service-management" element={<ServiceManagement />} />
        <Route path="/professionals" element={<Professionals />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/sectors" element={<Sectors />} />
        <Route path="/nursing" element={<Nursing />} />
        <Route path="/vaccines" element={<Vaccines />} />
        <Route path="/pharmacy" element={<Pharmacy />} />
        <Route path="/telemedicine" element={<Telemedicine />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/education" element={<Education />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/tv" element={<TVDisplay />} />
      </Route>
    </Routes>
  );
} 