import { useEffect, useState } from 'react';
import { Mail, AlertCircle, Save } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/Button';

const TEMPLATE_LABELS: Record<string, string> = {
  booking_confirmation: 'Konfirmasi Booking (Customer)',
  admin_notification: 'Notifikasi Booking Baru (Admin)',
  reminder_h1: 'Pengingat H-1',
  reminder_hours: 'Pengingat 30 Menit Sebelum',
  aftercare: 'Tata Cara Setelah Treatment',
  booking_cancelled: 'Pembatalan oleh Customer',
  booking_cancelled_by_studio: 'Pembatalan oleh Studio',
};

const PLACEHOLDERS = [
  '{{customer_name}}', '{{customer_phone}}', '{{customer_email}}', '{{booking_code}}',
  '{{date}}', '{{time}}', '{{branch}}', '{{therapist}}', '{{services}}', '{{total}}', '{{admin_wa}}',
  '{{cancel_reason}}',
];

export default function Email() {
  const [templates, setTemplates] = useState<Record<string, { subject: string; body: string }>>({});
  const [adminEmail, setAdminEmail] = useState('');
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get<{ templates: Record<string, { subject: string; body: string }>; admin_email: string; brand_logo_url: string }>('/admin/email-settings')
      .then((r) => {
        setTemplates(r.templates ?? {});
        setAdminEmail(r.admin_email ?? '');
        setBrandLogoUrl(r.brand_logo_url ?? '');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat pengaturan.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await api.put('/admin/email-settings', { templates, admin_email: adminEmail, brand_logo_url: brandLogoUrl });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
          Pengaturan email tersimpan.
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">Template & teks email otomatis</p>
        <Button onClick={save} disabled={saving || loading}>
          {saving ? 'Menyimpan...' : <><Save className="w-3.5 h-3.5" /> Simpan</>}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-neutral-400">Memuat pengaturan...</div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Email Admin (penerima notifikasi booking baru)</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full max-w-md px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">URL Logo (tampil di bagian atas email)</label>
              <input
                type="url"
                value={brandLogoUrl}
                onChange={(e) => setBrandLogoUrl(e.target.value)}
                placeholder="https://.../logo-bulu.png (kosongkan jika tidak ingin logo)"
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-neutral-500 bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2">
              <Mail className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <span>
                Placeholder yang bisa dipakai di subject/body:{' '}
                <span className="font-mono text-neutral-700">{PLACEHOLDERS.join('  ')}</span>
              </span>
            </div>
          </div>

          {Object.keys(TEMPLATE_LABELS).map((type) => (
            <div key={type} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
              <p className="text-xs font-bold text-neutral-800 uppercase tracking-wider">{TEMPLATE_LABELS[type]}</p>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={templates[type]?.subject ?? ''}
                  onChange={(e) => setTemplates((prev) => ({ ...prev, [type]: { ...prev[type], subject: e.target.value } }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Isi Email</label>
                <textarea
                  value={templates[type]?.body ?? ''}
                  onChange={(e) => setTemplates((prev) => ({ ...prev, [type]: { ...prev[type], body: e.target.value } }))}
                  rows={6}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300 font-mono text-xs"
                />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}