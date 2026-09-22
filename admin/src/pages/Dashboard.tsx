import { useEffect, useState } from 'react';
import { Users, TrendingUp, Clock, AlertCircle, UserPlus, Trash2, Loader2, BarChart3, X } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { api } from '../lib/api';
import { formatDate } from '../data/helpers';
import { WalkIn } from '../types';

type ChartView = 'daily' | 'monthly' | 'yearly';

const CHART_META: Record<ChartView, { title: string; hint: string }> = {
  daily: { title: 'Customer Per Hari (Bulan Ini)', hint: 'Hari-hari di bulan berjalan' },
  monthly: { title: 'Customer Per Bulan (Tahun Ini)', hint: '12 bulan di tahun ini' },
  yearly: { title: 'Customer Per Tahun', hint: 'Semua tahun yang memiliki data' },
};

interface DashboardData {
  stats: {
    total_bookings: number;
    active_therapists: number;
    total_services: number;
    total_reviews: number;
    customers_today: number;
    online_today: number;
    walkin_today: number;
    customers_month: number;
    customers_year: number;
  };
  status_breakdown: Record<string, number>;
  cancellations_today: number;
  recent_bookings: BookingRow[];
  customer_series: {
    daily: { label: number; value: number }[];
    monthly: { label: string; value: number }[];
    yearly: { label: string; value: number }[];
  };
  walk_ins: WalkIn[];
}

interface BookingRow {
  id: number;
  booking_code: string;
  customer_name: string;
  customer_phone: string;
  appointment_date: string;
  status: string;
  total_price: string | number;
  therapist?: { name: string };
}

const STATUS_STYLES: Record<string, string> = {
  Confirmed: 'bg-emerald-50 text-emerald-700',
  Completed: 'bg-sky-50 text-sky-700',
  Cancelled: 'bg-rose-50 text-rose-700',
  Rejected: 'bg-red-100 text-red-800',
};

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};


