import React, { useState, useEffect, useRef } from 'react';
import { Tag, Check, ArrowRight } from 'lucide-react';
import { useData } from '../hooks/useData';

interface PromoSliderProps {
  onClaimPromo: (promoCode: string, promoTitle: string) => void;
}

export const PromoSlider: React.FC<PromoSliderProps> = ({ onClaimPromo }) => {
  const { promos: PROMO_BANNERS } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
      }, 5500);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused]);

  const goTo = (index: number) => {
    setCurrentIndex((index + PROMO_BANNERS.length) % PROMO_BANNERS.length);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null || dragStartY.current === null) return;
    const dx = e.clientX - dragStartX.current;
    const dy = e.clientY - dragStartY.current;
    dragStartX.current = null;
    dragStartY.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      goTo(dx < 0 ? currentIndex + 1 : currentIndex - 1);
    }
  };

  // Temporarily hidden - promo code copy functionality
  // const handleCopyCode = (e: React.MouseEvent, code?: string) => {
  //   e.stopPropagation();
  //   if (!code) return;
  //   navigator.clipboard.writeText(code);
  //   setCopiedCode(code);
  //   setTimeout(() => setCopiedCode(null), 2500);
  // };

  return (
    <section
      id="promo"
      className="pt-20 pb-12 sm:pt-24 sm:pb-16 bg-white scroll-mt-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
            Promo Eksklusif
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5 hidden sm:block">Penawaran terbatas untuk kunjungan Anda</p>
        </div>

        {/* Carousel */}
        <div
          className="relative rounded-xl overflow-hidden min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] bg-neutral-900 cursor-grab active:cursor-grabbing touch-pan-y"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Sliding track */}
          <div className="absolute inset-0 flex">
            <div
              className="flex h-full w-full transition-transform duration-500 ease-out will-change-transform"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {PROMO_BANNERS.map((promo) => (
                <div key={promo.id} className="relative w-full h-full shrink-0">
                  {/* Full-card image */}
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {/* Readability overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/55 to-transparent"></div>
                  <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-neutral-900/70 to-transparent"></div>

                  {/* Content */}
                  <div className="relative z-10 p-7 sm:p-10 lg:p-12 flex flex-col h-full">
                    <div className="max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded bg-white/10 backdrop-blur-sm text-white border border-white/15">
                          {promo.tag}
                        </span>
                        {promo.discountBadge && (
                          <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded bg-pink-400/20 text-pink-200 border border-pink-300/30">
                            {promo.discountBadge}
                          </span>
                        )}
                      </div>

                      <h2 className="mt-5 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white leading-tight">
                        {promo.title}
                      </h2>
                      <p className="mt-2 text-sm font-medium text-pink-300">
                        {promo.highlightText}
                      </p>

                      <p className="mt-4 text-sm text-neutral-200 max-w-lg leading-relaxed">
                        {promo.description}
                      </p>

                      {/* Temporarily hidden - promo code copy button */}
                      {/* {promo.promoCode && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyCode(e, promo.promoCode)}
                          className="mt-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-xs text-neutral-100 hover:border-pink-300/50 transition-colors"
                          title="Klik untuk menyalin kode promo"
                        >
                          <Tag className="w-3.5 h-3.5 text-pink-300" />
                          <span className="font-mono">
                            Kode: <span className="font-bold text-white">{promo.promoCode}</span>
                          </span>
                          {copiedCode === promo.promoCode ? (
                            <span className="flex items-center gap-0.5 text-emerald-400 text-[10px] font-sans">
                              <Check className="w-3 h-3" /> Tersalin
                            </span>
                          ) : (
                            <span className="text-[11px] font-sans font-medium text-neutral-300 hover:text-pink-300">Salin</span>
                          )}
                        </button>
                      )} */}
                    </div>

                    {/* CTA row — pinned to bottom, sizes & positions tetap */}
                    <div className="mt-auto pt-10 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => onClaimPromo(promo.promoCode || '', promo.title)}
                        className="px-6 py-3 rounded-lg bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-100 transition-colors flex items-center gap-2 group"
                      >
                        <span>{promo.ctaText}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                      <a
                        href="#layanan"
                        className="px-4 py-3 rounded-lg text-sm font-medium text-neutral-200 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        Lihat Menu Treatment
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {PROMO_BANNERS.map((promo, idx) => (
            <button
              key={promo.id}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Banner promo ${idx + 1}`}
              className={`transition-all duration-200 rounded-full ${
                currentIndex === idx
                  ? 'w-6 h-1.5 bg-neutral-800'
                  : 'w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};