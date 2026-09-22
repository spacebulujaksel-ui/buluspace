import { useEffect, useRef, useState } from 'react';
import { MessagesSquare, AlertCircle, Send, Loader2, X } from 'lucide-react';
import { api } from '../lib/api';

interface ChatRow {
  id: number;
  customer_name: string;
  customer_phone: string;
  status: string;
  unread: number;
  last_message_at: string | null;
  created_at: string | null;
}

interface ChatMsg {
  id: number | string;
  sender: 'customer' | 'admin' | 'bot';
  body: string;
}

const fmtTime = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export default function Chat() {
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [selected, setSelected] = useState<ChatRow | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mobileDetail, setMobileDetail] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadList = () => {
    api
      .get<{ chats: ChatRow[] }>('/admin/chats')
      .then((r) => setChats(r.chats))
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat chat.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    const t = setInterval(loadList, 10000);
    return () => clearInterval(t);
  }, []);

  const openChat = async (c: ChatRow) => {
    setSelected(c);
    setMobileDetail(true);
    setError('');
    try {
      const r = await api.get<{ messages: ChatMsg[] }>(`/admin/chats/${c.id}`);
      setMessages(r.messages);
      setChats((prev) => prev.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal membuka chat.');
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  useEffect(() => {
    if (!selected) return;
    const t = setInterval(async () => {
      try {
        const r = await api.get<{ messages: ChatMsg[] }>(`/admin/chats/${selected.id}`);
        setMessages(r.messages);
      } catch {
        /* ignore */
      }
    }, 10000);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    return () => clearInterval(t);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const reply = async () => {
    const text = input.trim();
    if (!text || !selected || saving) return;
    setSaving(true);
    setInput('');
    try {
      const r = await api.post<{ created: ChatMsg }>(`/admin/chats/${selected.id}/messages`, { body: text });
      setMessages((prev) => [...prev, r.created]);
      loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengirim balasan.');
    } finally {
      setSaving(false);
    }
  };

  const closeSession = async () => {
    if (!selected) return;
    if (!window.confirm('Tutup sesi chat ini?')) return;
    try {
      await api.post(`/admin/chats/${selected.id}/close`, {});
      setSelected((s) => (s ? { ...s, status: 'closed' } : s));
      loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menutup sesi.');
    }
  };

  const listPane = (
    <div className="min-h-0">
      {chats.length === 0 ? (
        <div className="text-center py-16 text-neutral-400 text-sm">Belum ada percakapan.</div>
      ) : (
        <div className="divide-y divide-neutral-100 overflow-y-auto max-h-[70vh] md:max-h-none">
          {chats.map((c) => (
            <button
              key={c.id}
              onClick={() => openChat(c)}
              className={`w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors ${
                selected?.id === c.id ? 'bg-neutral-50' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-neutral-900 truncate">{c.customer_name}</p>
                {c.unread > 0 && (
                  <span className="shrink-0 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-pink-500 text-white text-[10px] font-bold">
                    {c.unread}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">{c.customer_phone}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    c.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {c.status === 'open' ? 'Aktif' : 'Tutup'}
                </span>
                <span className="text-[10px] text-neutral-400">{fmtTime(c.last_message_at ?? c.created_at)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const detailPane = selected ? (
    <div className="flex flex-col h-full min-h-0">
      <div className="border-b border-neutral-100 px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setMobileDetail(false)} className="md:hidden p-1.5 text-neutral-400 hover:text-neutral-700" aria-label="Kembali">
            <X className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">{selected.customer_name}</p>
            <p className="text-[11px] text-neutral-400">{selected.customer_phone}</p>
          </div>
        </div>
        {selected.status === 'open' && (
          <button
            onClick={closeSession}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
          >
            Tutup Sesi
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-neutral-50 min-h-[40vh] md:min-h-[55vh]">
        {messages.length === 0 && <p className="text-center text-xs text-neutral-400 py-10">Belum ada pesan.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                m.sender === 'customer'
                  ? 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-sm'
                  : m.sender === 'bot'
                    ? 'bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-br-sm italic'
                    : 'bg-neutral-900 text-white rounded-br-sm'
              }`}
            >
              {m.body}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-neutral-100 bg-white flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && reply()}
          placeholder="Ketik balasan..."
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
        <button
          onClick={reply}
          disabled={saving || !input.trim()}
          className="p-2.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50"
          aria-label="Kirim balasan"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  ) : (
    <div className="hidden md:flex flex-col items-center justify-center h-full py-16 text-neutral-400">
      <MessagesSquare className="w-8 h-8 mb-2" />
      <p className="text-sm">Pilih percakapan untuk membalas.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden h-auto">
        {loading ? (
          <div className="text-center py-16 text-sm text-neutral-400">Memuat chat...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] min-h-[60vh]">
            <div className="border-b md:border-b-0 md:border-r border-neutral-100 md:min-h-[60vh]">
              <div className="px-4 py-3 border-b border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-900">Chat Customer</h3>
                <p className="text-[11px] text-neutral-400">Polling otomatis tiap 10 detik</p>
              </div>
              <div className={mobileDetail ? 'hidden md:block' : ''}>{listPane}</div>
            </div>
            <div className={`${mobileDetail ? 'block' : 'hidden md:block'} min-h-0`}>{detailPane}</div>
          </div>
        )}
      </div>
    </div>
  );
}