import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconBg?: string;
  sublabel?: string;
}

export function StatCard({ label, value, icon: Icon, iconBg = 'bg-pink-50 text-pink-600', sublabel }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 flex items-start justify-between gap-3">
      <div>
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight text-neutral-900">
          {value}
        </p>
        {sublabel && <p className="mt-1 text-[11px] text-neutral-400">{sublabel}</p>}
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
    </div>
  );
}