export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  const [walkinOpen, setWalkinOpen] = useState(false);
  const [walkinDate, setWalkinDate] = useState(todayStr());
  const [walkinName, setWalkinName] = useState('');
  const [savingWalkin, setSavingWalkin] = useState(false);
  const [walkinError, setWalkinError] = useState('');
  const [chartView, setChartView] = useState<ChartView>('daily');

  const load = () => {
    api
      .get<DashboardData>('/admin/dashboard')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat data.'));
  };

  useEffect(load, []);

  const addWalkin = async () => {
    if (!walkinName.trim()) return;
    setSavingWalkin(true);
    setWalkinError('');
    try {
      await api.post('/admin/walk-ins', { date: walkinDate, customer_name: walkinName.trim() });
      setWalkinOpen(false);
      setWalkinName('');
      load();
    } catch (e) {
      setWalkinError(e instanceof Error ? e.message : 'Gagal menambah customer.');
    } finally {
      setSavingWalkin(false);
    }
  };

  const removeWalkin = async (w: WalkIn) => {
    if (!window.confirm(`Hapus customer offline "${w.customer_name}"?`)) return;
    try {
      await api.delete(`/admin/walk-ins/${w.id}`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus.');
    }
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    );
  }

  if (!data) {
    return <div className="text-sm text-neutral-400 py-12 text-center">Memuat data dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {data.cancellations_today > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{data.cancellations_today} pembatalan hari ini. Periksa daftar booking untuk melihat alasan.</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <Users className="w-4 h-4 text-pink-500" />
            Customer Hari Ini
          </div>
          <p className="text-2xl font-semibold tracking-tight text-neutral-900">{data.stats.customers_today}</p>
          <p className="text-[11px] text-neutral-400 mt-1">
            <span className="text-emerald-600">{data.stats.online_today} online</span> Â· {data.stats.walkin_today} walk-in
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Customer Bulan Ini
          </div>
          <p className="text-2xl font-semibold tracking-tight text-neutral-900">{data.stats.customers_month}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <TrendingUp className="w-4 h-4 text-sky-500" />
            Customer Tahun Ini
          </div>
          <p className="text-2xl font-semibold tracking-tight text-neutral-900">{data.stats.customers_year}</p>
        </div>
        <StatCard label="Terapis Aktif" value={data.stats.active_therapists} icon={Users} iconBg="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Add walk-in + recent list */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">
          Total Customer dihitung dari booking online (Confirmed/Completed) + customer offline manual.
        </p>
        <button
          onClick={() => setWalkinOpen(true)}
          className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold flex items-center gap-2 hover:bg-neutral-800 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Customer Offline
        </button>
      </div>

      {data.walk_ins.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900">Customer Offline Terbaru</h3>
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-100">
                  {['Tanggal', 'Nama', 'Aksi'].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-[11px] uppercase tracking-wider font-semibold text-neutral-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.walk_ins.map((w) => (
                  <tr key={w.id} className="border-b border-neutral-50 last:border-0">
                    <td className="px-5 py-3 text-[13px] text-neutral-500">{formatDate(w.date)}</td>
                    <td className="px-5 py-3 text-[13px] font-medium text-neutral-900">{w.customer_name}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => removeWalkin(w)} className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50" title="Hapus">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-neutral-100">
            {data.walk_ins.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-2 px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-neutral-900">{w.customer_name}</p>
                  <p className="text-[11px] text-neutral-400">{formatDate(w.date)}</p>
                </div>
                <button onClick={() => removeWalkin(w)} className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50" title="Hapus">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-neutral-900">{CHART_META[chartView].title}</p>
          <div className="flex items-center gap-2">
            <select
              value={chartView}
              onChange={(e) => setChartView(e.target.value as ChartView)}
              className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="daily">Per Hari</option>
              <option value="monthly">Per Bulan</option>
              <option value="yearly">Per Tahun</option>
            </select>
            <BarChart3 className="w-4 h-4 text-neutral-300" />
          </div>
        </div>
        {(() => {
          const series = data.customer_series[chartView];
          const max = Math.max(1, ...series.map((s) => s.value));
          return (
            <>
              <div className="flex items-end gap-1 h-44">
                {series.map((s, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1 group" title={`${s.label}: ${s.value} customer`}>
                    <span className="text-[10px] text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">{s.value}</span>
                    <div
                      className="w-full max-w-8 rounded-t bg-pink-400/80 group-hover:bg-pink-500 transition-colors"
                      style={{ height: `${Math.max(4, (s.value / max) * 100)}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-1 mt-2">
                {series.map((s, i) => {
                  const show = chartView === 'daily'
                    ? (i % 5 === 0 || i === series.length - 1)
                    : true;
                  return (
                    <span key={i} className={`flex-1 text-center text-[9px] truncate ${show ? 'text-neutral-400' : 'text-transparent'}`}>
                      {s.label}
                    </span>
                  );
                })}
              </div>
              <p className="text-[10px] text-neutral-300 mt-2">{CHART_META[chartView].hint}</p>
            </>
          );
        })()}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Booking Terbaru</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">8 booking terakhir</p>
          </div>
          <Clock className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-100">
                {['Kode', 'Klien', 'Terapis', 'Tanggal', 'Status', 'Total'].map((h) => (
                  <th key={h} className="px-5 py-2.5 text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recent_bookings.map((apt) => (
                <tr key={apt.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-5 py-3.5 text-xs text-neutral-400 font-mono">{apt.booking_code}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-medium text-neutral-900">{apt.customer_name}</p>
                    <p className="text-[11px] text-neutral-400">{apt.customer_phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-neutral-700">{apt.therapist?.name ?? 'â€”'}</td>
                  <td className="px-5 py-3.5 text-[13px] text-neutral-500">{formatDate(apt.appointment_date)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[apt.status] ?? ''}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-50" />
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-neutral-900 font-mono">
                    {formatRupiah(Number(apt.total_price))}
                  </td>
                </tr>
              ))}
            </tbody>
</table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-neutral-100">
            {data.recent_bookings.map((apt) => (
              <div key={apt.id} className="px-5 py-3.5 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-mono font-semibold text-neutral-800">{apt.booking_code}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${STATUS_STYLES[apt.status] ?? ''}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-50" />
                    {apt.status}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-neutral-900">{apt.customer_name}</p>
                <p className="text-[11px] text-neutral-500">
                  {formatDate(apt.appointment_date)} · {apt.therapist?.name ?? '—'}
                </p>
                <p className="text-[13px] font-medium font-mono text-neutral-900">{formatRupiah(Number(apt.total_price))}</p>
              </div>
            ))}
          </div>
        </div>

      {/* Walk-in Modal */}
      {walkinOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm border border-neutral-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Tambah Customer Offline</h3>
              <button onClick={() => setWalkinOpen(false)} className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Tanggal</label>
              <input type="date" value={walkinDate} onChange={(e) => setWalkinDate(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Nama Customer *</label>
              <input type="text" value={walkinName} onChange={(e) => setWalkinName(e.target.value)} placeholder="Nama customer offline" className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300" />
            </div>
            {walkinError && <p className="text-[11px] text-rose-600 italic">{walkinError}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setWalkinOpen(false)} className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-600 text-xs font-semibold">
                Batal
              </button>
              <button onClick={addWalkin} disabled={savingWalkin || !walkinName.trim()} className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-60">
                {savingWalkin ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatRupiah(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
}