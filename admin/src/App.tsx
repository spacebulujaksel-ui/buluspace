import { Route, Routes, Navigate } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Schedule from './pages/Schedule';
import Chat from './pages/Chat';
import Therapists from './pages/Therapists';
import Services from './pages/Services';
import Promos from './pages/Promos';
import Reviews from './pages/Reviews';
import Email from './pages/Email';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/therapists" element={<Therapists />} />
        <Route path="/services" element={<Services />} />
        <Route path="/promos" element={<Promos />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/email" element={<Email />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}