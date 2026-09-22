import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import { Promo } from '../types';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { formatDate } from '../data/helpers';

const EMPTY: Promo = {
  id: 0, tag: '', title: '', highlight_text: '', description: '',
  discount_badge: '', valid_until: '', cta_text: 'BOOK NOW', promo_code: '',
  bg_gradient: 'from-slate-900 via-zinc-800 to-slate-900', accent_color: '#F472B6',
  image: '', is_active: true, sort_order: 0,
};

export default function Promos() {
  const [data, setData] = useState<Promo[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Promo | null>(null);
  const [form, setForm] = useState<Promo>({ ...EMPTY });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get<{ promos: Promo[] }>('/admin/promos')
      .then((r) => setData(r.promos))
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setImageFile(null);
    setPreview('');
    setModalOpen(true);
  };

  const openEdit = (p: Promo) => {
    setEditing(p);
    setForm({ ...p, is_active: !!p.is_active, valid_until: p.valid_until?.slice(0, 10) ?? '' });
    setImageFile(null);
    setPreview('');
    setModalOpen(true);
  };

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append('tag', form.tag);
    fd.append('title', form.title);
    fd.append('highlight_text', form.highlight_text ?? '');
    fd.append('description', form.description ?? '');
    fd.append('discount_badge', form.discount_badge ?? '');
    fd.append('valid_until', form.valid_until?.slice(0, 10) ?? '');
    fd.append('cta_text', form.cta_text ?? '');
    fd.append('promo_code', form.promo_code ?? '');
    fd.append('bg_gradient', form.bg_gradient ?? '');
    fd.append('accent_color', form.accent_color ?? '');
    fd.append('sort_order', String(form.sort_order ?? 0));
    fd.append('is_active', form.is_active ? '1' : '0');
    if (imageFile) fd.append('image', imageFile);
    return fd;
  };

  const handleSave = async () => {
    if (!form.tag.trim() || !form.title.trim()) return;
    setError('');
    try {
      if (editing) {
        await api.putForm(`/admin/promos/${editing.id}`, buildFormData());
      } else {
        await api.postForm('/admin/promos', buildFormData());
      }
      setModalOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan.');
    }
  };

  const toggleActive = async (p: Promo) => {
    const fd = new FormData();
    fd.append('tag', p.tag);
    fd.append('title', p.title);
    fd.append('highlight_text', p.highlight_text ?? '');
    fd.append('description', p.description ?? '');
    fd.append('discount_badge', p.discount_badge ?? '');
    fd.append('valid_until', p.valid_until?.slice(0, 10) ?? '');
    fd.append('cta_text', p.cta_text ?? '');
    fd.append('promo_code', p.promo_code ?? '');
    fd.append('bg_gradient', p.bg_gradient ?? '');
    fd.append('accent_color', p.accent_color ?? '');
    fd.append('sort_order', String(p.sort_order ?? 0));
    fd.append('is_active', p.is_active ? '0' : '1');
    try {
      await api.putForm(`/admin/promos/${p.id}`, fd);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengubah status.');
    }
  };

  const remove = async (p: Promo) => {
    if (!confirm(`Hapus promo "${p.title}"?`)) return;
    try {
      await api.delete(`/admin/promos/${p.id}`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus.');
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{data.length} promo banner</p>
        <Button onClick={openAdd}>
          <Plus className="w-3.5 h-3.5" />
          Tambah Promo
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-sm text-neutral-400">Memuat promo...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 text-sm">Belum ada promo.</div>
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200">
                  {['Gambar', 'Tag', 'Judul', 'Kode', 'Berlaku Sampai', 'Status', 'Aksi'].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3.5">
                      {p.image ? (
                        <img src={p.image} alt={p.title} className="w-20 h-12 object-cover rounded-lg border border-neutral-200" />
                      ) : (
                        <span className="text-[12px] text-neutral-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-neutral-900 text-white text-[10px] font-semibold uppercase tracking-wide">
                        {p.tag}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-neutral-900">{p.title}</td>
                    <td className="px-4 py-3.5 text-[12px] font-mono text-neutral-600">{p.promo_code ?? '—'}</td>
                    <td className="px-4 py-3.5 text-[13px] text-neutral-500">
                      {p.valid_until ? formatDate(p.valid_until) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                          p.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                        }`}
                      >
                        {p.is_active ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                        {p.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => remove(p)}
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
            {data.map((p) => (
              <div key={p.id} className="px-4 py-3.5 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="w-12 h-9 object-cover rounded-lg border border-neutral-200 shrink-0" />
                  ) : (
                    <div className="w-12 h-9 rounded-lg border border-dashed border-neutral-200 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-neutral-900 text-white text-[10px] font-semibold uppercase tracking-wide">
                        {p.tag}
                      </span>
                      <button
                        onClick={() => toggleActive(p)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                          p.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                        }`}
                      >
                        {p.is_active ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                        {p.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </div>
                    <p className="text-[13px] font-medium text-neutral-900 mt-1">{p.title}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => remove(p)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-[11px] text-neutral-500">
                  Kode: <span className="font-mono text-neutral-600">{p.promo_code ?? '—'}</span>
                  {p.valid_until && <> · Berlaku sampai {formatDate(p.valid_until)}</>}
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>

      <Modal
        title={editing ? 'Edit Promo' : 'Tambah Promo'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Tag *</label>
              <input
                type="text"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                placeholder="contoh: SPECIAL NEW CLIENT"
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Kode Promo</label>
              <input
                type="text"
                value={form.promo_code ?? ''}
                onChange={(e) => setForm({ ...form, promo_code: e.target.value.toUpperCase() })}
                placeholder="FIRSTBULU30"
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Judul *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Judul banner promo"
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Highlight Text</label>
              <input
                type="text"
                value={form.highlight_text ?? ''}
                onChange={(e) => setForm({ ...form, highlight_text: e.target.value })}
                placeholder="Diskon 30% All Services"
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Deskripsi</label>
              <textarea
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Badge Diskon</label>
              <input
                type="text"
                value={form.discount_badge ?? ''}
                onChange={(e) => setForm({ ...form, discount_badge: e.target.value })}
                placeholder="HEMAT 30%"
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Berlaku Sampai</label>
              <input
                type="date"
                value={form.valid_until ?? ''}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">CTA Text</label>
              <input
                type="text"
                value={form.cta_text ?? ''}
                onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Urutan</label>
              <input
                type="number"
                min={0}
                value={form.sort_order ?? 0}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Gambar Banner</label>
              {(preview || form.image) && (
                <img
                  src={preview || form.image || ''}
                  alt="Preview promo"
                  className="w-full max-h-40 object-cover rounded-xl border border-neutral-200 mb-2"
                />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setImageFile(f);
                  setPreview(f ? URL.createObjectURL(f) : '');
                }}
                className="w-full text-sm text-neutral-500 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-neutral-900 file:text-white file:text-xs file:font-semibold hover:file:bg-neutral-800"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                JPG/PNG/WebP, maks 4MB. {editing && 'Tanpa memilih file, gambar lama dipertahankan.'}
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Gradient BG</label>
              <input
                type="text"
                value={form.bg_gradient ?? ''}
                onChange={(e) => setForm({ ...form, bg_gradient: e.target.value })}
                placeholder="from-slate-900 via-zinc-800 to-slate-900"
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Accent Color</label>
              <input
                type="text"
                value={form.accent_color ?? ''}
                onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                placeholder="#F472B6"
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                <input
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 accent-pink-500"
                />
                Aktif / Tampil di website
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>{editing ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}