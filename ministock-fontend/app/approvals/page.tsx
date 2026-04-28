"use client";

import useSWR, { useSWRConfig } from 'swr';
import AppShell from '@/components/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import { useSession } from '@/components/SessionProvider';
import api from '@/lib/axios';
import type { StockRequest } from '@/lib/types';

const fetcher = (url: string) => api.get(url).then((response) => response.data);

export default function ApprovalsPage() {
  const { user } = useSession();
  const { mutate } = useSWRConfig();
  const { data: requests } = useSWR<StockRequest[]>(user ? '/requests' : null, fetcher);

  const queue = (requests ?? []).filter((request) => {
    if (user?.role === 'DEPARTMENT_MANAGER') return request.status === 'PENDING';
    if (user?.role === 'STORE_MANAGER') return ['WAITING_STORE_APPROVAL', 'WAITING_STOCK_CONFIRMATION'].includes(request.status);
    return ['PENDING', 'WAITING_STORE_APPROVAL', 'WAITING_STOCK_CONFIRMATION'].includes(request.status);
  });

  const handleDecision = async (requestId: string, decision: 'APPROVED' | 'REJECTED') => {
    const comment = window.prompt('Comment for this decision') || '';
    await api.patch(`/requests/${requestId}/decision`, { decision, comment });
    mutate('/requests');
    mutate('/dashboard/summary');
    mutate('/products');
  };

  const handleStockConfirmation = async (requestId: string) => {
    const comment = window.prompt('Comment for stock confirmation') || '';
    await api.patch(`/requests/${requestId}/stock-confirmation`, { comment });
    mutate('/requests');
    mutate('/dashboard/summary');
    mutate('/products');
  };

  return (
    <AppShell
      title="Approval Board"
      description="Department managers review first-stage requests and store managers finalize stock release."
    >
      {user?.role !== 'DEPARTMENT_MANAGER' && user?.role !== 'STORE_MANAGER' && user?.role !== 'ADMIN' ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          Your current role does not approve requests.
        </div>
      ) : (
        <section className="grid gap-5">
          {queue.map((request) => (
            <article key={request.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black text-slate-900">{request.product.name}</h2>
                    <StatusBadge value={request.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {request.requester.name} • {request.requester.department} • {request.type.replaceAll('_', ' ')} • {request.quantity} {request.product.unit}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">{request.reason || 'No additional reason provided.'}</p>
                </div>

                {request.status === 'WAITING_STOCK_CONFIRMATION' ? (
                  <div className="flex gap-3">
                    <button onClick={() => handleStockConfirmation(request.id)} className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700">
                      Confirm Stock Deduction
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => handleDecision(request.id, 'REJECTED')} className="rounded-lg border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50">
                      Reject
                    </button>
                    <button onClick={() => handleDecision(request.id, 'APPROVED')} className="rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700">
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}

          {!queue.length && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
              No approval items are waiting for your role right now.
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}
