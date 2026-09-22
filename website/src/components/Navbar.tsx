import React, { useState, useEffect } from "react";
import { Calendar, Menu, X, HelpCircle, Ticket } from "lucide-react";

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenTrack: () => void;
  onOpenFaq: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenTrack,
  onOpenFaq,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Promo", href: "#promo" },
    { label: "Keunggulan", href: "#keunggulan" },
    { label: "Layanan", href: "#layanan" },
    { label: "Outlet", href: "#lokasi-cabang" },
    { label: "Ruangan", href: "#fasilitas" },
    { label: "Ulasan", href: "#ulasan" },
  ];

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.hash = "#/";
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-sm border-b border-neutral-200 shadow-xs"
          : "bg-white border-b border-neutral-100"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-[1fr_auto_1fr] items-center h-14 sm:h-16">
        {/* Brand */}
        <a
          href="#"
          className="flex items-center gap-2.5 group justify-self-start col-start-1"
          aria-label="Bulu Space Homepage"
        >
          <img
            src="/asset/img/BULU SPACE_VERTICAL-01.png"
            alt="BuluSpace"
            className="w-20 h-auto"
          />
          {/* <div> */}
          {/* <span className="text-base font-semibold tracking-tight text-[#6A6A6A]"> */}
          {/* Bulu Space */}
          {/* </span> */}
          {/* </div> */}
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-neutral-500 col-start-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="hover:text-neutral-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2.5 justify-self-end col-start-3">
          <button
            onClick={onOpenTrack}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-1.5 text-[12px] font-medium"
            title="Lacak Booking"
          >
            <Ticket className="w-4 h-4" />
            <span className="hidden md:inline">Lacak Booking</span>
          </button>

          <button
            onClick={onOpenFaq}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-1.5 text-[12px] font-medium"
            title="FAQ & Bantuan"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden md:inline">FAQ</span>
          </button>

          <button
            onClick={onOpenBooking}
            className="px-4 py-1.5 text-[12px] font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3 h-3" />
            <span>Booking</span>
          </button>
        </div>

        {/* Mobile */}
        <div className="flex sm:hidden items-center gap-2 justify-self-end col-start-3">
          <button
            onClick={onOpenBooking}
            className="px-3 py-1.5 text-[11px] font-medium rounded-lg bg-neutral-900 text-white"
          >
            Booking
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-neutral-200 px-5 py-5 space-y-1">
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-neutral-600 hover:text-neutral-900 text-sm font-medium py-2.5 border-b border-neutral-100 last:border-0"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrack();
              }}
              className="w-full py-2.5 text-[12px] font-medium rounded-lg border border-neutral-200 text-neutral-700 flex items-center justify-center gap-2"
            >
              <Ticket className="w-3.5 h-3.5" />
              Lacak Booking
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-2.5 text-[12px] font-medium rounded-lg bg-neutral-900 text-white flex items-center justify-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              Reservasi Sekarang
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenFaq();
              }}
              className="w-full py-2.5 text-[12px] font-medium rounded-lg border border-neutral-200 text-neutral-700 flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ & Bantuan
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
