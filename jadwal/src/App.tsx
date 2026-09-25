import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { fetchScheduleBoard, ScheduleEntry } from './api';

const BRANCH_STYLES: Record<string, { header: string; card: string; dot: string }> = {
  'Jakarta Barat': { header: 'bg-blue-600', card: 'border-blue-200 bg-blue-50/60', dot: 'bg-blue-500' },
  'Jakarta Selatan': { header: 'bg-pink-600', card: 'border-pink-200 bg-pink-50/60', dot: 'bg-pink-500' },
};

const FALLBACK_STYLE = { header: 'bg-neutral-700', card: 'border-neutral-200 bg-neutral-50/60', dot: 'bg-neutral-500' };

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatDateLabel = (date: string) => {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
};

const CALENDAR_SRC = (import.meta.env.VITE_GOOGLE_CALENDAR_SRC as string | undefined) || '';

export default function App() {
  const [date, setDate] = useState(() => toDateStr(new Date()));
  const [board, setBoard] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locFilter, setLocFilter] = useState<'all' | 'Jakarta Barat' | 'Jakarta Selatan'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Confirmed' | 'Completed' | 'Cancelled'>('all');

  const load = (d: string) => {
    setLoading(true);
    setError('');
    fetchScheduleBoard(d)
      .then(setBoard)
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat jadwal.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(date);
  }, [date]);

  const shift = (days: number) => {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + days);
    setDate(toDateStr(d));
  };

  const grouped = useMemo(() => {
    const rows = board.filter(
      (e) =>
        (locFilter === 'all' || e.branch === locFilter) &&
        (statusFilter === 'all' || e.status === statusFilter),
    );
    const map = new Map<string, ScheduleEntry[]>();
    for (const e of rows) {
      const key = e.branch ?? 'Cabang Lain';
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [board, locFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800">
      <header className="bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/asset/img/Bulu Space_Logo Icon-04.png" alt="BuluSpace" className="w-8 h-auto" />
            <div>
              <p className="text-sm font-semibold tracking-tight">BuluSpace</p>
              <p className="text-[10px] text-neutral-400">Jadwal Terapis</p>
            </div>
          </div>
          <button onClick={() => load(date)} className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800" title="Muat ulang">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-6 space-y-5">
        {/* Date navigation */}
        <div className="flex items-center justify-center gap-3 bg-white border border-neutral-200 rounded-2xl p-3">
          <button onClick={() => shift(-1)} className="p-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-700" aria-label="Hari sebelumnya">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold">{formatDateLabel(date)}</p>
            <input
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="mt-0.5 text-xs text-neutral-400 bg-transparent focus:outline-none"
            />
          </div>
          <button onClick={() => shift(1)} className="p-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-700" aria-label="Hari berikutnya">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 bg-white border border-neutral-200 rounded-2xl p-3">
          <div className="text-xs text-neutral-400">Lokasi</div>
          <select
            value={locFilter}
            onChange={(e) => setLocFilter(e.target.value as typeof locFilter)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="all">Semua Cabang</option>
            <option value="Jakarta Barat">Jakarta Barat</option>
            <option value="Jakarta Selatan">Jakarta Selatan</option>
          </select>
          <div className="text-xs text-neutral-400">Status</div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="all">Semua</option>
            <option value="Confirmed">Belum Selesai</option>
            <option value="Completed">Selesai</option>
            <option value="Cancelled">Batal</option>
          </select>
          <span className="text-[11px] text-neutral-400">Menampilkan booking yang sudah di-acc admin</span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-sm text-neutral-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Memuat jadwal...
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-16 text-sm text-neutral-400">Tidak ada sesi pada tanggal ini.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grouped.map(([branch, entries]) => {
              const style = BRANCH_STYLES[branch] ?? FALLBACK_STYLE;
              return (
                <section key={branch} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                  <div className={`${style.header} px-4 py-2.5 flex items-center justify-between`}>
                    <h2 className="text-sm font-bold text-white">{branch}</h2>
                    <span className="text-[11px] text-white/80">{entries.length} sesi</span>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {entries.map((e) => (
  <div key={e.id} className={`px-4 py-3 border-l-4 ${style.card} ${(e.status === 'Cancelled' || e.status === 'Rejected') ? 'bg-red-50' : ''}`}>
    <p className="text-sm font-mono font-semibold">
      {e.start_time.slice(0, 5)} – {e.end_time.slice(0, 5)}
    </p>
     <p className="mt-1 text-[13px] font-medium text-neutral-900">{e.customer_name}</p>
     <p className="text-[12px] text-neutral-500">Terapis: {e.therapist ?? '—'}</p>
     <p className="text-[12px] text-neutral-500">{e.services.join(', ') || '—'}</p>
    {(e.status === 'Cancelled' || e.status === 'Rejected') && (
      <span className="mt-1 inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-semibold">
        Batal
      </span>
    )}
    {e.status === 'Completed' && (
      <span className="mt-1 inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
        Selesai
      </span>
    )}
  </div>
))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {CALENDAR_SRC && (
          <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-white">
            <div className="px-4 py-2.5 bg-neutral-900">
              <p className="text-sm font-semibold text-white">Kalender Google Perusahaan</p>
            </div>
            <iframe src={CALENDAR_SRC} title="Kalender Google" className="w-full h-[480px] border-0" />
          </div>
        )}
      </main>
    </div>
  );
}