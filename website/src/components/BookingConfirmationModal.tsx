import React from "react";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Share2,
  X,
  Download,
  Copy,
  Check,
  Ban,
  Loader2,
} from "lucide-react";
import { api } from "../lib/api";
import { SavedBooking } from "../types";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  booking: SavedBooking | null;
  onClose: () => void;
  onBookingCancelled?: (bookingId: string) => void;
}

export const BookingConfirmationModal: React.FC<
  BookingConfirmationModalProps
> = ({ isOpen, booking, onClose, onBookingCancelled }) => {
  const [copied, setCopied] = React.useState(false);
  const [showCancel, setShowCancel] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [cancelling, setCancelling] = React.useState(false);
  const [cancelError, setCancelError] = React.useState("");

  if (!isOpen || !booking) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(booking.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCancelBooking = async () => {
    setCancelling(true);
    setCancelError("");
    try {
      await api.post(`/bookings/${encodeURIComponent(booking.id)}/cancel`, {
        reason: cancelReason.trim(),
        customer_phone: booking.clientPhone,
      });
      setCancelling(false);
      setShowCancel(false);
      onBookingCancelled?.(booking.id);
    } catch (e) {
      setCancelling(false);
      const msg = e instanceof Error ? e.message : "Gagal membatalkan booking.";
      setCancelError(msg);
    }
  };

  const isCancelled = booking.status === "Cancelled";
  const isRejected = booking.status === "Ditolak";

  const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    "Menunggu WhatsApp": { label: "Menunggu Konfirmasi", cls: "bg-amber-400/15 text-amber-300 border-amber-400/40" },
    Dikonfirmasi: { label: "Dikonfirmasi", cls: "bg-emerald-400/15 text-emerald-300 border-emerald-400/40" },
    Selesai: { label: "Selesai", cls: "bg-sky-400/15 text-sky-300 border-sky-400/40" },
    Cancelled: { label: "Dibatalkan", cls: "bg-rose-400/15 text-rose-300 border-rose-400/40" },
    Ditolak: { label: "Ditolak", cls: "bg-red-400/15 text-red-300 border-red-400/40" },
  };
  const badge = STATUS_BADGE[booking.status] ?? null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden relative text-slate-800 my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Celebration Card */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6 text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-full bg-pink-400/20 border border-pink-400/40 text-pink-300 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold font-['Poppins']">
            Reservasi Berhasil Diajukan!
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Permintaan reservasi & request terapis Anda telah tercatat di sistem
            Bulu Space. Mohon tetap simpan bukti transaksi anda untuk keperluan
            verivikasi.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-mono">
            <span className="text-slate-400">Kode Booking:</span>
            <span className="font-bold text-pink-300">{booking.id}</span>
            <button
              onClick={handleCopyCode}
              className="text-slate-400 hover:text-white ml-1"
              title="Salin Kode"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {badge && (
            <span className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold ${badge.cls}`}>
              {badge.label}
            </span>
          )}
        </div>

        {/* Booking Details Ticket */}
        <div className="p-6 space-y-4 text-xs">
          {/* Therapist Info */}
          <div className="p-3.5 rounded-2xl bg-pink-50/60 border border-pink-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-200/80 flex items-center justify-center text-pink-700 shrink-0">
              <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
            </div>
            <div>
              <p className="text-[11px] text-pink-800 font-semibold">
                Terapis yang Di-request:
              </p>
              <p className="text-xs font-bold text-slate-900">
                {booking.therapistName}
              </p>
              {booking.customTherapistRequest && (
                <p className="text-[10px] text-slate-500 italic mt-0.5">
                  Catatan: "{booking.customTherapistRequest}"
                </p>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-2 text-slate-700">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block mb-1">
                Tanggal Kedatangan
              </span>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-500" />
                {booking.date}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block mb-1">
                Jam Treatment
              </span>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-pink-500" />
                {booking.timeSlot}
              </p>
            </div>
          </div>

          {/* Services List */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="text-[11px] font-semibold text-slate-500 mb-1">
              Treatment:
            </p>
            {booking.serviceNames.map((name, i) => (
              <p
                key={i}
                className="font-medium text-slate-800 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                {name}
              </p>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="text-slate-500 font-medium">Estimasi Biaya:</span>
            <span className="text-base font-bold font-mono text-slate-900">
              {formatRupiah(booking.finalPrice)}
            </span>
          </div>

          {/* Location details */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Cabang Studio Bulu Space: {booking.location ?? "Jakarta Barat"}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 pt-0 space-y-2">
          {isCancelled || isRejected ? (
            <div className="w-full py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs flex items-center justify-center gap-2">
              <Ban className="w-4 h-4" />
              {isRejected ? 'Booking ini ditolak oleh admin' : 'Booking ini telah dibatalkan'}
            </div>
          ) : (
            <>
              {showCancel ? (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2.5">
                  <p className="text-[11px] font-semibold text-rose-700">
                    Batalkan booking {booking.id}? Pembatalan bisa dilakukan kapan saja sebelum treatment selesai.
                  </p>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Alasan pembatalan (opsional)"
                    rows={2}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                  />
                  {cancelError && (
                    <p className="text-[11px] text-rose-700 italic">
                      {cancelError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowCancel(false);
                        setCancelError("");
                      }}
                      disabled={cancelling}
                      className="flex-1 py-2 rounded-lg border border-rose-200 text-rose-600 text-[11px] font-semibold hover:bg-white disabled:opacity-60"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={handleCancelBooking}
                      disabled={cancelling}
                      className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      {cancelling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Ban className="w-3.5 h-3.5" />
                      )}
                      Yakin Batalkan
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCancel(true)}
                  className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" />
                    Batalkan Booking
                  </span>
                </button>
              )}
            </>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
          >
            Tutup & Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
};
