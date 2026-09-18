import React, { useEffect, useRef, useState } from "react";

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

const INNER_AUTO_MS = 4000;

function FacilityCard({ facility }: { facility: Facility }) {
  const [photo, setPhoto] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const prev = () => setPhoto((i) => (i - 1 + facility.images.length) % facility.images.length);
  const next = () => setPhoto((i) => (i + 1) % facility.images.length);

  useEffect(() => {
    if (paused || facility.images.length <= 1) return;
    const timer = setInterval(next, INNER_AUTO_MS);
    return () => clearInterval(timer);
  }, [paused, facility.images.length]);

  return (
    <div
      className="rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-xs hover:shadow-lg transition-shadow h-full flex flex-col"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[4/3] bg-neutral-200 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${photo * 100}%)` }}
        >
          {facility.images.map((src, i) => (
            <img key={i} src={src} alt={`${facility.title} ${i + 1}`} className="w-full h-full shrink-0 object-cover" />
          ))}
        </div>
        {facility.images.length > 1 && (
          <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-semibold rounded px-1.5 py-0.5">
            {photo + 1}/{facility.images.length}
          </span>
        )}
        {facility.images.length > 1 && (
          <div
            className="absolute inset-0"
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
          />
        )}
      </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {facilities.map((facility) => (
            <div key={facility.title} className="h-full">
              <FacilityCard facility={facility} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};