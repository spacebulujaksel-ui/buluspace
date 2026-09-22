import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PromoSlider } from './components/PromoSlider';
import { FacilityShowcase } from './components/FacilityShowcase';
import { ServicesMenu } from './components/ServicesMenu';
import { WhyUs } from './components/WhyUs';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { LocationBranches } from './components/LocationBranches';
import { BookingModal } from './components/BookingModal';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { TrackBookingModal } from './components/TrackBookingModal';
import { DataProvider } from './hooks/useData';
import { SavedBooking } from './types';
import { appointmentToSavedBooking, ServerBooking } from './lib/booking';
import { api } from './lib/api';
import { buildWaLink } from './lib/wa';
import { FaqPage } from './components/FaqPage';
import { Calendar, MessageCircle } from 'lucide-react';

export default function App() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isTrackOpen, setIsTrackOpen] = useState<boolean>(false);
  const [activePromoCode, setActivePromoCode] = useState<string>('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [latestBooking, setLatestBooking] = useState<SavedBooking | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState<boolean>(false);
  const [savedBookings, setSavedBookings] = useState<SavedBooking[]>([]);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [route, setRoute] = useState<string>(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const isFaqPage = route === '#faq';
  const goToFaq = () => {
    setChatOpen(false);
    window.location.hash = 'faq';
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bulu_space_bookings');
      if (stored) setSavedBookings(JSON.parse(stored));
    } catch (e) {
      console.warn('Could not read saved bookings:', e);
    }
  }, []);

  useEffect(() => {
    if (savedBookings.length === 0) return;
    let cancelled = false;
    (async () => {
      const refreshed = await Promise.all(
        savedBookings.map(async (b) => {
          try {
            const res = await api.get<{ booking: ServerBooking }>(`/bookings/${encodeURIComponent(b.id)}`);
            return { ...appointmentToSavedBooking(res.booking), createdAt: b.createdAt };
          } catch {
            return b;
          }
        })
      );
      if (cancelled) return;
      setSavedBookings(refreshed);
      try {
        localStorage.setItem('bulu_space_bookings', JSON.stringify(refreshed));
      } catch (e) {
        console.warn('Could not persist refreshed bookings:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClaimPromo = (promoCode: string, promoTitle: string) => {
    setActivePromoCode(promoCode);
    setIsBookingModalOpen(true);
  };

  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleBookingSuccess = (booking: SavedBooking) => {
    setLatestBooking(booking);
    const updated = [booking, ...savedBookings];
    setSavedBookings(updated);
    try {
      localStorage.setItem('bulu_space_bookings', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not persist booking:', e);
    }
    setIsBookingModalOpen(false);
    setIsConfirmationOpen(true);
  };

  const handleBookingCancelled = (bookingId: string) => {
    if (latestBooking?.id === bookingId) {
      setLatestBooking({ ...latestBooking, status: 'Cancelled' });
    }
    setSavedBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
    try {
      localStorage.setItem(
        'bulu_space_bookings',
        JSON.stringify(savedBookings.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b)))
      );
    } catch (e) {
      console.warn('Could not persist cancellation:', e);
    }
  };

  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col bg-white text-neutral-800 selection:bg-pink-100 selection:text-neutral-900">
      {/* Announcement Bar - Temporarily Hidden */}
      {/* <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-neutral-50 border-b border-neutral-200 text-xs px-4 text-center text-neutral-500 flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0"></span>
        <span>
          Promo Spesial: Diskon 30% First Timer · kode{' '}
          <span className="font-mono font-semibold text-neutral-700">FIRSTBULU30</span>
        </span>
        <button
          onClick={() => handleClaimPromo('FIRSTBULU30', 'First Time Special')}
          className="ml-1 text-pink-500 hover:text-pink-600 font-medium hidden sm:inline"
        >
          Klaim →
        </button>
      </div> */}

      <Navbar
        onOpenBooking={() => setIsBookingModalOpen(true)}
        onOpenTrack={() => setIsTrackOpen(true)}
        onOpenFaq={goToFaq}
      />

      {isFaqPage ? (
        <FaqPage />
      ) : (
      <main className="flex-1">
        <PromoSlider onClaimPromo={handleClaimPromo} />

        <WhyUs />

        <ServicesMenu
          selectedServiceIds={selectedServiceIds}
          onToggleService={handleToggleService}
          onProceedToBooking={() => setIsBookingModalOpen(true)}
        />

        <LocationBranches />

        <FacilityShowcase />
        <Testimonials />

        {/* CTA Section */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="max-w-4xl mx-auto rounded-2xl bg-neutral-900 px-6 py-12 sm:py-16 text-center">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Siap Merasakan Kulit Mulus Bebas Bulu?
              </h2>
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-xl mx-auto">
                Jadwalkan sesi waxing Anda sekarang. Pilih terapis favorit atau request terapis
                dengan kriteria khusus demi kenyamanan maksimal.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="px-6 py-3 rounded-lg bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-100 transition-colors flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Reservasi Sekarang
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      )}

      {/* Floating Booking Badge */}
      {savedBookings.length > 0 && (
        <button
          onClick={() => {
            setLatestBooking(savedBookings[0]);
            setIsConfirmationOpen(true);
          }}
          className="fixed bottom-5 left-5 z-40 bg-white text-neutral-700 px-3.5 py-2 rounded-lg border border-neutral-200 shadow-sm flex items-center gap-2 hover:bg-neutral-50 transition-colors text-xs font-medium"
          title="Lihat Tiket Reservasi"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Tiket #{savedBookings[0].id}
        </button>
      )}

      <Footer onOpenFaq={goToFaq} />

      {/* Floating WhatsApp Chat */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3">
        {chatOpen && (
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-lg p-2 min-w-52">
            <a
              href={buildWaLink(
                "Halo Admin Bulu Space Jakarta Barat, saya mau konsultasi layanan waxing",
                "Jakarta Barat",
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setChatOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-neutral-700 hover:bg-neutral-50"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              WhatsApp Jakarta Barat
            </a>
            <a
              href={buildWaLink(
                "Halo Admin Bulu Space Jakarta Selatan, saya mau konsultasi layanan waxing",
                "Jakarta Selatan",
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setChatOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-neutral-700 hover:bg-neutral-50"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              WhatsApp Jakarta Selatan
            </a>
          </div>
        )}
        <button
          onClick={() => setChatOpen((o) => !o)}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group"
          aria-label="Chat WhatsApp"
          aria-expanded={chatOpen}
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white/20" />
          <span className="absolute right-16 bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
            Chat WhatsApp
          </span>
        </button>
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialPromoCode={activePromoCode}
        initialServiceIds={selectedServiceIds}
        onBookingSuccess={handleBookingSuccess}
      />

      <BookingConfirmationModal
        isOpen={isConfirmationOpen}
        booking={latestBooking}
        onClose={() => {
          setIsConfirmationOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onBookingCancelled={handleBookingCancelled}
      />

      <TrackBookingModal
        isOpen={isTrackOpen}
        onClose={() => setIsTrackOpen(false)}
        onBookingCancelled={handleBookingCancelled}
      />
      </div>
    </DataProvider>
  );
}
