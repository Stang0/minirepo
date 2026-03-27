"use client";

import useSWR from 'swr';
import AppShell from '@/components/AppShell';
import { useSession } from '@/components/SessionProvider';
import api from '@/lib/axios';
import type { StockRequest } from '@/lib/types';

const fetcher = (url: string) => api.get(url).then((response) => response.data);

export default function DashboardPage() {
  const { user } = useSession();
  const { data: summary } = useSWR(user ? '/dashboard/summary' : null, fetcher);
  const { data: requests } = useSWR<StockRequest[]>(user ? '/requests' : null, fetcher);

  const cards = [
    { label: 'Total Items', value: summary?.products ?? 0, icon: 'inventory_2', accent: 'bg-blue-50 text-primary' },
    { label: 'Low Stock Alerts', value: summary?.lowStock ?? 0, icon: 'warning', accent: 'bg-amber-50 text-amber-600' },
    { label: 'Completed Requests', value: summary?.completed ?? 0, icon: 'task_alt', accent: 'bg-emerald-50 text-emerald-600' }
  ];

  return (
    <AppShell
      title="Inventory Overview"
      description="Manage your stock, track inventory levels, and monitor the current approval flow."
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">{card.label}</p>
              <div className={`rounded-lg p-2 ${card.accent}`}>
                <span className="material-symbols-outlined">{card.icon}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Pending Department Approval</p>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <span className="material-symbols-outlined">hourglass_top</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{summary?.pendingApprovals ?? 0}</p>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Waiting Store Approval</p>
            <div className="rounded-lg bg-blue-50 p-2 text-primary">
              <span className="material-symbols-outlined">inventory</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{summary?.waitingStoreApprovals ?? 0}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Requests</h2>
          <p className="mt-1 text-sm text-slate-500">Current signed-in user: {user?.name} • {user?.role.replaceAll('_', ' ')} • {user?.department}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Requester</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Product</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Qty</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {requests?.slice(0, 6).map((request) => (
                <tr key={request.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{request.requester.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{request.product.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{request.type.replaceAll('_', ' ')}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{request.quantity}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{request.status.replaceAll('_', ' ')}</td>
                </tr>
              ))}
              {!requests?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No requests yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
