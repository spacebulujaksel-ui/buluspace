import { Menu, LogOut, MapPin } from 'lucide-react';
import { AdminUser } from '../types';

interface HeaderProps {
  title: string;
  user: AdminUser | null;
  onOpenSidebar: () => void;
  onLogout: () => void;
}

export function Header({ title, user, onOpenSidebar, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-neutral-200 flex items-center gap-3 px-4 sm:px-6">
      <button
        onClick={onOpenSidebar}
        className="lg:hidden p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
        aria-label="Buka menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-sm sm:text-base font-semibold tracking-tight text-neutral-900">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-3">
        {user?.branch && (
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-full px-2.5 py-1">
            <MapPin className="w-3 h-3 text-pink-500" />
            {user.branch.name} · {user.branch.rooms_count} kapasitas
          </span>
        )}
        <div className="hidden sm:block text-right">
          <p className="text-xs font-medium text-neutral-900">{user?.name}</p>
          <p className="text-[10px] text-neutral-400">{user?.email}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 text-sm font-semibold uppercase">
          {user?.name?.[0]}
        </div>
        <button
          onClick={onLogout}
          className="p-2 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}