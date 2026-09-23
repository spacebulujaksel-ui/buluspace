export interface PromoBanner {
  id: string;
  tag: string;
  title: string;
  highlightText: string;
  description: string;
  discountBadge?: string;
  validUntil: string;
  ctaText: string;
  promoCode?: string;
  bgGradient: string;
  accentColor: string;
  image: string;
}

export interface Therapist {
  id: string;
  name: string;
  nickname: string;
  role: string;
  experienceYears: number;
  rating: number;
  totalTreatments: number;
  avatar: string;
  bio: string;
  specialties: string[];
  preferredWax: string;
  temperament: string; // e.g. "Tenang & Telaten", "Ramah & Ceria"
  availableToday: boolean;
  nextAvailableSlot: string;
  isPopular?: boolean;
  branch?: string;
  onLeave?: boolean;
}

export interface WaxService {
  id: string;
  category: 'intimate' | 'body' | 'legs' | 'face' | 'package' | 'arms' | 'upper';
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  waxType: 'Organic Soft Honey' | 'Gentle Film Hard Wax' | 'Soothing Treatment';
  lastOrderTime?: string | null;
  isPopular?: boolean;
  recommendedFor?: string;
}

export interface BookingFormData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  customerGender: 'Pria' | 'Wanita';
  selectedServices: string[];
  therapistId: string; // 'any' or specific therapist ID
  customTherapistRequest: string; // e.g., "Minta yang sabar karena saya first-timer"
  location: string;
  date: string;
  timeSlot: string;
  promoCode: string;
  specialNotes: string;
}

export interface SavedBooking extends BookingFormData {
  id: string;
  createdAt: string;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  therapistName: string;
  serviceNames: string[];
  status: 'Dikonfirmasi' | 'Menunggu WhatsApp' | 'Selesai' | 'Cancelled' | 'Ditolak';
}

export interface Review {
  id: string;
  clientName: string;
  date: string;
  rating: number;
  treatment: string;
  therapistName: string;
  comment: string;
  avatar?: string;
}

export interface FaqItem {
  id: number;
  q: string;
  a: string;
}
