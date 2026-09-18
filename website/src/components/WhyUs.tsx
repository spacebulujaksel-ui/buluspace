import React from 'react';
import { ShieldCheck, Sparkles, DoorClosed, Heart, CheckCircle2 } from 'lucide-react';
import { HYGIENE_PILLARS } from '../data/mockData';

const pillarIcons = [ShieldCheck, Sparkles, DoorClosed];

export const WhyUs: React.FC = () => {
  return (
    <section id="keunggulan" className="py-16 sm:py-24 bg-white scroll-mt-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-medium text-pink-500 uppercase tracking-wider mb-2">Keunggulan Bulu Space</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            Kenapa Memilih Bulu Space?
          </h2>
          <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
            Setiap detail dirancang untuk memanjakan kulit Anda dalam suasana privat yang tenang.
          </p>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HYGIENE_PILLARS.map((pillar, idx) => {
            const Icon = pillarIcons[idx];
            return (
              <div
                key={idx}
                className="p-5 rounded-xl bg-neutral-50 border border-neutral-100 hover:border-neutral-200 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-neutral-200 text-neutral-500 flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-1.5">{pillar.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{pillar.desc}</p>
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-1 text-[10px] text-neutral-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Jaminan Bulu Space</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* First Timer CTA */}
        <div className="mt-10 p-6 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Baru Pertama Kali?</h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Gunakan fitur <span className="font-medium text-neutral-700">Request Terapis</span> dan pilih
                kriteria "First-Timer Friendly" agar terapis mendampingi Anda.
              </p>
            </div>
          </div>
          <a
            href="#layanan"
            className="shrink-0 px-5 py-2.5 rounded-lg bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
          >
            Lihat Treatment
          </a>
        </div>
      </div>
    </section>
  );
};
