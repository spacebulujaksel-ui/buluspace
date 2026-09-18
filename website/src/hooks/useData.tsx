import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../lib/api';
import { PromoBanner, Review, Therapist, WaxService } from '../types';
import { PROMO_BANNERS, THERAPISTS as MOCK_THERAPISTS, SERVICES as MOCK_SERVICES, REVIEWS as MOCK_REVIEWS } from '../data/mockData';

interface PublicData {
  promos: PromoBanner[];
  services: WaxService[];
  therapists: Therapist[];
  reviews: Review[];
  ready: boolean;
}

const DataCtx = createContext<PublicData>({
  promos: PROMO_BANNERS,
  services: MOCK_SERVICES,
  therapists: MOCK_THERAPISTS,
  reviews: MOCK_REVIEWS,
  ready: false,
});

export const useData = () => useContext(DataCtx);

function mapPromo(p: Record<string, any>): PromoBanner {
  return {
    id: String(p.id),
    tag: p.tag,
    title: p.title,
    highlightText: p.highlight_text ?? '',
    description: p.description ?? '',
    discountBadge: p.discount_badge || undefined,
    validUntil: p.valid_until ?? '',
    ctaText: p.cta_text ?? 'BOOK NOW',
    promoCode: p.promo_code ?? undefined,
    bgGradient: p.bg_gradient ?? 'from-slate-900 via-zinc-800 to-slate-900',
    accentColor: p.accent_color ?? '#fa9c9e',
    image: p.image,
  };
}

function mapTherapist(t: Record<string, any>): Therapist {
  return {
    id: String(t.id),
    name: t.name,
    nickname: t.name.split(' ')[0],
    role: t.specialty ?? 'Aesthetician',
    experienceYears: t.experience_years ?? 0,
    rating: 5,
    totalTreatments: 0,
    avatar: '',
    bio: t.specialty ?? '',
    specialties: [],
    preferredWax: '',
    temperament: '',
    availableToday: true,
    nextAvailableSlot: '',
    isPopular: false,
    branch: t.branch?.name ?? 'Jakarta Barat',
  };
}

function mapService(s: Record<string, any>): WaxService {
  return {
    id: String(s.id),
    category: s.category,
    name: s.name,
    description: s.description ?? '',
    durationMinutes: s.duration_minutes,
    price: Number(s.price),
    waxType: s.wax_type ?? '',
    isPopular: false,
  };
}

function mapReview(r: Record<string, any>): Review {
  return {
    id: String(r.id),
    clientName: r.client_name ?? 'Customer',
    date: r.created_at ?? '',
    rating: r.rating,
    treatment: '',
    therapistName: r.therapist_name ?? 'Bulu Space',
    comment: r.comment,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PublicData>({
    promos: PROMO_BANNERS,
    services: MOCK_SERVICES,
    therapists: MOCK_THERAPISTS,
    reviews: MOCK_REVIEWS,
    ready: false,
  });

  useEffect(() => {
    const load = async () => {
      const [promos, services, therapists, reviews] = await Promise.allSettled([
        api.get<any[]>('/promos'),
        api.get<any[]>('/services'),
        api.get<any[]>('/therapists'),
        api.get<any[]>('/reviews'),
      ]);

      setData((prev) => ({
        promos: promos.status === 'fulfilled' ? promos.value.filter((p) => p.is_active !== false).map(mapPromo) : prev.promos,
        services: services.status === 'fulfilled' ? services.value.filter((s) => s.status === 'Active').map(mapService) : prev.services,
        therapists: therapists.status === 'fulfilled' ? therapists.value.filter((t) => t.status === 'Active').map(mapTherapist) : prev.therapists,
        reviews: reviews.status === 'fulfilled' && reviews.value.length > 0 ? reviews.value.map(mapReview) : prev.reviews,
        ready: true,
      }));
    };

    load();
  }, []);

  return <DataCtx.Provider value={data}>{children}</DataCtx.Provider>;
}