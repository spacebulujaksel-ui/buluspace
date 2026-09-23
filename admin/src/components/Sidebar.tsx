import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  Users,
  Scissors,
  Megaphone,
  Mail,
  MessagesSquare,
  HelpCircle,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/chat', label: 'Chat', icon: MessagesSquare },
  { to: '/schedule', label: 'Jadwal', icon: CalendarRange },
  { to: '/therapists', label: 'Terapis', icon: Users },
  { to: '/services', label: 'Layanan', icon: Scissors },
  { to: '/promos', label: 'Promo', icon: Megaphone },
  { to: '/faqs', label: 'FAQ', icon: HelpCircle },
  { to: '/email', label: 'Email', icon: Mail },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-neutral-900/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-neutral-900 text-white flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-neutral-800">
          <img
            src="/asset/img/Bulu Space_Logo Icon-03.png"
            alt="BuluSpace"
            className="w-8 h-auto"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight text-white truncate">
              BuluSpace
            </p>
            <p className="text-[10px] text-neutral-400">Admin Panel</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-pink-500/15 text-pink-300'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral-800">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Lihat Website Customer →
          </a>
        </div>
      </aside>
    </>
  );
}