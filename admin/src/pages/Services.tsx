import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Service, ActiveStatus } from '../types';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { formatRupiah } from '../data/helpers';

const CATEGORIES: Record<string, string> = {
  face: 'FACE',
  arms: 'ARMS',
  upper: 'UPPER',
  legs: 'LEGS',
  intimate: 'INTIMATE',
  package: 'PACKAGES',
};

const EMPTY: Service = {
  id: 0, name: '', description: '', price: 0, duration_minutes: 0,
  last_order_time: null, image: '', status: 'Active', category: 'face', wax_type: 'Gentle Film Hard Wax',
};

export default function Services() {
  const [data, setData] = useState<Service[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<Service>({ ...EMPTY });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get<{ services: Service[] }>('/admin/services')
      .then((r) => setData(r.services))
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ ...s, price: Number(s.price) });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || Number(form.price) <= 0) return;
    setError('');
    try {
      if (editing) {
        await api.put(`/admin/services/${editing.id}`, form);
      } else {
        await api.post('/admin/services', form);
      }
      setModalOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan.');
    }
  };

  const toggleStatus = async (s: Service) => {
    const next = s.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/admin/services/${s.id}`, { ...s, status: next });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengubah status.');
    }
  };

  const remove = async (s: Service) => {
    if (!confirm(`Hapus layanan "${s.name}"?`)) return;
    try {
      await api.delete(`/admin/services/${s.id}`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus.');
    }
  };

  const grouped = Object.entries(
    data.reduce<Record<string, Service[]>>((acc, s) => {
      const cat = s.category ?? 'other';
      (acc[cat] ??= []).push(s);
      return acc;
    }, {}),
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{data.length} layanan</p>
        <Button onClick={openAdd}>
          <Plus className="w-3.5 h-3.5" />
          Tambah Layanan
        </Button>
      </div>

      <div className="space-y-6">
        {loading && <div className="text-center py-16 text-sm text-neutral-400">Memuat layanan...</div>}
        {!loading && grouped.map(([cat, services]) => (
          <div key={cat}>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              {CATEGORIES[cat] ?? cat}
            </h3>
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      {['Nama', 'Deskripsi', 'Harga', 'Durasi', 'Wax Type', 'Status', 'Aksi'].map((h) => (
                        <th key={h} className="px-4 py-3 text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr key={s.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3.5 text-[13px] font-medium text-neutral-900">{s.name}</td>
                        <td className="px-4 py-3.5 text-[13px] text-neutral-500 max-w-[200px] truncate">{s.description || '—'}</td>
                        <td className="px-4 py-3.5 text-[13px] font-mono font-medium text-neutral-900">{formatRupiah(Number(s.price))}</td>
                        <td className="px-4 py-3.5 text-[13px] text-neutral-600">{s.duration_minutes} mnt</td>
                        <td className="px-4 py-3.5 text-[12px] text-neutral-500">{s.last_order_time ? String(s.last_order_time).slice(0,5)+' WIB' : '—'}</td>
                        <td className="px-4 py-3.5 text-[11px] text-neutral-400">{s.wax_type}</td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => toggleStatus(s)}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                              s.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-50" />
                            {s.status}
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(s)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => remove(s)}
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
                {services.map((s) => (
                  <div key={s.id} className="px-4 py-3.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-medium text-neutral-900">{s.name}</p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 cursor-pointer ${
                          s.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                        onClick={() => toggleStatus(s)}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-50" />
                        {s.status}
                      </span>
                    </div>
                    {s.description && <p className="text-[12px] text-neutral-500">{s.description}</p>}
                    <p className="text-[13px] font-mono font-medium text-neutral-900">{formatRupiah(Number(s.price))} · {s.duration_minutes} mnt</p>
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                      <span className="text-[11px] text-neutral-500">{s.wax_type}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => remove(s)}
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
            </div>
          </div>
        ))}
      </div>

      <Modal
        title={editing ? 'Edit Layanan' : 'Tambah Layanan'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Nama Layanan *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="contoh: Brazilian Waxing"
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Deskripsi singkat layanan"
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Harga (Rp) *</label>
              <input
                type="number"
                min={0}
                value={Number(form.price)}
                onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Durasi (menit)</label>
              <input
                type="number"
                min={0}
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Jam Order Terakhir</label>
              <input
                type="time"
                value={form.last_order_time ?? ''}
                onChange={(e) => setForm({ ...form, last_order_time: e.target.value || null })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
              />
              <p className="text-[10px] text-neutral-400 mt-1">Opsional. Kosongkan jika tidak ada batas.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
              >
                <option value="face">FACE</option>
                <option value="arms">ARMS</option>
                <option value="upper">UPPER</option>
                <option value="legs">LEGS</option>
                <option value="intimate">INTIMATE</option>
                <option value="package">PACKAGES</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Wax Type</label>
              <select
                value={form.wax_type}
                onChange={(e) => setForm({ ...form, wax_type: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
              >
                <option value="Gentle Film Hard Wax">Gentle Film Hard Wax</option>
                <option value="Organic Soft Honey">Organic Soft Honey</option>
                <option value="Soothing Treatment">Soothing Treatment</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ActiveStatus })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
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