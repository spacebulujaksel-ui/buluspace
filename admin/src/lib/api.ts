const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '');

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
      if (data?.errors && typeof data.errors === 'object') {
        const first = Object.values(data.errors as Record<string, string[]>)[0];
        if (first) message = first[0] ?? message;
      }
    } catch {
      /* ignore parse failure */
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

function token() {
  return localStorage.getItem('bulu_admin_token') ?? '';
}

export const api = {
  get: <T>(path: string) =>
    fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token()}` } }).then((r) => handle<T>(r)),

  post: <T>(path: string, body: unknown) =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(body),
    }).then((r) => handle<T>(r)),

  postForm: <T>(path: string, body: FormData) =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body,
    }).then((r) => handle<T>(r)),

  putForm: <T>(path: string, body: FormData) => {
    const fd = new FormData();
    body.forEach((v, k) => fd.append(k, v));
    fd.append('_method', 'PUT');
    return fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body: fd,
    }).then((r) => handle<T>(r));
  },

  put: <T>(path: string, body: unknown) =>
    fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(body),
    }).then((r) => handle<T>(r)),

  delete: (path: string) =>
    fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    }).then((r) => handle<{ message: string }>(r)),
};

export { ApiError };