import { clsx } from 'clsx';

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold',
        value === 'COMPLETED' && 'border-emerald-200 bg-emerald-100 text-emerald-700',
        value === 'PENDING' && 'border-amber-200 bg-amber-100 text-amber-700',
        value === 'WAITING_STORE_APPROVAL' && 'border-blue-200 bg-blue-100 text-blue-700',
        value === 'WAITING_PICKUP_CONFIRMATION' && 'border-violet-200 bg-violet-100 text-violet-700',
        value === 'WAITING_STOCK_CONFIRMATION' && 'border-cyan-200 bg-cyan-100 text-cyan-700',
        value === 'REJECTED' && 'border-rose-200 bg-rose-100 text-rose-700',
        value === 'LOW_STOCK' && 'border-amber-200 bg-amber-100 text-amber-700',
        value === 'OUT_OF_STOCK' && 'border-rose-200 bg-rose-100 text-rose-700',
        value === 'IN_STOCK' && 'border-emerald-200 bg-emerald-100 text-emerald-700'
      )}
    >
      {value.replaceAll('_', ' ')}
    </span>
  );
}
