import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import { Faq as FaqItem } from '../types';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

const EMPTY: FaqItem = {
  id: 0,
  question: '',
  answer: '',
  is_active: true,
};

export default function Faq() {
  const [data, setData] = useState<FaqItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState<FaqItem>({ ...EMPTY });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get<{ faqs: FaqItem[] }>('/admin/faqs')
      .then((r) => setData(r.faqs))
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

  const openEdit = (f: FaqItem) => {
    setEditing(f);
    setForm({ ...f, is_active: !!f.is_active });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setError('');
    try {
      const body = { question: form.question.trim(), answer: form.answer.trim(), is_active: !!form.is_active };
      if (editing) {
        await api.put(`/admin/faqs/${editing.id}`, body);
      } else {
        await api.post('/admin/faqs', body);
      }
      setModalOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan.');
    }
  };

  const toggleActive = async (f: FaqItem) => {
    try {
      await api.put(`/admin/faqs/${f.id}`, {
        question: f.question,
        answer: f.answer,
        is_active: !f.is_active,
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengubah status.');
    }
  };

  const remove = async (f: FaqItem) => {
    if (!confirm(`Hapus FaqItem "${f.question}"?`)) return;
    try {
      await api.delete(`/admin/faqs/${f.id}`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus.');
    }
  };

  const statusBadge = (f: FaqItem) => (
    <button
      onClick={() => toggleActive(f)}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
        f.is_active
          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
      }`}
    >
      {f.is_active ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
      {f.is_active ? 'Aktif' : 'Nonaktif'}
    </button>
  );

  const actionButtons = (f: FaqItem) => (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={() => openEdit(f)}
        className="p-1.5 rounded-lg text-neutral-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
        title="Edit"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => remove(f)}
        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        title="Hapus"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
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
        <p className="text-sm text-neutral-500">{data.length} FaqItem</p>
        <Button onClick={openAdd}>
          <Plus className="w-3.5 h-3.5" />
          Tambah FaqItem
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-sm text-neutral-400">Memuat FaqItem...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 text-sm">Belum ada FaqItem.</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-200">
                    {['Pertanyaan', 'Jawaban', 'Status', 'Aksi'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((f) => (
                    <tr key={f.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors align-top">
                      <td className="px-4 py-3.5 text-[13px] font-medium text-neutral-900 max-w-[260px]">{f.question}</td>
                      <td className="px-4 py-3.5 text-[12px] text-neutral-500 whitespace-pre-line max-w-[340px]">{f.answer}</td>
                      <td className="px-4 py-3.5">{statusBadge(f)}</td>
                      <td className="px-4 py-3.5">{actionButtons(f)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-neutral-100">
              {data.map((f) => (
                <div key={f.id} className="px-4 py-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13px] font-medium text-neutral-900">{f.question}</p>
                    {actionButtons(f)}
                  </div>
                  <p className="text-[12px] text-neutral-500 whitespace-pre-line">{f.answer}</p>
                  {statusBadge(f)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal
        title={editing ? 'Edit FaqItem' : 'Tambah FaqItem'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Pertanyaan *</label>
            <input
              type="text"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Pertanyaan yang sering diajukan customer"
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Jawaban *</label>
            <textarea
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              rows={8}
              placeholder="Tulis jawaban. Gunakan * untuk bullet list."
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300 whitespace-pre-line"
            />
          </div>
          <div>
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
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>{editing ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}