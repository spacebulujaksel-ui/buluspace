import { useState } from 'react';
import { api } from '../lib/api';
import { AdminUser } from '../types';

const TOKEN_KEY = 'bulu_admin_token';
const USER_KEY = 'bulu_admin_user';

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AdminUser) : null;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string, branchId: number): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await api.post<{ token: string; user: AdminUser }>('/admin/login', {
        email,
        password,
        branch_id: branchId,
      });
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setUser(res.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Terjadi kesalahan.' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout', {});
    } catch {
      /* token may already be invalid */
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return { user, login, logout, isAuthenticated: !!user };
}