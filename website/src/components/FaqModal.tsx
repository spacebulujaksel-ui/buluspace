import React, { useState, useEffect } from "react";
import { X, HelpCircle, ChevronDown } from "lucide-react";

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQ_ITEMS = [
  {
    q: "Bagaimana cara memesan (booking) treatment waxing di Bulu Space?",
    a: "Pemesanan sangat mudah! Klik tombol 'Reservasi Sekarang' di website, pilih lokasi cabang (Jakarta Barat / Jakarta Selatan), tentukan layanan, tanggal, jam, dan terapis (opsional). Setelah konfirmasi, tiket reservasi Anda langsung terbit.",
  },
  {
    q: "Apakah waxing di Bulu Space sakit dan aman untuk kulit sensitif?",
    a: "Kami menggunakan wax premium jenis Gentle Film Hard Wax yang minim rasa sakit dan diformulasikan khusus aman untuk kulit sensitif. Terapis bersertifikasi kami terlatih menggunakan teknik khusus untuk kenyamanan maksimal.",
  },
  {
    q: "Apa yang perlu dipersiapkan sebelum melakukan treatment waxing?",
    a: "Pastikan panjang bulu minimal 0.5 cm (sekitar 2-3 minggu setelah cukur terakhir). Hindari eksfoliasi berat atau penggunaan retinol/lotion tebal 24 jam sebelum waxing agar hasil optimal.",
  },
  {
    q: "Bagaimana standar kebersihan & sterilisasi di Bulu Space?",
    a: "Higienitas adalah prioritas utama kami. Kami menerapkan standar medis 100% NO DOUBLE DIPPING (aplikator wax hanya dipakai 1x celup), penggunaan sprei/bed sheet sekali pakai, dan sanitasi alat & bilik privat setiap pergantian klien.",
  },
  {
    q: "Apakah bisa mengubah (reschedule) atau membatalkan jadwal booking?",
    a: "Bisa. Anda dapat melakukan reschedule atau pembatalan melalui fitur 'Cek Tiket Reservasi' di website atau langsung menghubungi Admin WhatsApp cabang terkait minimal 2 jam sebelum waktu treatment.",
  },
  {
    q: "Apa saja metode pembayaran yang diterima di studio Bulu Space?",
    a: "Kami menerima pembayaran tunai (Cash), Transfer Bank, QRIS (Gopay, OVO, ShopeePay, BCA, Mandiri, dll), serta Kartu Debit/Kredit langsung di lokasi studio saat hari treatment.",
  },
  {
    q: "Kalau setelah treatment muncul kemerahan, jerawat atau bintik-bintik kecil, gimana ya kak?",
    a: "Kemerahan, jerawat, atau bintik-bintik kecil setelah treatment bisa terjadi dan umumnya merupakan reaksi kulit terhadap treatment, terutama pada kulit yang sensitif ya kak. 🤍\n\nUntuk membantu menenangkan kulit, kakak bisa:\n\n* Oleskan aloe vera gel.\n* Hindari scrub atau eksfoliasi sementara.\n* Gunakan pakaian yang longgar agar tidak banyak gesekan.\n* Hindari air hangat pada area treatment.\n* Kurangi aktivitas yang membuat keringat berlebih sementara waktu.\n* Boleh dikompres air dingin.\n\nBiasanya reaksi kulit akan mereda seiring waktu ya kak. Semoga lekas membaik. ☺️🙏🏻",
  },
];

export const FaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-900/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-snug">
                Pertanyaan Sering Diajukan (FAQ)
              </h3>
              <p className="text-xs text-neutral-400">
                Informasi seputar treatment, higienitas, & reservasi Bulu Space
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Tutup modal FAQ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content / Accordion */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 divide-y-0">
          {FAQ_ITEMS.map((item, index) => {
            const isExpanded = openIndex === index;
            return (
              <div
                key={index}
                className="border border-neutral-800 rounded-xl bg-neutral-800/40 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isExpanded ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-neutral-800/80 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <span className="text-sm font-semibold text-white leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isExpanded ? "rotate-180 text-pink-400" : ""
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs text-neutral-300 leading-relaxed border-t border-neutral-800/50">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
