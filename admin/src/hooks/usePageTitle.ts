import { useLocation } from 'react-router-dom';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/bookings': 'Manajemen Booking',
  '/therapists': 'Manajemen Terapis',
  '/services': 'Manajemen Layanan',
  '/promos': 'Manajemen Promo',
  '/reviews': 'Manajemen Ulasan',
};

export function usePageTitle() {
  const { pathname } = useLocation();
  return TITLES[pathname] ?? 'Bulu Space Admin';
}