import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { FAQ_ITEMS } from "../data/faq";

interface BranchOpt {
  id: number;
  name: string;
}

interface ChatMessage {
  id: number | string;
  sender: "customer" | "admin" | "bot";
  body: string;
}

const CUSTOMER_KEY = "bulu_chat_customer";

function isOfficeHours(): boolean {
  try {
    const wib = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Jakarta" }).format(new Date());
    const h = Number(wib);
    return h >= 10 && h < 19;
  } catch {
    return true;
  }
}

function matchFaq(input: string): string | null {
  const words = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\sà-ÿ]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3);
  const inputWords = new Set(words(input));
  if (inputWords.size < 2) return null;
  let best: { score: number; a: string } | null = null;
  for (const item of FAQ_ITEMS) {
    const qWords = words(item.q);
    const score = qWords.filter((w) => inputWords.has(w)).length;
    if (!best || score > best.score) best = { score, a: item.a };
  }
  if (best && best.score >= 2) return best.a;
  return null;
}

export const ChatBubble: React.FC<{ raised?: boolean }> = ({ raised = false }) => {
  const [open, setOpen] = useState(false);
  const [branches, setBranches] = useState<BranchOpt[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [branchId, setBranchId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [localBubbles, setLocalBubbles] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const lastIdRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<BranchOpt[]>("/branches").then(setBranches).catch(() => setBranches([]));
    try {
      const saved = localStorage.getItem(CUSTOMER_KEY);
      if (saved) {
        const c = JSON.parse(saved);
        setName(c.name ?? "");
        setPhone(c.phone ?? "");
        setBranchId(c.branchId ?? null);
        if (c.sessionId) setSessionId(c.sessionId);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (c: Record<string, unknown>) => {
    try {
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name, phone, branchId, ...c }));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!open || !sessionId) return;
    const t = setInterval(async () => {
      try {
        const r = await api.get<{ messages: ChatMessage[] }>(`/chats/${sessionId}/messages?after=${lastIdRef.current}`);
const merged = r.messages.filter((m) => Number(m.id) > lastIdRef.current);
        if (merged.length) lastIdRef.current = Math.max(lastIdRef.current, ...merged.map((m) => Number(m.id)));
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => String(m.id)));
          return [...prev, ...merged.filter((m) => !seen.has(String(m.id)))];
        });
      } catch {
        /* polling fails silently */
      }
    }, 10000);
    return () => clearInterval(t);
  }, [open, sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, localBubbles, open]);

  const start = async () => {
    if (!name.trim() || !phone.trim() || !branchId) return;
    setStarting(true);
    setError("");
    try {
      const r = await api.post<{ id: number; messages: ChatMessage[] }>("/chats", {
        branch_id: branchId,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
      });
      setSessionId(r.id);
      lastIdRef.current = Math.max(0, ...r.messages.map((m) => Number(m.id)));
      setMessages(r.messages);
      persist({ sessionId: r.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memulai chat.");
    } finally {
      setStarting(false);
    }
  };

  const startNew = async () => {
    setStarting(true);
    setError("");
    try {
      const r = await api.post<{ id: number; messages: ChatMessage[] }>("/chats", {
        branch_id: branchId,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        new: true,
      });
      setSessionId(r.id);
      lastIdRef.current = 0;
      setMessages([]);
      setLocalBubbles([]);
      persist({ sessionId: r.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memulai chat baru.");
    } finally {
      setStarting(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !sessionId || sending) return;
    setSending(true);
    setInput("");
    try {
      const r = await api.post<{ messages: ChatMessage[] }>(`/chats/${sessionId}/messages`, { body: text });
      const merged = r.messages.filter((m) => Number(m.id) > lastIdRef.current);
      if (merged.length) lastIdRef.current = Math.max(lastIdRef.current, ...merged.map((m) => Number(m.id)));
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => String(m.id)));
        return [...prev, ...merged.filter((m) => !seen.has(String(m.id)))];
      });

      const answer = matchFaq(text);
      if (answer) {
        setLocalBubbles((prev) => [...prev, { id: `faq-${Date.now()}`, sender: "bot", body: answer }]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengirim pesan.");
    } finally {
      setSending(false);
    }
  };

  const allMessages = [...messages, ...localBubbles];

  return (
    <>
      {open && (
        <div className={`fixed right-5 sm:right-6 z-40 w-[calc(100vw-40px)] max-w-sm h-[480px] max-h-[80vh] bg-white border border-neutral-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden ${raised ? "bottom-36" : "bottom-24"}`}>
          <div className="bg-emerald-600 text-white px-4 py-3 flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight">Bulu Space</p>
              <p className="text-[11px] text-emerald-100">Halo! Ada yang bisa dibantu?</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-emerald-100"
              aria-label="Tutup chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-neutral-50">
            {!sessionId ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Tulis nama & nomor WhatsApp kamu untuk memulai percakapan dengan admin Bulu Space.
                </p>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Nama</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama kamu"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Nomor WhatsApp</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Cabang</label>
                  <select
                    value={branchId ?? ""}
                    onChange={(e) => setBranchId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  >
                    <option value="">Pilih cabang</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                {error && <p className="text-[11px] text-rose-600">{error}</p>}
                <button
                  onClick={start}
                  disabled={starting || !name.trim() || !phone.trim() || !branchId}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {starting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
                  Mulai Chat
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-1">
                  <button
                    onClick={startNew}
                    disabled={starting}
                    className="text-[10px] text-neutral-400 underline hover:text-neutral-700 disabled:opacity-50"
                  >
                    Mulai Percakapan Baru
                  </button>
                </div>
                {!isOfficeHours() && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] rounded-xl px-3 py-2 mb-2">
                    Admin aktif 10.00–19.00 WIB — pesanmu akan dibalas pada jam operasional 🤍
                  </div>
                )}
                {allMessages.length === 0 && (
                  <div className="bg-white border border-neutral-200 rounded-xl p-3 text-xs text-neutral-500">
                    Tulis pertanyaanmu di bawah ini ya, admin akan membalas di sini 😊
                  </div>
                )}
                {allMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                        m.sender === "customer"
                          ? "bg-emerald-600 text-white rounded-br-sm"
                          : m.sender === "bot"
                            ? "bg-white border border-neutral-200 text-neutral-700 rounded-bl-sm"
                            : "bg-neutral-900 text-white rounded-bl-sm"
                      }`}
                    >
                      {m.body}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {sessionId && (
            <div className="p-3 border-t border-neutral-200 bg-white flex items-center gap-2 shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ketik pesan..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
              <button
                onClick={send}
                disabled={sending || !input.trim()}
                className="p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                aria-label="Kirim pesan"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed right-5 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group ${raised ? "bottom-28" : "bottom-5 sm:bottom-6"}`}
        aria-label="Chat"
        aria-expanded={open}
      >
        {open ? <X className="w-6 h-6 sm:w-7 sm:h-7" /> : <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />}
        <span className="absolute right-16 bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
          Chat
        </span>
      </button>
    </>
  );
};