import React from 'react';
import { Search, Ticket, Loader2, X } from 'lucide-react';
import { api } from '../lib/api';
import { appointmentToSavedBooking, ServerBooking } from '../lib/booking';
import { SavedBooking } from '../types';
import { BookingConfirmationModal } from './BookingConfirmationModal';

interface TrackBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCancelled?: (bookingId: string) => void;
}

export const TrackBookingModal: React.FC<TrackBookingModalProps> = ({
  isOpen,
  onClose,
  onBookingCancelled,
}) => {
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [result, setResult] = React.useState<SavedBooking | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = code.trim().toUpperCase();
    if (!raw) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.get<{ booking: ServerBooking }>(`/bookings/${encodeURIComponent(raw)}`);
      setResult(appointmentToSavedBooking(res.booking));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kode tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      {result ? (
        <BookingConfirmationModal
          isOpen={true}
          booking={result}
          onClose={() => {
            setResult(null);
            setCode('');
          }}
          onBookingCancelled={(bookingId) => {
            setResult((prev) => (prev && prev.id === bookingId ? { ...prev, status: 'Cancelled' } : prev));
            onBookingCancelled?.(bookingId);
          }}
        />
      ) : (
        <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-auto">
          <div className="bg-slate-900 text-white px-5 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-400/20 border border-pink-400/40 text-pink-300 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight font-['Poppins']">Lacak Booking</h3>
                <p className="text-xs text-slate-400">Lihat tiket reservasi kamu kapan saja, di device mana pun</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSearch} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kode Booking
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="BS-123456"
                autoFocus
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Kode ada di tiket setelah kamu selesai booking. Contoh: BS-363973
              </p>
            </div>

            {error && (
              <p className="text-[11px] text-rose-700 italic">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-default"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Cari Tiket
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
            >
              Nanti Saja
            </button>
          </form>
        </div>
      )}
    </div>
  );
};