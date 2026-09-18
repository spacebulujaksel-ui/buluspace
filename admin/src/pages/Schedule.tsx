import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Ban, Plus, Trash2, Calendar } from 'lucide-react';
import { api } from '../lib/api';
import { Appointment } from '../types';

interface Blocked {
  id: number;
  room_number: number;
  start_time: string;
  end_time: string;
}

interface ScheduleData {
  rooms_count: number;
  bookings: Appointment[];
  blocked: Blocked[];
}

const SLOT_START = 10 * 60;
const SLOT_END = 19 * 60;
const STEP = 30;

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const toLabel = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

const slotRows: { start: number; end: number }[] = [];
for (let m = SLOT_START; m < SLOT_END; m += STEP) {
  slotRows.push({ start: m, end: m + STEP });
}

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Schedule() {
  const [date, setDate] = useState(todayStr());
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blockStart, setBlockStart] = useState('12:00');
  const [blockEnd, setBlockEnd] = useState('13:00');
  const [blockRoom, setBlockRoom] = useState(1);
  const [savingBlock, setSavingBlock] = useState(false);
  const [blockError, setBlockError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api
      .get<ScheduleData>(`/admin/schedule?date=${date}`)
      .then((r) => setData(r))
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat jadwal.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [date]);

  const addBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBlock(true);
    setBlockError('');
    try {
      await api.post('/admin/schedule/block', { date, room_number: blockRoom, start_time: blockStart, end_time: blockEnd });
      load();
    } catch (err) {
      setBlockError(err instanceof Error ? err.message : 'Gagal memblokir jam.');
    } finally {
      setSavingBlock(false);
    }
  };

  const removeBlock = async (id: number) => {
    try {
      await api.delete(`/admin/schedule/block/${id}`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus blokir.');
    }
  };

  const capacity = data?.rooms_count ?? 0;

  const slotBookings = (start: number, end: number) =>
    (data?.bookings ?? []).filter((b) => {
      const bs = toMin(b.start_time);
      const be = toMin(b.end_time);
      return start < be && end > bs;
    });

  const slotBlockedRooms = (start: number, end: number) =>
    data?.blocked
      .filter((b) => {
        const bs = toMin(b.start_time);
        const be = toMin(b.end_time);
        return start < be && end > bs;
      })
      .map((b) => b.room_number) ?? [];

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
          />
        </label>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> Kosong</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-pink-100 border border-pink-300" /> Terisi</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300" /> Penuh</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-neutral-100 border border-neutral-300" /> Diblokir/Tutup</span>
        </div>
        {capacity > 0 && (
          <span className="text-[11px] text-neutral-400">Kapasitas {capacity} ruang</span>
        )}
      </div>

      {/* Block form */}
      <form onSubmit={addBlock} className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-white border border-neutral-200">
        <div>
          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Ruang</label>
          <select value={blockRoom} onChange={(e) => setBlockRoom(Number(e.target.value))} className="px-2.5 py-1.5 text-sm rounded-lg border border-neutral-200 bg-white">
            {Array.from({ length: capacity }, (_, i) => i + 1).map((r) => (
              <option key={r} value={r}>Ruang {r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Blokir mulai</label>
          <input type="time" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} className="px-2.5 py-1.5 text-sm rounded-lg border border-neutral-200" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Sampai</label>
          <input type="time" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} className="px-2.5 py-1.5 text-sm rounded-lg border border-neutral-200" />
        </div>
        <button type="submit" disabled={savingBlock} className="px-3 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60">
          {savingBlock ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Blokir Ruang ({date})
        </button>
        {blockError && <p className="w-full text-[11px] text-rose-600 italic">{blockError}</p>}
      </form>

      {/* Blocked list */}
      {data && data.blocked.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.blocked.map((b) => (
            <span key={b.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-600">
              <Ban className="w-3 h-3" />
              Ruang {b.room_number} · {b.start_time.slice(0, 5)} – {b.end_time.slice(0, 5)}
              <button onClick={() => removeBlock(b.id)} className="text-neutral-400 hover:text-rose-600" title="Hapus blokir">
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="text-center py-16 text-sm text-neutral-400">Memuat jadwal...</div>
        ) : !data ? (
          <div className="text-center py-16 text-sm text-neutral-400">Tidak ada data jadwal.</div>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider font-semibold text-neutral-400 w-24">Jam</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider font-semibold text-neutral-400">Ketersediaan</th>
              </tr>
            </thead>
            <tbody>
              {slotRows.map((slot, idx) => {
                const bookings = slotBookings(slot.start, slot.end);
                const blockedRooms = slotBlockedRooms(slot.start, slot.end);
                const uniqueBlocked = Array.from(new Set(blockedRooms));
                const available = capacity - uniqueBlocked.length;
                const isClosed = capacity > 0 && available <= 0;
                const isFull = capacity > 0 && bookings.length >= available;
                return (
                  <tr key={idx} className="border-b border-neutral-50 last:border-0 align-top">
                    <td className="px-4 py-2 text-[11px] text-neutral-400 font-mono whitespace-nowrap pt-3">
                      {toLabel(slot.start)} – {toLabel(slot.end)}
                    </td>
                    <td
                      className={`px-4 py-2 ${
                        isClosed
                          ? 'bg-neutral-100/70'
                          : isFull
                            ? 'bg-red-50'
                            : bookings.length > 0
                              ? 'bg-pink-50/60'
                              : 'bg-emerald-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        {isClosed && (
                          <span className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1">
                            <Ban className="w-3 h-3" /> Ditutup
                          </span>
                        )}
                        {uniqueBlocked.map((r) => (
                          <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-200/80 text-[10px] font-medium text-neutral-600">
                            <Ban className="w-3 h-3" /> Ruang {r} diblokir
                          </span>
                        ))}
                        {isFull && !isClosed && (
                          <span className="text-[11px] font-semibold text-red-700">Penuh ({bookings.length}/{available})</span>
                        )}
                        {bookings.length > 0 && (isClosed || uniqueBlocked.length === 0 || isFull) && (
                          <span className="text-[11px] text-neutral-400">{bookings.length} sesi</span>
                        )}
                      </div>
                      {bookings.length > 0 && (
                        <div className="mt-1.5 space-y-1">
                          {bookings.map((b) => (
                            <div key={b.id} className="rounded-lg bg-white border border-neutral-200 px-2.5 py-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[11px] font-semibold text-neutral-800 font-mono">{b.booking_code}</p>
                                <p className="text-[10px] text-neutral-400">{b.start_time.slice(0, 5)}–{b.end_time.slice(0, 5)}</p>
                              </div>
                              <p className="text-[11px] text-neutral-600">{b.customer_name}</p>
                              <p className="text-[10px] text-neutral-500">{b.therapist?.name ?? '—'}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {bookings.length === 0 && !isClosed && (
                        <span className="text-[11px] text-emerald-700">
                          {isFull ? 'Penuh' : uniqueBlocked.length > 0 ? `Tersedia ${available} ruang` : 'Kosong'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}