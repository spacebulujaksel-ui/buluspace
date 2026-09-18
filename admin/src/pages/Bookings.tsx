import { useEffect, useState } from 'react';
import { Search, Filter, Eye, X, Check, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { formatRupiah, formatDate, formatDateTime } from '../data/helpers';
import { Appointment } from '../types';

const STATUS_OPTIONS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'] as const;

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700',
  Confirmed: 'bg-emerald-50 text-emerald-700',
  Completed: 'bg-sky-50 text-sky-700',
  Cancelled: 'bg-rose-50 text-rose-700',
  Rejected: 'bg-red-100 text-red-800',
};

export default function Bookings() {
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = () => fetchBookings(true);

  const fetchBookings = (showLoader: boolean) => {
    if (showLoader) setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (filter !== 'All') params.set('status', filter);
    if (search) params.set('search', search);
    api
      .get<{ bookings: Appointment[] }>(`/admin/bookings?${params}`)
      .then((r) => setBookings(r.bookings))
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat data.'))
      .finally(() => {
        if (showLoader) setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, [filter]);

  useEffect(() => {
    const timer = setInterval(() => fetchBookings(false), 30000);
    return () => clearInterval(timer);
  }, [filter, search]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(true);
    try {
      await api.put(`/admin/bookings/${id}/status`, { status });
      setSelected((s) => (s && s.id === id ? { ...s, status: status as Appointment['status'] } : s));
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengubah status.');
    } finally {
      setUpdating(false);
    }
  };

  const rejectBooking = async (id: number) => {
    setError('');
    setUpdating(true);
    try {
      await api.put(`/admin/bookings/${id}/status`, { status: 'Rejected' });
      setSelected((s) => (s && s.id === id ? { ...s, status: 'Rejected' as const } : s));
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menolak booking.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <form
          className="relative flex-1 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau kode booking... (Enter untuk cari)"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
          />
        </form>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-neutral-400 mr-0.5" />
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                filter === s ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500 border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {s === 'All' ? 'Semua' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-sm text-neutral-400">Memuat booking...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 text-sm">Tidak ada booking ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200">
                  {['Kode', 'Klien', 'Terapis', 'Jam', 'Layanan', 'Tanggal', 'Status', 'Total', 'Aksi'].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((apt) => (
                  <tr key={apt.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3.5 text-xs text-neutral-400 font-mono">{apt.booking_code}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13px] font-medium text-neutral-900">{apt.customer_name}</p>
                      <p className="text-[11px] text-neutral-400">{apt.customer_phone}</p>
                      {apt.customer_email && (
                        <p className="text-[11px] text-neutral-400">{apt.customer_email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-neutral-700">{apt.therapist?.name ?? '—'}</td>
                    <td className="px-4 py-3.5 text-[13px] text-neutral-500 whitespace-nowrap">
                      {apt.start_time.slice(0, 5)} – {apt.end_time.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3.5">
                      {apt.details?.length ? (
                        <div className="space-y-1">
                          {apt.details.map((d) => (
                            <p key={d.id} className="text-[13px] text-neutral-700 whitespace-nowrap">
                              {d.service?.name ?? `Layanan #${d.service_id}`}
                              <span className="text-neutral-400">
                                {' '}× {d.quantity} · {formatRupiah(Number(d.price))}
                              </span>
                            </p>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[13px] text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-neutral-500">{formatDate(apt.appointment_date)}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[apt.status] ?? 'bg-neutral-100 text-neutral-500'}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-50" />
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-neutral-900 font-mono">
                      {formatRupiah(Number(apt.total_price))}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setSelected(apt)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                        title="Lihat detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-8">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-neutral-200 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-100 sticky top-0 bg-white">
              <h3 className="text-sm font-bold text-neutral-900">{selected.booking_code}</h3>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 sm:px-6 py-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <p className="text-[11px] text-neutral-400 mb-1">Klien</p>
                <p className="text-sm font-medium text-neutral-900">{selected.customer_name}</p>
                <p className="text-xs text-neutral-500">{selected.customer_phone}</p>
                {selected.customer_email && (
                  <p className="text-xs text-neutral-500">{selected.customer_email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                  <p className="text-[11px] text-neutral-400 mb-1">Tanggal</p>
                  <p className="text-sm font-medium text-neutral-900">{formatDate(selected.appointment_date)}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                  <p className="text-[11px] text-neutral-400 mb-1">Jam</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {selected.start_time.slice(0, 5)} – {selected.end_time.slice(0, 5)}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <p className="text-[11px] text-neutral-400 mb-1">Terapis</p>
                <p className="text-sm font-medium text-neutral-900">{selected.therapist?.name ?? '—'}</p>
                {selected.location && (
                  <p className="text-[11px] text-neutral-500 mt-1">Lokasi: {selected.location}</p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <p className="text-[11px] text-neutral-400 mb-2">Layanan</p>
                {selected.details?.map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                      <span>
                        <span className="text-[13px] text-neutral-800">{d.service?.name ?? `Layanan #${d.service_id}`}</span>
                        {d.service?.duration_minutes != null && (
                          <span className="text-[11px] text-neutral-400 ml-1.5">
                            {d.service.duration_minutes} menit
                          </span>
                        )}
                        {d.quantity > 1 && (
                          <span className="text-[11px] text-neutral-400 ml-1.5">× {d.quantity}</span>
                        )}
                      </span>
                    </div>
                    <span className="text-[13px] font-mono text-neutral-600">{formatRupiah(Number(d.price))}</span>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-neutral-200 flex justify-between items-center">
                  <span className="text-xs font-semibold text-neutral-500">Total</span>
                  <span className="text-sm font-bold font-mono text-neutral-900">{formatRupiah(Number(selected.total_price))}</span>
                </div>
              </div>

              {selected.notes && (
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                  <p className="text-[11px] text-neutral-400 mb-1">Catatan</p>
                  <p className="text-[13px] text-neutral-700 italic">{selected.notes}</p>
                </div>
              )}

              {(selected.status === 'Cancelled' || selected.status === 'Rejected') && selected.cancel_reason && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                  <p className="text-[11px] text-rose-500 mb-1">
                    {selected.status === 'Rejected' ? 'Alasan Penolakan' : 'Alasan Pembatalan'}
                  </p>
                  <p className="text-[13px] text-rose-700 italic">{selected.cancel_reason}</p>
                </div>
              )}

              {selected.status === 'Pending' && (
                <div className="pt-2 border-t border-neutral-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(selected.id, 'Confirmed')}
                      disabled={updating}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <Check className="w-4 h-4" />
                      Konfirmasi
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Yakin menolak booking ini?')) rejectBooking(selected.id);
                      }}
                      disabled={updating}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <X className="w-4 h-4" />
                      Tolak
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-200">
                <p className="text-[11px] text-neutral-400 mb-2">Ubah Status</p>
                <div className="flex flex-wrap gap-2">
                  {['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      disabled={updating || selected.status === s}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors disabled:cursor-default ${
                        selected.status === s
                          ? 'bg-neutral-900 text-white'
                          : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-neutral-400">Dibuat: {formatDateTime(selected.created_at)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}