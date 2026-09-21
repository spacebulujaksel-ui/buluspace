import React from "react";
import {
  MapPin,
  Clock,
  Heart,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
import { buildWaLink, WA_JAKBAR, WA_JAKSEL } from "../lib/wa";

interface FooterProps {
  onOpenFaq?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenFaq }) => {
  const socialLinks = [
    {
      name: "Instagram",
      handle: "@bulu.space",
      href: "https://instagram.com/bulu.space",
    },
    {
      name: "TikTok",
      handle: "@bulu.space",
      href: "https://tiktok.com/@bulu.space",
    },
    {
      name: "Admin Jakarta Barat",
      handle: "+62 856-9171-7248",
      href: `https://wa.me/${WA_JAKBAR}`,
    },
    {
      name: "Admin Jakarta Selatan",
      handle: "+62 858-1133-1147",
      href: `https://wa.me/${WA_JAKSEL}`,
    },
  ];

  return (
    <footer id="lokasi" className="bg-neutral-900 text-neutral-400 pt-14 pb-8">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-10 border-b border-neutral-800">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <img
                src="/asset/img/Bulu Space_Logo Icon-03.png"
                alt="BuluSpace"
                className="w-8 h-auto"
              />
              <span className="text-base font-semibold text-white">
                BuluSpace
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs">
              Studio waxing profesional dengan terapis bersertifikasi resmi,
              higienitas medis 100%, dan kenyamanan bilik privat.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={buildWaLink("Halo Admin Bulu Space Jakarta Barat, saya mau konsultasi layanan waxing", "Jakarta Barat")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-xs font-medium transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp Jakarta Barat
              </a>
              <a
                href={buildWaLink("Halo Admin Bulu Space Jakarta Selatan, saya mau konsultasi layanan waxing", "Jakarta Selatan")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-xs font-medium transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp Jakarta Selatan
              </a>
            </div>
          </div>

          {/* Social */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300">
              Sosial Media
            </h4>
            <div className="space-y-1.5">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-1.5 text-xs hover:text-white transition-colors group"
                >
                  <div>
                    <span className="font-medium text-neutral-300 group-hover:text-white">
                      {item.name}
                    </span>
                    <span className="text-neutral-600 mx-1.5">·</span>
                    <span className="text-neutral-500">{item.handle}</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300">
              Lokasi Studio
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-medium text-neutral-300 flex items-center gap-1.5 mb-0.5">
                  <MapPin className="w-3 h-3 text-pink-400" />
                  Jakarta Barat
                </p>
                <p className="text-neutral-500">
                  Jl. Raya Kb. Jeruk No.8, Kb. Jeruk, Jakarta Barat 11530
                </p>
                <p className="text-[10px] text-neutral-600 mt-0.5">
                  10.00 — 19.00 WIB
                </p>
              </div>
              <div>
                <p className="font-medium text-neutral-300 flex items-center gap-1.5 mb-0.5">
                  <MapPin className="w-3 h-3 text-pink-400" />
                  Jakarta Selatan
                </p>
                <p className="text-neutral-500">
                  Jl. H. Syahrin No.3c 6, Gandaria Utara, Kebayoran Baru,
                  Jakarta Selatan 12140
                </p>
                <p className="text-[10px] text-neutral-600 mt-0.5">
                  10.00 — 19.00 WIB
                </p>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] uppercase tracking-wider font-semibold text-neutral-300">
              Jam Operasional
            </h4>
            <div className="flex items-start gap-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-neutral-300">Senin — Minggu</p>
                <p className="text-neutral-500">10.00 — 19.00 WIB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-3">
          <p>© 2026 Bulu Space (PT Ruang Mulus Nusantara)</p>
          <div className="flex items-center gap-4">
            <a
              href="#promo"
              className="hover:text-neutral-300 transition-colors"
            >
              Promo
            </a>
            <a
              href="#layanan"
              className="hover:text-neutral-300 transition-colors"
            >
              Harga
            </a>
            {onOpenFaq && (
              <button
                onClick={onOpenFaq}
                className="hover:text-neutral-300 transition-colors cursor-pointer"
              >
                FAQ & Bantuan
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
