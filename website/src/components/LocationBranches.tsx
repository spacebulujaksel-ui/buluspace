import React from "react";
import { MapPin, Clock, DoorClosed } from "lucide-react";

const branches = [
  {
    id: "jakbar",
    name: "Bulu Space Jakarta Barat",
    address:
      "Jl. Raya Kb. Jeruk No.8, RT.1/RW.3, Kb. Jeruk, Kec. Kb. Jeruk, Jakarta, DKI Jakarta 11530",
    hours: "10.00 — 19.00 WIB",
    mapsQuery: "Jl. Raya Kb. Jeruk No.8, Kb. Jeruk, Jakarta Barat 11530",
    totalRooms: 2,
  },
  {
    id: "jaksel",
    name: "Bulu Space Jakarta Selatan",
    address:
      "Jl. H. Syahrin No.3c 6, RT.7/RW.7, Gandaria Utara, Kebayoran Baru, South Jakarta, DKI Jakarta 12140",
    hours: "10.00 — 19.00 WIB",
    mapsQuery:
      "Jl. H. Syahrin No.3c 6, Gandaria Utara, Kebayoran Baru, Jakarta Selatan 12140",
    totalRooms: 5,
  },
];

export const LocationBranches: React.FC = () => {
  return (
    <section id="lokasi-cabang" className="py-16 sm:py-24 bg-neutral-50 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-medium text-pink-500 uppercase tracking-wider mb-2">
            Lokasi Cabang
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            Kunjungi Kami
          </h2>
          <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
            Dua cabang siap menyambut Anda dengan pengalaman waxing yang sama
            nyaman, higienis, dan privat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
            >
              {/* Google Maps */}
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(branch.mapsQuery)}&output=embed`}
                width="100%"
                height="260"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Google Maps ${branch.name}`}
                className="h-52 sm:h-64 w-full"
              />

              {/* Info */}
              <div className="p-5 space-y-3">
                <h3 className="text-sm font-semibold text-neutral-900">
                  {branch.name}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                  <span>{branch.address}</span>
                </p>
                <p className="text-xs text-neutral-500 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Setiap hari · {branch.hours}</span>
                </p>

                {/* ponytail: statis placeholder — ganti dengan nilai dari portal admin (API ketersediaan real-time) saat sudah tersedia */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-neutral-100">
                  <div className="flex items-center gap-2">
                    <DoorClosed className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] text-neutral-400">
                      {branch.totalRooms} kamar treatment
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Buka
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};