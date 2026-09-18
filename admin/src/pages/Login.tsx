import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { Branch } from '../types';
import { Lock, Mail, AlertCircle, Eye, EyeOff, MapPin, DoorOpen, ChevronLeft, Building2, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get<Branch[]>('/branches')
      .then(setBranches)
      .catch(() => setBranches([]))
      .finally(() => setLoadingBranches(false));
  }, []);

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;
    setError('');
    setLoading(true);
    const result = await login(email, password, selectedBranch.id);
    setLoading(false);
    if (result.ok) navigate('/dashboard', { replace: true });
    else setError(result.error ?? 'Terjadi kesalahan.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="/asset/img/Bulu Space_Logo Icon-04.png"
            alt="BuluSpace"
            className="w-12 h-auto mx-auto mb-3"
          />
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">BuluSpace Admin</h1>
          <p className="text-xs text-neutral-400 mt-1">
            {selectedBranch ? `Login ke cabang ${selectedBranch.name}` : 'Pilih cabang yang ingin Anda kelola'}
          </p>
        </div>

        {!selectedBranch ? (
          <div className="space-y-3">
            {loadingBranches ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Memuat cabang...
              </div>
            ) : branches.length === 0 ? (
              <p className="text-center py-10 text-sm text-neutral-400">Belum ada cabang terdaftar.</p>
            ) : (
              branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranch(b)}
                  className="w-full text-left bg-white border border-neutral-200 rounded-2xl p-5 hover:border-pink-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{b.name}</p>
                        {b.address && (
                          <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {b.address}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-full px-2.5 py-1">
                      <DoorOpen className="w-3 h-3" /> {b.rooms_count} kapasitas
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4">
            <button
              type="button"
              onClick={() => setSelectedBranch(null)}
              className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Ganti cabang
            </button>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-600">
              Masuk sebagai admin <strong>{selectedBranch.name}</strong>
              <span className="block text-[11px] text-neutral-400">{selectedBranch.rooms_count} kapasitas</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@buluspace.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-2.5 p-0.5 text-neutral-400 hover:text-neutral-600"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-60"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        )}

        {selectedBranch && selectedBranch.name === 'Jakarta Barat' && (
          <p className="mt-4 text-center text-[11px] text-neutral-400">
            Demo: admin@buluspace.com / admin123
          </p>
        )}
      </div>
    </div>
  );
}