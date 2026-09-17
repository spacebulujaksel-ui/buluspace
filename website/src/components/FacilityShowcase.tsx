import React from "react";

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

export const FacilityShowcase: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white">
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
          {facilities.map((facility, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-neutral-200 overflow-hidden bg-white hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[4/3] bg-neutral-200 overflow-hidden">
                <img
                  src={facility.image}
                  alt={facility.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-neutral-900">
                  {facility.title}
                </h3>
                <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">
                  {facility.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
