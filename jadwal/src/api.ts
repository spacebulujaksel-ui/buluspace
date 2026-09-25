const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '');

export interface ScheduleEntry {
  id: number;
  branch: string | null;
  start_time: string;
  end_time: string;
  status: string;
  customer_name: string;
  therapist: string | null;
  services: string[];
}

export async function fetchScheduleBoard(date: string): Promise<ScheduleEntry[]> {
  const res = await fetch(`${API_BASE}/schedule-board?date=${date}`);
  if (!res.ok) throw new Error('Gagal memuat jadwal');
  const data = await res.json();
  return data.board;
}