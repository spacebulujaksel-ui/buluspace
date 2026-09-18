import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Facility {
  title: string;
  description: string;
  images: string[];
}

// Tambah foto baru di sini — beberapa foto per kartu:
//   { title: "Nama", description: "Keterangan", images: ["/asset/img/a.jpg", "/asset/img/b.jpg"] }
// Jangan lupa taruh dulu file gambarnya di folder website/public/asset/img/
const facilities: Facility[] = [
  {
    title: "Lobby & Resepsionis",
    description: "Ruang tunggu nyaman dengan suasana tenang",
    images: ["/asset/img/resepsionis.jpg", "/asset/img/lobby-1.jpg", "/asset/img/lobby-2.jpg", "/asset/img/lobby-3.jpg"],
  },
  {
    title: "Kamar Treatment",
    description: "Ruangan privat & steril untuk kenyamanan maksimal",
    images: ["/asset/img/kamar.jpg", "/asset/img/kamar-2.jpg", "/asset/img/kamar-3.jpg"],
  },
  {
    title: "Sterilization Station",
    description: "Standar kebersihan tinggi dengan peralatan steril",
    images: ["/asset/img/steril.jpg"],
  },
  {
    title: "100% natural sugar",
    description: "Menggunakan 100% gula alami untuk hasil terbaik",
    images: ["/asset/img/premium.jpg", "/asset/img/premium-2.jpg"],
  },
];

const AUTO_SLIDE_MS = 3500;

function FacilityCard({ facility }: { facility: Facility }) {
  const [photo, setPhoto] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prev = () => setPhoto((i) => (i - 1 + facility.images.length) % facility.images.length);
  const next = () => setPhoto((i) => (i + 1) % facility.images.length);

  return (
    <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-xs hover:shadow-lg transition-shadow h-full flex flex-col">
      {facility.images.length === 1 ? (
        <div className="aspect-[4/3] bg-neutral-200 overflow-hidden">
          <img src={facility.images[0]} alt={facility.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className="relative aspect-[4/3] bg-neutral-200 overflow-hidden"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchMove={(e) => {
            if (touchStartX.current == null) return;
            const dx = e.touches[0].clientX - touchStartX.current;
            if (Math.abs(dx) > 40) {
              if (dx < 0) next();
              else prev();
              touchStartX.current = null;
            }
          }}
          onTouchEnd={() => {
            touchStartX.current = null;
          }}
        >
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${photo * 100}%)` }}
          >
            {facility.images.map((src, i) => (
              <img key={i} src={src} alt={`${facility.title} ${i + 1}`} className="w-full h-full shrink-0 object-cover" />
            ))}
          </div>
          <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-semibold rounded px-1.5 py-0.5">
            {photo + 1}/{facility.images.length}
          </span>
        </div>
      )}

      <div className="p-5 flex-1">
        <h3 className="text-base font-semibold text-neutral-900">{facility.title}</h3>
        <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">{facility.description}</p>

        {facility.images.length > 1 && (
          <div className="mt-3 flex items-center gap-1.5">
            {facility.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhoto(i)}
                aria-label={`Foto ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === photo ? "w-4 bg-neutral-900" : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const FacilityShowcase: React.FC = () => {
  const [perView, setPerView] = useState(() => (typeof window === "undefined" ? 2 : window.innerWidth >= 640 ? 2 : 1));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const pages = Math.max(1, facilities.length - perView + 1);
  const isSlideable = facilities.length > perView;

  useEffect(() => {
    const onResize = () => setPerView(window.innerWidth >= 640 ? 2 : 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setIndex((i) => Math.min(i, pages - 1));
  }, [pages]);

  useEffect(() => {
    if (paused || !isSlideable) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % pages), AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [paused, isSlideable, pages]);

  const goNext = () => setIndex((i) => (i + 1) % pages);
  const goPrev = () => setIndex((i) => (i - 1 + pages) % pages);

  return (
    <section id="fasilitas" className="py-16 sm:py-20 bg-white scroll-mt-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            Ruangan & Fasilitas
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Kami menjaga standar kebersihan dan kenyamanan terbaik
          </p>
        </div>

        {!isSlideable ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {facilities.map((facility) => (
              <div key={facility.title} className="h-full">
                <FacilityCard facility={facility} />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div
              className="overflow-hidden"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
              >
                {facilities.map((facility) => (
                  <div
                    key={facility.title}
                    className="shrink-0 px-2.5"
                    style={{ width: `${100 / perView}%` }}
                  >
                    <FacilityCard facility={facility} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={goPrev}
                aria-label="Slide sebelumnya"
                className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === index ? "w-5 bg-neutral-900" : "w-2 bg-neutral-300 hover:bg-neutral-400"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                aria-label="Slide berikutnya"
                className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};