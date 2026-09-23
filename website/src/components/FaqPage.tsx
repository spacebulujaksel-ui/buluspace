import React, { useState } from "react";
import { HelpCircle, ChevronDown, ArrowLeft } from "lucide-react";
import { useData } from "../hooks/useData";

export const FaqPage: React.FC = () => {
  const { faqs } = useData();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-24 bg-neutral-50 min-h-[70vh]">
      <div className="max-w-2xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500 mx-auto mb-4">
            <HelpCircle className="w-6 h-6" />
          </div>
          <p className="text-xs font-medium text-pink-500 uppercase tracking-wider mb-2">FAQ & Bantuan</p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            Pertanyaan Sering Diajukan
          </h1>
          <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
            Informasi seputar treatment, higienitas, & reservasi Bulu Space
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, index) => {
            const isExpanded = openIndex === index;
            return (
              <div
                key={item.id ?? index}
                className="border border-neutral-200 rounded-xl bg-white overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isExpanded ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-neutral-50 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <span className="text-sm font-semibold text-neutral-900 leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isExpanded ? "rotate-180 text-pink-500" : ""
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 whitespace-pre-line">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda
          </a>
        </div>
      </div>
    </section>
  );
};