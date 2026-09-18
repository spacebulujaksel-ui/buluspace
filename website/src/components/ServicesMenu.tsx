import React, { useState, useRef } from 'react';
import { Check, Plus, AlertCircle } from 'lucide-react';
import { useData } from '../hooks/useData';
import { combinationError } from '../lib/combination';
import { WaxService } from '../types';

interface ServicesMenuProps {
  selectedServiceIds: string[];
  onToggleService: (serviceId: string) => void;
  onProceedToBooking: () => void;
}

export const ServicesMenu: React.FC<ServicesMenuProps> = ({
  selectedServiceIds,
  onToggleService,
  onProceedToBooking,
}) => {
  const { services: SERVICES } = useData();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [comboMsg, setComboMsg] = useState('');
  const comboMsgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'face', label: 'FACE' },
    { id: 'arms', label: 'ARMS' },
    { id: 'upper', label: 'UPPER' },
    { id: 'legs', label: 'LEGS' },
    { id: 'intimate', label: 'INTIMATE' },
    { id: 'package', label: 'PACKAGES' },
  ];

  const filteredServices = SERVICES.filter((s) =>
    activeCategory === 'all' ? true : s.category === activeCategory
  );

  const showComboMsg = (msg: string) => {
    setComboMsg(msg);
    if (comboMsgTimer.current) clearTimeout(comboMsgTimer.current);
    comboMsgTimer.current = setTimeout(() => setComboMsg(''), 3000);
  };

  const handleToggle = (service: WaxService) => {
    if (selectedServiceIds.includes(service.id)) {
      onToggleService(service.id);
      return;
    }
    const candidate = SERVICES.filter(
      (s) => selectedServiceIds.includes(s.id) || s.id === service.id,
    );
    const err = combinationError(
      candidate.map((s) => ({ name: s.name, category: s.category, duration: s.durationMinutes })),
    );
    if (err) {
      showComboMsg(err);
      return;
    }
    onToggleService(service.id);
  };

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const selectedCount = selectedServiceIds.length;
  const totalPrice = SERVICES.filter((s) => selectedServiceIds.includes(s.id)).reduce((acc, s) => acc + s.price, 0);

  return (
    <section id="layanan" className="py-16 sm:py-24 bg-white scroll-mt-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-medium text-pink-500 uppercase tracking-wider mb-2">Menu Treatment</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            Daftar Layanan Waxing
          </h2>
          <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
            Diformulasikan dengan teknik gentle pull minim nyeri, menggunakan bahan organik yang aman
            untuk semua jenis kulit.
          </p>
          <p className="mt-2 text-[11px] text-neutral-400">
            Khusus pria: tambahan Rp7.000 per perawatan.
          </p>

          {/* Category Tabs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {comboMsg && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {comboMsg}
            </p>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const isSelected = selectedServiceIds.includes(service.id);
            return (
              <div
                key={service.id}
                className={`rounded-xl p-5 transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-pink-50 border border-pink-200'
                    : 'bg-neutral-50 border border-transparent hover:border-neutral-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {service.isPopular && (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded bg-pink-100 text-pink-600 mb-1.5">
                          Populer
                        </span>
                      )}
                      <h3 className="text-sm font-semibold text-neutral-900">{service.name}</h3>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 shrink-0 font-mono">
                      {formatRupiah(service.price)}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">{service.description}</p>

                  <p className="mt-1.5 text-[11px] font-medium text-pink-600">
                    {service.durationMinutes} menit
                  </p>
                </div>

                <button
                  onClick={() => handleToggle(service)}
                  className={`mt-4 w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    isSelected
                      ? 'bg-pink-500 text-white hover:bg-pink-400'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {isSelected ? (
                    <><Check className="w-3 h-3" /> Terpilih</>
                  ) : (
                    <><Plus className="w-3 h-3" /> Pilih</>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Floating Tray */}
        {selectedCount > 0 && (
          <div className="fixed bottom-5 left-5 right-5 sm:left-auto sm:right-8 z-40 max-w-md w-full bg-white border border-neutral-200 shadow-lg rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] text-neutral-400">
                <span className="font-semibold text-neutral-700">{selectedCount}</span> layanan terpilih
              </p>
              <p className="text-base font-semibold text-neutral-900 font-mono">{formatRupiah(totalPrice)}</p>
            </div>
            <button
              onClick={onProceedToBooking}
              className="px-5 py-2.5 rounded-lg bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
            >
              Lanjut Booking
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
