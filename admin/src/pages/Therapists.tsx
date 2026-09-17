import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Therapist, ActiveStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

const EMPTY: Therapist = { id: 0, name: '', phone: '', photo: '', status: 'Active', specialty: '', experience_years: 0, room_number: null };

export default function Therapists() {
  const { user } = useAuth();
  const [data, setData] = useState<Therapist[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Therapist | null>(null);
  const [form, setForm] = useState<Therapist>({ ...EMPTY });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get<{ therapists: Therapist[] }>('/admin/therapists')
      .then((r) => setData(r.therapists))
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

  const openEdit = (t: Therapist) => {
    setEditing(t);
    setForm({ ...t });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    setError('');
    try {
      if (editing) {
        await api.put(`/admin/therapists/${editing.id}`, form);
      } else {
        await api.post('/admin/therapists', form);
      }
      setModalOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan.');
    }
  };

  const toggleStatus = async (t: Therapist) => {
    const next = t.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/admin/therapists/${t.id}`, { ...t, status: next });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengubah status.');
    }
  };

  const remove = async (t: Therapist) => {
    if (!confirm(`Hapus terapis "${t.name}"?`)) return;
    try {
      await api.delete(`/admin/therapists/${t.id}`);
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
        <p className="text-sm text-neutral-500">{data.length} terapis</p>
        <Button onClick={openAdd}>
          <Plus className="w-3.5 h-3.5" />
          Tambah Terapis
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-sm text-neutral-400">Memuat terapis...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200">
                  {['Nama', 'Telepon', 'Spesialisasi', 'Ruang', 'Status', 'Aksi'].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((t) => (
                  <tr key={t.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 text-sm font-semibold uppercase">
                          {t.name[0]}
                        </div>
                        <span className="text-[13px] font-medium text-neutral-900">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-neutral-600 font-mono">{t.phone}</td>
                    <td className="px-4 py-3.5 text-[13px] text-neutral-600">{t.specialty ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      {t.room_number ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-pink-50 border border-pink-200 text-[11px] font-medium text-pink-700">
                          Ruang {t.room_number}
                        </span>
                      ) : (
                        <span className="text-[12px] text-neutral-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleStatus(t)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                          t.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-50" />
                        {t.status}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => remove(t)}
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
        )}
      </div>

      <Modal
        title={editing ? 'Edit Terapis' : 'Tambah Terapis'}
        subtitle={editing ? `Mengedit data ${editing.name}` : 'Tambahkan terapis baru'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Nama Lengkap *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nama terapis"
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Telepon *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="08xxxxxxxxxx"
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Spesialisasi</label>
            <input
              type="text"
              value={form.specialty ?? ''}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              placeholder="contoh: Brazilian Expert"
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Ruang</label>
            <select
              value={form.room_number ?? ''}
              onChange={(e) => setForm({ ...form, room_number: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
            >
              <option value="">— Pilih Ruang —</option>
              {Array.from({ length: user?.branch?.rooms_count ?? 0 }, (_, i) => i + 1).map((r) => (
                <option key={r} value={r}>Ruang {r}</option>
              ))}
            </select>
            <p className="text-[10px] text-neutral-400 mt-1">Keterangan ruang {user?.branch?.name ?? ''}</p>
          </div>
          <div>
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
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>{editing ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}