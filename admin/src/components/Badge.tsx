import { ActiveStatus, BookingStatus } from '../types';

const STYLE_MAP: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Completed: 'bg-sky-50 text-sky-700 border-sky-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Inactive: 'bg-neutral-100 text-neutral-500 border-neutral-200',
};

interface BadgeProps {
  status: BookingStatus | ActiveStatus;
}

export function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${STYLE_MAP[status] ?? 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60" />
      {status}
    </span>
  );
}