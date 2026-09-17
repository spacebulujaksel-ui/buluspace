import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, rows, rowKey, onRowClick, emptyMessage = 'Belum ada data.' }: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
        <Inbox className="w-8 h-8 mb-2" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-neutral-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-[11px] uppercase tracking-wider font-semibold text-neutral-400 ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-neutral-100 transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-neutral-50' : ''
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3.5 text-[13px] text-neutral-700 align-middle ${col.className ?? ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}