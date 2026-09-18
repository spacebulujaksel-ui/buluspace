import { SavedBooking } from '../types';

interface ServerService {
  name?: string;
}

interface ServerDetail {
  id: number;
  service_id: number;
  service?: ServerService;
}

export interface ServerBooking {
  booking_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  customer_gender?: string | null;
  therapist_id: number;
  therapist?: { id: number; name: string } | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rejected';
  location?: string | null;
  notes?: string | null;
  cancel_reason?: string | null;
  total_price: number | string;
  details?: ServerDetail[];
  created_at?: string;
}

export const STATUS_MAP: Record<ServerBooking['status'], SavedBooking['status']> = {
  Pending: 'Menunggu WhatsApp',
  Confirmed: 'Dikonfirmasi',
  Completed: 'Selesai',
  Cancelled: 'Cancelled',
  Rejected: 'Ditolak',
};

const formatDate = (date: string) => {
  const d = new Date(date.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

export const appointmentToSavedBooking = (apt: ServerBooking): SavedBooking => ({
  id: apt.booking_code,
  clientName: apt.customer_name,
  clientPhone: apt.customer_phone,
  clientEmail: apt.customer_email ?? '',
  customerGender: (apt.customer_gender as SavedBooking['customerGender']) ?? 'Wanita',
  selectedServices: (apt.details ?? []).map((d) => String(d.service_id)),
  therapistId: String(apt.therapist_id),
  customTherapistRequest: apt.notes ?? '',
  location: apt.location ?? null,
  date: formatDate(apt.appointment_date),
  timeSlot: `${apt.start_time.slice(0, 5)} – ${apt.end_time.slice(0, 5)} WIB`,
  promoCode: '',
  specialNotes: '',
  createdAt: apt.created_at ?? new Date().toISOString(),
  totalPrice: Number(apt.total_price),
  discountAmount: 0,
  finalPrice: Number(apt.total_price),
  therapistName: apt.therapist?.name ?? 'Rekomendasi Bulu Space',
  serviceNames: (apt.details ?? []).map((d) => d.service?.name ?? `Layanan #${d.service_id}`),
  status: STATUS_MAP[apt.status] ?? 'Menunggu WhatsApp',
});