import React, { useState, useEffect, useRef } from "react";
import {
  Star,
  Heart,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { REVIEWS } from "../data/mockData";

export const Testimonials: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slidesToShow = 3;
  const maxSlide = Math.ceil(REVIEWS.length / slidesToShow) - 1;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, isPaused]);

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 50) {
      dx < 0 ? nextSlide() : prevSlide();
    }
  };

  return (
    <section id="ulasan" className="py-16 sm:py-24 bg-neutral-50 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-medium text-pink-500 uppercase tracking-wider mb-2">
            Ulasan Pelanggan
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            Apa Kata Mereka?
          </h2>
          <div className="mt-3 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-neutral-900">
                ⭐️ 4.5
              </span>
              <span className="text-sm text-neutral-500">(300+ ulasan)</span>
            </div>
            <p className="text-xs text-neutral-400">
              berdasarkan ulasan google maps
            </p>
          </div>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {/* Group reviews into slides of 3 */}
              {Array.from({
                length: Math.ceil(REVIEWS.length / slidesToShow),
              }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-1">
                    {REVIEWS.slice(
                      slideIndex * slidesToShow,
                      slideIndex * slidesToShow + slidesToShow,
                    ).map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-white rounded-xl border border-neutral-200 p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                              />
                            ))}
                          </div>
                          <p className="text-xs text-neutral-600 leading-relaxed italic">
                            "{rev.comment}"
                          </p>
                          {rev.therapistName && (
                            <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-1 text-[11px] text-pink-500">
                              <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />
                              <span>
                                Terapis:{" "}
                                <span className="font-medium">
                                  {rev.therapistName}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-neutral-900">
                              {rev.clientName}
                            </h4>
                            {rev.treatment && (
                              <p className="text-[10px] text-neutral-400">
                                {rev.treatment}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 text-[10px] text-emerald-600">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center hover:bg-neutral-50 transition-colors z-10 hidden md:flex"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center hover:bg-neutral-50 transition-colors z-10 hidden md:flex"
            aria-label="Next reviews"
          >
            <ChevronRight className="w-5 h-5 text-neutral-600" />
          </button>

          {/* Dot Indicators */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: maxSlide + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-200 rounded-full ${
                  currentSlide === index
                    ? "w-6 h-1.5 bg-neutral-800"
                    : "w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
