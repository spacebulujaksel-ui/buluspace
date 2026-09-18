import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Tambah foto baru di sini, contoh:
//   { title: "Nama", description: "Keterangan", image: "/asset/img/nama-file.jpg" }
// Jangan lupa taruh dulu file gambarnya di folder website/public/asset/img/
const facilities = [
  {
    title: "Lobby & Resepsionis",
    description: "Ruang tunggu nyaman dengan suasana tenang",
    image: "/asset/img/resepsionis.jpg",
  },
  {
    title: "Kamar Treatment",
    description: "Ruangan privat & steril untuk kenyamanan maksimal",
    image: "/asset/img/kamar.jpg",
  },
  {
    title: "Sterilization Station",
    description: "Standar kebersihan tinggi dengan peralatan steril",
    image: "/asset/img/steril.jpg",
  },
  {
    title: "100% natural sugar",
    description: "Menggunakan 100% gula alami untuk hasil terbaik",
    image: "/asset/img/premium.jpg",
  },
];

const AUTO_SLIDE_MS = 3500;

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

  const renderCard = (facility: (typeof facilities)[number]) => (
    <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-xs hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="aspect-[4/3] bg-neutral-200 overflow-hidden">
        <img src={facility.image} alt={facility.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-5 flex-1">
        <h3 className="text-base font-semibold text-neutral-900">{facility.title}</h3>
        <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">{facility.description}</p>
      </div>
    </div>
  );

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
                {renderCard(facility)}
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
                    {renderCard(facility)}
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