import { useEffect, useState } from 'react';
import { Star, Trash2, Eye } from 'lucide-react';
import { api } from '../lib/api';
import { Review } from '../types';
import { Button } from '../components/Button';
import { formatDateTime } from '../data/helpers';

interface ReviewsResponse {
  reviews: Review[];
  stats: { total: number; avg_rating: number; five_star: number };
}

export default function Reviews() {
  const [data, setData] = useState<Review[]>([]);
  const [stats, setStats] = useState({ total: 0, avg_rating: 0, five_star: 0 });
  const [selected, setSelected] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get<ReviewsResponse>('/admin/reviews')
      .then((r) => {
        setData(r.reviews);
        setStats(r.stats);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number) => {
    if (!confirm('Hapus ulasan ini?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      if (selected?.id === id) setSelected(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus.');
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-[11px] text-neutral-400">Total Ulasan</p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-[11px] text-neutral-400">Rata-rata Rating</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xl font-semibold text-neutral-900">{stats.avg_rating}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <p className="text-[11px] text-neutral-400">Rating 5 Bintang</p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">
            {stats.five_star}
            <span className="text-sm text-neutral-400 font-normal ml-1">/ {stats.total}</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-sm text-neutral-400">Memuat ulasan...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 text-sm">Belum ada ulasan.</div>
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200">
                  {['Klien', 'Rating', 'Komentar', 'Tanggal', 'Aksi'].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="text-[13px] font-medium text-neutral-900">{r.customer_name}</p>
                      {r.therapist_name && <p className="text-[11px] text-neutral-400">{r.therapist_name}</p>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-neutral-600 max-w-[280px]">
                      <p className="line-clamp-2">{r.comment}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-neutral-400">{formatDateTime(r.created_at)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelected(r)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="Lihat detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => remove(r.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-neutral-100">
            {data.map((r) => (
              <div key={r.id} className="px-4 py-3.5 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-medium text-neutral-900">{r.customer_name}</p>
                    {r.therapist_name && <p className="text-[11px] text-neutral-400">{r.therapist_name}</p>}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}`}
                      />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-[12px] text-neutral-600 line-clamp-2">{r.comment}</p>}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                  <span className="text-[11px] text-neutral-400">{formatDateTime(r.created_at)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelected(r)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                      title="Lihat detail"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-8">
          <div className="bg-white rounded-2xl w-full max-w-md border border-neutral-200 shadow-2xl my-auto">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">Detail Ulasan</h3>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="px-5 sm:px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{selected.customer_name}</p>
                  <p className="text-[11px] text-neutral-400">{formatDateTime(selected.created_at)}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < selected.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}`}
                    />
                  ))}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <p className="text-[13px] text-neutral-700 leading-relaxed italic">"{selected.comment}"</p>
              </div>
              <div className="flex justify-end pt-2 border-t border-neutral-100">
                <Button variant="danger" onClick={() => remove(selected.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Ulasan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}