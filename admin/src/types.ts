export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rejected';
export type ActiveStatus = 'Active' | 'Inactive';

export interface Branch {
  id: number;
  name: string;
  address?: string | null;
  rooms_count: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'Admin';
  branch?: Branch | null;
}

export interface Therapist {
  id: number;
  name: string;
  phone: string;
  photo: string;
  status: ActiveStatus;
  specialty?: string;
  experience_years?: number | null;
  room_number?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number | string;
  duration_minutes: number;
  image: string;
  status: ActiveStatus;
  category?: string;
  wax_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentDetail {
  id: number;
  appointment_id: number;
  service_id: number;
  quantity: number;
  price: string | number;
  service?: Service;
}

export interface Appointment {
  id: number;
  booking_code: string;
  user_id?: number | null;
  therapist_id: number;
  therapist?: Pick<Therapist, 'id' | 'name'>;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  location?: string | null;
  room_type?: string | null;
  room_number?: number | null;
  notes?: string | null;
  cancel_reason?: string | null;
  total_price: string | number;
  details?: AppointmentDetail[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  user_id?: number | null;
  customer_name: string;
  appointment_id: number;
  rating: number;
  comment: string;
  created_at: string;
  therapist_name?: string | null;
}

export interface Promo {
  id: number;
  tag: string;
  title: string;
  highlight_text?: string | null;
  description?: string | null;
  discount_badge?: string | null;
  valid_until?: string | null;
  cta_text?: string;
  promo_code?: string | null;
  bg_gradient?: string | null;
  accent_color?: string;
  image?: string | null;
  is_active: boolean | number;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WalkIn {
  id: number;
  date: string;
  customer_name: string;
}